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

import Navbar from "../components/Navbar";
import "./Alerts.css";

export default function Alerts() {
  return (
    <div className="alerts-page">
      <Navbar />

      <main className="alerts-main">

        {/* ================= HEADER ================= */}

        <div className="alerts-page-header">
          <div>
            <h1>Alert Center</h1>
            <p>
              Everything the platform pushed to you, with the evidence behind it.
            </p>
          </div>

          <button className="replay-alert">
            <Bell size={15} />
            Replay hazard push alert
          </button>
        </div>

        {/* ================= SUMMARY ================= */}

        <div className="alert-summary">

          <div className="summary-box critical-summary">
            <span>CRITICAL</span>
            <strong>1</strong>
          </div>

          <div className="summary-box warning-summary">
            <span>WARNING</span>
            <strong>2</strong>
          </div>

          <div className="summary-box info-summary">
            <span>INFORMATION</span>
            <strong>3</strong>
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
                WARNING
              </div>

              <h2>IMBL Proximity Warning</h2>

              <p>
                You are 1.8 km from the International Maritime Boundary Line.
              </p>
            </div>

          </div>

          {/* DATA */}

          <div className="featured-data">

            <div>
              <span>DISTANCE TO IMBL</span>
              <strong>1.8 km</strong>
            </div>

            <div>
              <span>DIRECTION</span>
              <strong>South-west</strong>
            </div>

            <div>
              <span>STATUS</span>
              <strong className="orange-text">WARNING</strong>
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

            <button className="return-safe">
              <Compass size={15} />
              Return to Safe Route
            </button>

            <button className="show-map">
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

          <button className="filter active">
            All
          </button>

          <button className="filter">
            Critical
          </button>

          <button className="filter">
            Warning
          </button>

          <button className="filter">
            Information
          </button>

          <button className="filter">
            Resolved / Safe
          </button>

        </div>

        {/* ================= ALERT LIST ================= */}

        <section className="alert-list">

          {/* IMBL */}

          <AlertRow
            type="CRITICAL"
            tag="IMBL"
            title="IMBL proximity warning"
            description="You are 1.8 km from the International Maritime Boundary Line, bearing south-west."
            time="14:28 IST · 4 min ago"
            location="19.6200° N, 71.9500° E"
            confidence="97%"
            sources={["GPS", "SATELLITE"]}
            button="Return to safe route"
            critical
          />

          {/* WAVE */}

          <AlertRow
            type="WARNING"
            tag="WEATHER"
            title="High-wave zone ahead"
            description="Significant wave height of 2.8 m recorded 6 km along your current heading."
            time="14:12 IST · 20 min ago"
            location="Sector AR-14"
            confidence="92%"
            sources={["INCOIS", "IMD"]}
            button="View safer route"
            acknowledged
          />

          {/* HAZARD */}

          <AlertRow
            type="WARNING"
            tag="HAZARD"
            title="Potential hazard detected"
            description="A potential maritime hazard has been detected 16 km from your planned route."
            time="13:56 IST · 36 min ago"
            location="19.8400° N, 71.2800° E"
            confidence="84%"
            sources={["SATELLITE", "AIS"]}
            button="View hazard"
          />

          {/* SAFE */}

          <AlertRow
            type="SAFE"
            tag="ROUTE"
            title="Safer route available"
            description="An alternative route adds 5 km but avoids the high-wave zone entirely."
            time="13:40 IST · 52 min ago"
            location="Route VS-02"
            confidence="89%"
            sources={["OCEAN MODEL", "INCOIS"]}
            button="Switch route"
          />

          {/* INFO */}

          <AlertRow
            type="INFO"
            tag="ZONE"
            title="Fishing zone updated"
            description="Zone A potential upgraded to HIGH after the latest chlorophyll pass."
            time="12:05 IST · 2 h ago"
            location="19.9000° N, 71.6200° E"
            confidence="91%"
            sources={["MOSDAC", "INCOIS"]}
            button="View zone"
          />

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
}) {
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

          <h3>{title}</h3>

          {acknowledged && (
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
        >
          {button}
        </button>

        <button
          className={`row-ack ${
            acknowledged ? "disabled-ack" : ""
          }`}
        >
          {acknowledged ? "Acknowledged" : "Acknowledge"}
        </button>

      </div>

    </article>
  );
}