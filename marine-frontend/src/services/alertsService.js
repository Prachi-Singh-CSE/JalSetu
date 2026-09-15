import { apiGet, apiPatch } from "./api";

export function normalizeAlert(alert = {}) {
  return {
    ...alert,
    id: alert.id || `alert-${Date.now()}`,
    type: alert.type || "HAZARD",
    severity: alert.severity || "Low",
    title: alert.title || "Marine alert",
    message: alert.message || "",
    location: alert.location || "Unknown",
    time: alert.time || alert.timestamp || new Date().toISOString(),
    timestamp: alert.time || alert.timestamp || new Date().toISOString(),
    recommendedAction: alert.recommendedAction || "",
    status: alert.status || "active",
    acknowledged: Boolean(alert.acknowledged),
    read: Boolean(alert.read),
    sources: Array.isArray(alert.sources) ? alert.sources : [],
    mapPath: alert.mapPath || "/map",
  };
}

export async function fetchLiveAlerts(lat, lon) {
  const json = await apiGet(`/api/alerts?lat=${lat}&lon=${lon}`);
  const data = json.data || {};

  return {
    ...data,
    alerts: Array.isArray(data.alerts) ? data.alerts.map(normalizeAlert) : [],
  };
}

export async function updateAlertState(id, action) {
  return apiPatch(`/api/alerts/${encodeURIComponent(id)}/${action}`);
}

export function backendUnavailableAlert() {
  return normalizeAlert({
    id: "source-backend",
    type: "DATA_SOURCE_UNAVAILABLE",
    severity: "Low",
    title: "Marine API unavailable",
    message:
      "The alert service could not be reached. Live condition alerts are not available.",
    location: "Platform",
    recommendedAction: "Start the backend and refresh this page.",
    sources: ["Marine API"],
    mapPath: "/intelligence",
  });
}

function alertRecord({
  id,
  type,
  severity,
  title,
  message,
  location,
  action,
  mapPath,
  sources,
}) {
  return {
    id,
    type,
    severity,
    title,
    message,
    location,
    timestamp: "Demo feed · 22 min ago",
    recommendedAction: action,
    mapPath,
    sources,
    status: "active",
    read: false,
    acknowledged: false,
  };
}

function getSeverity(level) {
  const order = {
    INFO: 1,
    CAUTION: 2,
    WARNING: 3,
    CRITICAL: 4,
  };

  return order[level] || 1;
}

