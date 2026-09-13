import { useState } from "react";
import {
  Navigation,
  Flag,
  Anchor,
  Shield,
  Sparkles,
  Clock3,
  Route as RouteIcon,
  ChevronUp,
  ChevronDown,
  MapPin,
} from "lucide-react";

import Navbar from "../components/Navbar";
import "./Routes.css";

export default function Routes() {
  const [selectedRoute, setSelectedRoute] = useState("safer");
  const [showReasoning, setShowReasoning] = useState(true);

  return (
    <div className="routes-page">
      <Navbar />

      <main className="routes-main">

        {/* TOP INFO */}
        <div className="routes-topbar">
          <div className="route-breadcrumb">
            <span>Current location</span>
            <span className="arrow">→</span>
            <span>Zone A (planned destination)</span>
            <span className="arrow">→</span>
            <span>Vasai Safe Harbour</span>
          </div>

          <span className="prepared-badge">
            DEMO / PREPARED DATA
          </span>
        </div>

        <div className="routes-layout">

          {/* ================= MAP ================= */}
          <section className="route-map-panel">

            <div className="map-grid"></div>

            {/* Latitude labels */}
            <div className="latitude lat-1">21°N</div>
            <div className="latitude lat-2">20°N</div>
            <div className="latitude lat-3">19°N</div>
            <div className="latitude lat-4">18°N</div>

            {/* Sea / land shape */}
            <div className="coastline"></div>

            {/* Risk zone */}
            <div className="risk-zone"></div>

            {/* Hazard markers */}
            <div className="hazard hz-1">▲</div>
            <div className="hazard hz-2">▲</div>

            {/* Fishing zones */}
            <div className="fishing-zone zone-a">
              <span className="zone-dot"></span>
              Zone A
            </div>

            <div className="fishing-zone zone-b">
              <span className="zone-dot"></span>
              Zone B
            </div>

            <div className="fishing-zone zone-c">
              <span className="zone-dot"></span>
              Zone C
            </div>

            {/* Route */}
            <svg className="route-svg" viewBox="0 0 700 520">
              {/* fastest route */}
              <polyline
                points="390,300 445,250 470,185 525,165"
                className="fast-route-line"
              />

              {/* safer route */}
              <polyline
                points="390,300 430,330 480,300 535,260 570,205"
                className="safe-route-line"
              />
            </svg>

            {/* Current location */}
            <div className="current-location">
              <div className="location-pulse"></div>
              <div className="location-arrow">▲</div>
              <span>YOU</span>
            </div>

            {/* Destination */}
            <div className="destination-marker">
              <Flag size={13} />
              <span>Zone A</span>
            </div>

            {/* Harbour */}
            <div className="harbour harbour-1">
              <Anchor size={13} />
              <span>Dahanu Jetty</span>
            </div>

            <div className="harbour harbour-2">
              <Anchor size={13} />
              <span>Vasai Safe Harbour</span>
            </div>

            {/* Map bottom information */}
            <div className="map-bottom-info">

              <div className="map-info-item">
                <MapPin size={14} />
                <span>Current location</span>
                <strong>19.6200° N, 71.9500° E</strong>
              </div>

              <div className="map-info-item">
                <Flag size={14} />
                <span>Planned destination</span>
                <strong>Zone A · 18 km</strong>
              </div>

              <div className="map-info-item">
                <Anchor size={14} />
                <span>Safe harbour</span>
                <strong>Vasai · 18.4 km</strong>
              </div>

            </div>

          </section>

          {/* ================= RIGHT PANEL ================= */}
          <section className="routes-sidebar">

            {/* FASTEST ROUTE */}
            <div
              className={`route-card fastest-card ${
                selectedRoute === "fastest" ? "route-selected" : ""
              }`}
            >
              <div className="route-card-header">
                <div>
                  <h2>FASTEST ROUTE</h2>

                  <div className="route-meta">
                    <span>31 km</span>
                    <span>
                      <Clock3 size={13} />
                      1h 20m
                    </span>

                    <span>
                      Risk
                      <b className="risk-high">HIGH</b>
                    </span>
                  </div>
                </div>

                <button
                  className="select-route-btn"
                  onClick={() => setSelectedRoute("fastest")}
                >
                  {selectedRoute === "fastest" ? "Selected" : "Select"}
                </button>
              </div>

              <ul className="route-points danger-points">
                <li>
                  Crosses the 2.8 m high-wave zone for 11 km
                </li>
                <li>
                  Passes 4.2 km from the detected debris field
                </li>
              </ul>
            </div>

            {/* SAFER ROUTE */}
            <div
              className={`route-card safer-card ${
                selectedRoute === "safer" ? "route-selected" : ""
              }`}
            >
              <div className="route-card-header">
                <div>
                  <div className="route-title-row">
                    <h2>SAFER ROUTE</h2>
                    <span className="recommended">
                      ✓ RECOMMENDED
                    </span>
                  </div>

                  <div className="route-meta">
                    <span>36 km</span>

                    <span>
                      <Clock3 size={13} />
                      1h 32m
                    </span>

                    <span>
                      Risk
                      <b className="risk-low">LOW</b>
                    </span>
                  </div>
                </div>

                <button
                  className="selected-route-btn"
                  onClick={() => setSelectedRoute("safer")}
                >
                  {selectedRoute === "safer" ? "Selected" : "Select"}
                </button>
              </div>

              <ul className="route-points safe-points">
                <li>
                  Avoids the high-wave zone entirely
                </li>
                <li>
                  Keeps 14 km clearance from the detected hazard
                </li>
                <li>
                  Stays within 22 km of a safe harbour at all times
                </li>
              </ul>
            </div>

            {/* WHY SAFER ROUTE */}
            <div className="reasoning-card">

              <div className="reasoning-header">
                <div className="reasoning-icon">
                  <Shield size={17} />
                </div>

                <h2>Why the safer route?</h2>
              </div>

              <p className="reasoning-description">
                Recommended because it avoids a high-wave zone
                and keeps greater distance from the detected hazard.
              </p>

              <button
                className="reasoning-toggle"
                onClick={() => setShowReasoning(!showReasoning)}
              >
                <span>
                  <Sparkles size={15} />
                  View reasoning
                </span>

                {showReasoning ? (
                  <ChevronUp size={15} />
                ) : (
                  <ChevronDown size={15} />
                )}
              </button>

              {showReasoning && (
                <div className="reasoning-content">

                  <div className="reasoning-point">
                    <span></span>
                    <p>
                      Fastest route crosses 11 km of a 2.8 m
                      wave field
                    </p>
                  </div>

                  <div className="reasoning-point">
                    <span></span>
                    <p>
                      Safer route keeps 14 km clearance from
                      the debris field
                    </p>
                  </div>

                  <div className="reasoning-point">
                    <span></span>
                    <p>
                      Only 12 extra minutes for a HIGH → LOW
                      risk change
                    </p>
                  </div>

                  <div className="reasoning-point">
                    <span></span>
                    <p>
                      Safer route stays within 22 km of a
                      harbour throughout
                    </p>
                  </div>

                  <div className="reasoning-point">
                    <span></span>
                    <p>
                      IMBL clearance improves from 1.8 km
                      to 6.4 km
                    </p>
                  </div>

                  <div className="reasoning-footer">

                    <div className="source-tags">
                      <span>INCOIS</span>
                      <span>IMD</span>
                      <span>OCEAN MODEL</span>
                      <span>GPS</span>
                    </div>

                    <div className="confidence">
                      <div className="confidence-label">
                        <span>CONFIDENCE</span>
                        <strong>89%</strong>
                      </div>

                      <div className="confidence-bar">
                        <div style={{ width: "89%" }}></div>
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* ACTIONS */}
            <div className="route-actions">

              <button className="start-navigation">
                <Navigation size={16} />
                Start Navigation
              </button>

              <button className="harbour-button">
                <Anchor size={16} />
                Nearest Safe Harbour
              </button>

            </div>

            {/* DATA SOURCES */}
            <div className="bottom-source-tags">
              <span>INCOIS</span>
              <span>IMD</span>
              <span>GPS</span>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}