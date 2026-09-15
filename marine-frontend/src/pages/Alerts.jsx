import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  Waves,
  Navigation,
  Fish,
  Database,
  RotateCcw,
  Compass,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { useAppData } from "../state/useAppData";
import "./Alerts.css";

export default function Alerts() {
  const navigate = useNavigate();
  const { state, acknowledgeAlert, markAlertRead, dismissAlert, selectRoute, replayHazardPush } = useAppData();
  const { imbl } = state;
  const [filter, setFilter] = useState("All");
  const [replayed, setReplayed] = useState(false);
  const visibleAlerts = state.alerts.filter((alert) => {
    if (filter === "All") return alert.status !== "dismissed";
    if (filter === "Active") return ["active", "read"].includes(alert.status);
    if (filter === "Acknowledged") return alert.status === "acknowledged";
    if (filter === "Critical") return alert.severity === "CRITICAL";
    if (filter === "Warning") return alert.severity === "WARNING";
    if (filter === "Caution") return alert.severity === "CAUTION";
    return true;
  });

  return (
    <div className="alerts-page">
      <Sidebar />

      <main className="alerts-main">

        {/* ================= HEADER ================= */}

        <div className="alerts-page-header">
          <div>
            <h1>Alert Center</h1>
            <p>
              Everything the platform pushed to you, with the evidence behind it.
            </p>
          </div>

          {state.dataSources.degraded && (
            <div className="alerts-degraded-state" role="status">
              {state.dataSources.message} Some recommendations may have reduced confidence.
            </div>
          )}

          <button
            className="replay-alert"
            onClick={() => {
              replayHazardPush();
              setReplayed(true);
              navigate("/dashboard");
            }}
          >
            <Bell size={15} />
            {replayed ? "Hazard alert replayed" : "Replay hazard push alert"}
          </button>
        </div>

        {/* ================= SUMMARY ================= */}

        <div className="alert-summary">

          <div className="summary-box critical-summary">
            <span>CRITICAL</span>
            <strong>{state.alerts.filter((alert) => alert.severity === "CRITICAL").length}</strong>
          </div>

          <div className="summary-box warning-summary">
            <span>WARNING</span>
            <strong>{state.alerts.filter((alert) => alert.severity === "WARNING").length}</strong>
          </div>

          <div className="summary-box info-summary">
            <span>CAUTION</span>
            <strong>{state.alerts.filter((alert) => alert.severity === "CAUTION").length}</strong>
          </div>

        </div>

        {/* ================= FEATURED ALERT ================= */}

        <section className="featured-alert">

          <div className="featured-alert-heading">

            <div className="featured-icon">
              <AlertTriangle size={20} />
            </div>

            <div>
              <div className="featured-type">
                {imbl.status}
              </div>

              <h2>IMBL Proximity Warning</h2>

              <p>
                {imbl.warning}
              </p>
            </div>

          </div>

          {/* DATA */}

          <div className="featured-data">

            <div>
              <span>DISTANCE TO IMBL</span>
              <strong>{imbl.distanceKm} km</strong>
            </div>

            <div>
              <span>DIRECTION</span>
              <strong>South-west</strong>
            </div>

            <div>
              <span>STATUS</span>
              <strong className="orange-text">{imbl.status}</strong>
            </div>

          </div>

          {/* IMBL SCALE */}

          <div className="imbl-scale-section">

            <div className="scale-labels">
              <span>IMBL</span>
              <span>Safe waters (5 km +)</span>
            </div>

            <div className="imbl-scale">
              <div className="imbl-danger"></div>
              <div className="imbl-warning"></div>
              <div className="imbl-marker"></div>
            </div>

          </div>

          {/* ACTIONS */}

          <div className="featured-actions">

            <button className="return-safe" onClick={() => { selectRoute("safer", "IMBL safety"); navigate("/routes"); }}>
              <Compass size={15} />
              Return to Safe Route
            </button>

            <button className="show-map" onClick={() => navigate("/map?focus=imbl")}>
              Show IMBL on map
            </button>

            <span className="simulate-text">
              Simulate vessel continuing
            </span>

          </div>

          {/* SOURCES */}

          <div className="featured-sources">
            <Database size={13} />

            <span>GPS</span>
            <span>SATELLITE</span>
          </div>

        </section>

        {/* ================= FILTERS ================= */}

        <div className="alert-filters">

          {["All", "Active", "Critical", "Warning", "Caution", "Acknowledged"].map((item) => (
            <button
              className={`filter ${filter === item ? "active" : ""}`}
              key={item}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}

        </div>

        {/* ================= ALERT LIST ================= */}

        <section className="alert-list">
          {visibleAlerts.map((alert) => (
            <AlertRow
              key={alert.id}
              type={alert.severity}
              tag={alert.type}
              title={alert.title}
              description={alert.message}
              time={alert.timestamp}
              location={alert.location}
              confidence={`${state.risk.confidence.score}%`}
              sources={alert.sources}
              button={alert.type === "IMBL" ? "View IMBL" : "View map"}
              alertId={alert.id}
              alertState={alert}
              read={alert.read}
              onAcknowledge={acknowledgeAlert}
              onDismiss={dismissAlert}
              onAction={() => {
                markAlertRead(alert.id);
                navigate(alert.mapPath);
              }}
            />
          ))}
        </section>

      </main>
    </div>
  );
}


/* =====================================================
   ALERT ROW COMPONENT
   ===================================================== */

function AlertRow({
  type,
  tag,
  title,
  description,
  time,
  location,
  confidence,
  sources,
  button,
  critical = false,
  acknowledged = false,
  alertId,
  alertState,
  read = false,
  hidden = false,
  onAcknowledge,
  onDismiss,
  onAction,
}) {
  if (hidden) return null;

  const isAcknowledged = alertState?.status === "acknowledged" || acknowledged;

  return (
    <article className={`alert-row ${type.toLowerCase()}`}>

      <div className="row-main">

        <div className="row-title">

          <span className="status-dot"></span>

          <span className="row-type">
            {type}
          </span>

          <span className="row-tag">
            {tag}
          </span>

          {!read && <span className="acknowledged">UNREAD</span>}

          <h3>{title}</h3>

          {isAcknowledged && (
            <span className="acknowledged">
              ✓ Acknowledged
            </span>
          )}

        </div>

        <p className="row-description">
          {description}
        </p>

        <div className="row-meta">

          <span>{time}</span>

          <span>{location}</span>

          <Database size={13} />

          {sources.map((source) => (
            <span className="source" key={source}>
              {source}
            </span>
          ))}

        </div>

        <div className="row-confidence">

          <span>CONFIDENCE</span>

          <div className="row-progress">
            <div
              style={{
                width: confidence,
              }}
            ></div>
          </div>

          <strong>{confidence}</strong>

        </div>

      </div>

      <div className="row-actions">

        <button
          className={
            critical
              ? "row-primary critical-button"
              : "row-primary"
          }
          onClick={onAction}
        >
          {button}
        </button>

        <button
          className={`row-ack ${
            isAcknowledged ? "disabled-ack" : ""
          }`}
          onClick={() => alertId && onAcknowledge(alertId)}
          disabled={isAcknowledged}
        >
          {isAcknowledged ? "Acknowledged" : "Acknowledge"}
        </button>

        <button className="row-ack" onClick={() => onDismiss(alertId)}>
          Dismiss
        </button>

      </div>

    </article>
  );
}