export function evaluateMarineAlerts(marineData = {}, dataSourceHealth = { sources: [] }, imbl) {
  const alerts = [];

  const ocean = marineData.ocean || {};
  const hazards = Array.isArray(marineData.hazards) ? marineData.hazards : [];
  const vessels = Array.isArray(marineData.vessels) ? marineData.vessels : [];

  const wind = Number.parseFloat(ocean.wind) || 0;
  const waves = Number.parseFloat(ocean.waveHeight) || 0;
  const lightning = Boolean(ocean.lightning);
  const cyclone = Boolean(ocean.cyclone);

  // --------------------------------------------------
  // WEATHER / OCEAN ALERTS
  // --------------------------------------------------

  if (cyclone) {
    alerts.push(
      alertRecord({
        id: "cyclone-ar14",
        type: "CYCLONE",
        severity: "CRITICAL",
        title: "Cyclone-related marine risk",
        message:
          "Cyclone conditions are present in the demo marine dataset. Departure should be avoided until conditions are reassessed.",
        location: "Sector AR-14",
        action: "Review the risk assessment and avoid departure during severe conditions.",
        mapPath: "/map?focus=hazard",
        sources: ["IMD / Weather", "Ocean Data"],
      })
    );
  }

  if (lightning) {
    alerts.push(
      alertRecord({
        id: "lightning-ar14",
        type: "LIGHTNING",
        severity: "WARNING",
        title: "Lightning risk detected",
        message:
          "Lightning activity is present in the current demo marine conditions.",
        location: "Sector AR-14",
        action: "Avoid exposed areas and review the latest safety conditions before departure.",
        mapPath: "/map?focus=hazard",
        sources: ["IMD / Weather"],
      })
    );
  }

  if (waves >= 1.5) {
    alerts.push(
      alertRecord({
        id: "high-waves-ar14",
        type: "HIGH_WAVES",
        severity: waves >= 2.5 ? "WARNING" : "CAUTION",
        title: "High-wave conditions along route",
        message: `${ocean.waveHeight} waves are present along the recommended route.`,
        location: "Sector AR-14",
        action: "Use the safer route and monitor conditions.",
        mapPath: "/map?focus=hazard",
        sources: ["IMD / Weather", "Ocean Data"],
      })
    );
  }

  if (wind >= 15) {
    alerts.push(
      alertRecord({
        id: "strong-wind-ar14",
        type: "STRONG_WIND",
        severity: wind >= 30 ? "WARNING" : "CAUTION",
        title: "Strong wind conditions",
        message: `${ocean.wind} wind is recorded near the current route.`,
        location: "Sector AR-14",
        action: "Check the risk assessment before departure.",
        mapPath: "/intelligence",
        sources: ["IMD / Weather"],
      })
    );
  }

  // --------------------------------------------------
  // MARINE HAZARDS
  // --------------------------------------------------

  hazards.forEach((hazard) => {
    const isOilSlick = hazard.type === "Oil Slick";

    alerts.push(
      alertRecord({
        id: `hazard-${hazard.id}`,
        type: isOilSlick ? "OIL_SLICK" : "HAZARD",
        severity:
          hazard.severity === "critical"
            ? "CRITICAL"
            : hazard.severity === "high"
              ? "WARNING"
              : "CAUTION",
        title: hazard.name,
        message:
          hazard.recommendedAction ||
          "A marine hazard has been identified in this area.",
        location: Array.isArray(hazard.position)
          ? hazard.position.join(", ")
          : "Marine area",
        action:
          hazard.recommendedAction ||
          "Review the hazard on the marine map.",
        mapPath: "/map?focus=hazard",
        sources: ["Ocean Data", "AIS"],
      })
    );
  });

  // --------------------------------------------------
  // VESSEL / AIS ALERT
  // --------------------------------------------------

  const suspiciousVessel = vessels.find((vessel) => vessel.suspicious);

  if (suspiciousVessel) {
    alerts.push(
      alertRecord({
        id: `vessel-${suspiciousVessel.id}`,
        type: "VESSEL_ACTIVITY",
        severity: "WARNING",
        title: "Suspicious vessel activity",
        message:
          "A demo vessel contact does not have a complete AIS correlation.",
        location: Array.isArray(suspiciousVessel.position)
          ? suspiciousVessel.position.join(", ")
          : "Marine area",
        action: "Review vessel activity on the map.",
        mapPath: "/map?focus=vessel",
        sources: ["Vessel / AIS"],
      })
    );
  }

  // --------------------------------------------------
  // IMBL
  // --------------------------------------------------

  if (imbl && imbl.status && imbl.status !== "SAFE") {
    const imblSeverity =
      imbl.status === "CRITICAL"
        ? "CRITICAL"
        : imbl.status === "WARNING"
          ? "WARNING"
          : "CAUTION";

    alerts.push(
      alertRecord({
        id: "imbl-safety",
        type: "IMBL",
        severity: imblSeverity,
        title: "IMBL demo safety warning",
        message: imbl.warning,
        location: Array.isArray(imbl.location)
          ? imbl.location.join(", ")
          : "IMBL demo boundary",
        action: imbl.recommendedAction,
        mapPath: "/map?focus=imbl",
        sources: ["GPS", "Demo boundary calculation"],
      })
    );
  }

  // --------------------------------------------------
  // DATA SOURCE HEALTH / DEGRADED MODE
  // --------------------------------------------------

  const sources = Array.isArray(dataSourceHealth.sources)
    ? dataSourceHealth.sources
    : [];

  sources
    .filter((source) =>
      ["STALE", "CACHED", "UNAVAILABLE"].includes(source.status)
    )
    .forEach((source) => {
      const unavailable = source.status === "UNAVAILABLE";

      alerts.push(
        alertRecord({
          id: `source-health-${source.id}`,
          type: unavailable
            ? "DATA_SOURCE_UNAVAILABLE"
            : "DATA_SOURCE_STALE",
          severity: unavailable ? "WARNING" : "CAUTION",
          title: `${source.name} ${source.status.toLowerCase()}`,
          message:
            source.message ||
            `${source.name} is currently ${source.status.toLowerCase()}.`,
          location: "Platform data services",
          action: unavailable
            ? "Continue with available information and treat recommendations as lower confidence."
            : "Use the available data while considering its freshness.",
          mapPath: "/intelligence",
          sources: [source.name],
        })
      );
    });

  // --------------------------------------------------
  // DEDUPLICATION
  // --------------------------------------------------

  const uniqueAlerts = Array.from(
    new Map(alerts.map((alert) => [alert.id, alert])).values()
  );

  // Highest severity alerts first
  return uniqueAlerts.sort(
    (a, b) => getSeverity(b.severity) - getSeverity(a.severity)
  );
}

export function getAuthorityAlerts() {
  return [
    {
      id: "sos-demo",
      type: "SOS",
      title: "Emergency SOS Alert",
      location: "Sector AR-14",
      time: "2 min ago",
      severity: "CRITICAL",
      status: "Active",
    },
    {
      id: "imbl-escalation",
      type: "IMBL",
      title: "IMBL Boundary Warning",
      location: "Sector AR-09",
      time: "8 min ago",
      severity: "WARNING",
      status: "Escalated",
    },
  ];
}