function alertRecord({ id, type, severity, title, message, location, action, mapPath, sources }) {
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

export function evaluateMarineAlerts(marineData, dataSourceHealth, imbl) {
  const alerts = [];
  const wind = Number.parseFloat(marineData.ocean.wind) || 0;
  const waves = Number.parseFloat(marineData.ocean.waveHeight) || 0;

  if (waves >= 1.5) {
    alerts.push(alertRecord({
      id: "high-waves-ar14",
      type: "HIGH_WAVES",
      severity: waves >= 2.5 ? "WARNING" : "CAUTION",
      title: "High-wave conditions along route",
      message: `${marineData.ocean.waveHeight} waves are present along the recommended route.`,
      location: "Sector AR-14",
      action: "Use the safer route and monitor conditions.",
      mapPath: "/map?focus=hazard",
      sources: ["IMD / Weather", "Ocean Data"],
    }));
  }

  if (wind >= 15) {
    alerts.push(alertRecord({
      id: "strong-wind-ar14",
      type: "STRONG_WIND",
      severity: wind >= 30 ? "WARNING" : "CAUTION",
      title: "Strong wind conditions",
      message: `${marineData.ocean.wind} wind is recorded near the current route.`,
      location: "Sector AR-14",
      action: "Check the risk assessment before departure.",
      mapPath: "/intelligence",
      sources: ["IMD / Weather"],
    }));
  }

  marineData.hazards.forEach((hazard) => {
    alerts.push(alertRecord({
      id: `hazard-${hazard.id}`,
      type: hazard.type === "Oil Slick" ? "OIL_SLICK" : "HAZARD",
      severity: hazard.severity === "high" ? "WARNING" : "CAUTION",
      title: hazard.name,
      message: hazard.recommendedAction,
      location: hazard.position.join(", "),
      action: hazard.recommendedAction,
      mapPath: "/map?focus=hazard",
      sources: ["Ocean Data", "AIS"],
    }));
  });

  const suspiciousVessel = marineData.vessels.find((vessel) => vessel.suspicious);
  if (suspiciousVessel) {
    alerts.push(alertRecord({
      id: `vessel-${suspiciousVessel.id}`,
      type: "VESSEL_ACTIVITY",
      severity: "WARNING",
      title: "Suspicious vessel activity",
      message: "A demo vessel contact does not have a complete AIS correlation.",
      location: suspiciousVessel.position.join(", "),
      action: "Review vessel activity on the map.",
      mapPath: "/map?focus=vessel",
      sources: ["Vessel / AIS"],
    }));
  }

  if (imbl && imbl.status !== "SAFE") {
    alerts.push(alertRecord({
      id: "imbl-safety",
      type: "IMBL",
      severity: imbl.status,
      title: "IMBL demo safety warning",
      message: imbl.warning,
      location: imbl.location.join(", "),
      action: imbl.recommendedAction,
      mapPath: "/map?focus=imbl",
      sources: ["GPS", "Demo boundary calculation"],
    }));
  }

  dataSourceHealth.sources.filter((source) => ["STALE", "UNAVAILABLE"].includes(source.status)).forEach((source) => {
    alerts.push(alertRecord({
      id: `source-health-${source.id}`,
      type: source.status === "UNAVAILABLE" ? "DATA_SOURCE_UNAVAILABLE" : "DATA_SOURCE_STALE",
      severity: source.status === "UNAVAILABLE" ? "WARNING" : "CAUTION",
      title: `${source.name} ${source.status.toLowerCase()}`,
      message: source.message,
      location: "Platform data services",
      action: "Use available data with reduced confidence.",
      mapPath: "/intelligence",
      sources: [source.name],
    }));
  });

  return alerts;
}

export function getAuthorityAlerts() {
  return [
    { id: "sos-demo", type: "SOS", title: "Emergency SOS Alert", location: "Sector AR-14", time: "2 min ago", severity: "critical", status: "Active" },
    { id: "imbl-escalation", type: "IMBL", title: "IMBL Boundary Warning", location: "Sector AR-09", time: "8 min ago", severity: "high", status: "Escalated" },
  ];
}