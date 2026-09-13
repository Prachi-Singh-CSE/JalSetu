import {
  MapPin,
  Layers,
  Navigation,
  Fish,
  Ship,
  AlertTriangle,
  Wind,
  Waves,
  Thermometer,
  ChevronDown,
} from "lucide-react";

import Navbar from "../components/Navbar";
import "./Map.css";

function Map() {
  return (
    <div className="map-page">
      <Navbar />

      <main className="map-content">

        {/* HEADER */}
        <div className="map-page-header">
          <div>
            <div className="map-page-label">
              <Navigation size={14} />
              MARINE MAP
            </div>

            <h1>Marine Intelligence Map</h1>

            <p>
              Monitor fishing zones, vessels, hazards and ocean conditions.
            </p>
          </div>

          <div className="map-location">
            <MapPin size={15} />
            <span>Arabian Sea · AR-14</span>
          </div>
        </div>


        {/* MAP AREA */}
        <section className="map-layout">

          <div className="large-map-panel">

            {/* MAP TOOLBAR */}
            <div className="map-toolbar-main">

              <button className="map-tool active">
                <Navigation size={14} />
                Overview
              </button>

              <button className="map-tool">
                <Fish size={14} />
                Fishing
              </button>

              <button className="map-tool">
                <Ship size={14} />
                Vessels
              </button>

              <button className="map-tool">
                <AlertTriangle size={14} />
                Hazards
              </button>

              <button className="map-tool">
                <Waves size={14} />
                Ocean
              </button>

            </div>


            {/* MAP */}
            <div className="main-marine-map">

              <div className="marine-grid"></div>

              <div className="coordinate coord-1">
                16°N
              </div>

              <div className="coordinate coord-2">
                15°N
              </div>

              <div className="coordinate coord-3">
                14°N
              </div>

              <div className="coordinate coord-4">
                72°E
              </div>

              <div className="coordinate coord-5">
                73°E
              </div>

              <div className="coordinate coord-6">
                74°E
              </div>


              <div className="sea-name">
                ARABIAN SEA
              </div>

              <div className="land-name">
                INDIA
              </div>


              {/* USER LOCATION */}
              <div className="current-location">
                <div className="location-ring"></div>
                <div className="location-dot"></div>
              </div>

              <div className="location-label">
                YOU
              </div>


              {/* FISHING ZONES */}
              <div className="fishing-marker marker-1">
                <Fish size={14} />
              </div>

              <div className="fishing-marker marker-2">
                <Fish size={14} />
              </div>

              <div className="fishing-marker marker-3">
                <Fish size={14} />
              </div>


              {/* VESSELS */}
              <div className="vessel-marker vessel-1">
                <Ship size={13} />
              </div>

              <div className="vessel-marker vessel-2">
                <Ship size={13} />
              </div>

              <div className="vessel-marker vessel-3">
                <Ship size={13} />
              </div>


              {/* HAZARD */}
              <div className="hazard-marker hazard-1">
                <AlertTriangle size={13} />
              </div>


              {/* ROUTE */}
              <div className="route-line"></div>

              <div className="route-label">
                RECOMMENDED ROUTE
              </div>


              {/* MAP CONTROLS */}
              <div className="map-controls">

                <button>+</button>
                <button>−</button>

                <div className="control-divider"></div>

                <button>
                  <Navigation size={15} />
                </button>

              </div>


              {/* LAYER BUTTON */}
              <button className="layers-button">
                <Layers size={15} />
                Layers
                <ChevronDown size={13} />
              </button>


              {/* LEGEND */}
              <div className="map-legend-main">

                <div className="legend-title">
                  MAP LEGEND
                </div>

                <div>
                  <span className="legend-symbol fishing-symbol">
                    <Fish size={9} />
                  </span>
                  Fishing zone
                </div>

                <div>
                  <span className="legend-symbol vessel-symbol">
                    <Ship size={9} />
                  </span>
                  Vessel
                </div>

                <div>
                  <span className="legend-symbol hazard-symbol">
                    <AlertTriangle size={9} />
                  </span>
                  Hazard
                </div>

                <div>
                  <span className="legend-user"></span>
                  Your location
                </div>

              </div>

            </div>


            {/* MAP FOOTER */}
            <div className="map-status-bar">

              <span>
                Data updated 4 min ago
              </span>

              <div className="map-data-tags">
                <span>INCOIS</span>
                <span>IMD</span>
                <span>MOSDAC</span>
                <span>AIS</span>
                <span>OCEAN MODEL</span>
              </div>

            </div>

          </div>


          {/* RIGHT PANEL */}
          <aside className="map-side-panel">

            <div className="side-panel-header">

              <div className="map-page-label">
                LIVE CONDITIONS
              </div>

              <span className="live-indicator">
                <span></span>
                LIVE
              </span>

            </div>


            {/* CURRENT CONDITIONS */}
            <div className="condition-section">

              <h2>Ocean conditions</h2>

              <Condition
                icon={<Thermometer size={16} />}
                label="Sea temperature"
                value="27.2°C"
                status="Normal"
              />

              <Condition
                icon={<Waves size={16} />}
                label="Wave height"
                value="1.9 m"
                status="Moderate"
              />

              <Condition
                icon={<Wind size={16} />}
                label="Wind speed"
                value="18 km/h"
                status="SW"
              />

            </div>


            {/* FISHING */}
            <div className="side-section">

              <div className="side-section-title">
                <Fish size={14} />
                Fishing activity
              </div>

              <div className="activity-score">
                <strong>HIGH</strong>
                <span>86%</span>
              </div>

              <div className="activity-bar">
                <div></div>
              </div>

              <p>
                Strong fishing potential detected around
                your current area.
              </p>

            </div>


            {/* VESSELS */}
            <div className="side-section">

              <div className="side-section-title">
                <Ship size={14} />
                Nearby vessels
              </div>

              <div className="vessel-count">
                <strong>14</strong>
                <span>vessels detected</span>
              </div>

              <p>
                Highest vessel concentration is
                approximately 12 km northeast.
              </p>

            </div>


            {/* HAZARDS */}
            <div className="side-section hazard-section">

              <div className="side-section-title">
                <AlertTriangle size={14} />
                Detected hazards
              </div>

              <div className="hazard-status">
                <span></span>
                1 active hazard
              </div>

              <p>
                Moderate wave conditions along
                the recommended route.
              </p>

            </div>


            <button className="open-zones-button">
              Explore fishing zones
              <Navigation size={14} />
            </button>

          </aside>

        </section>

      </main>
    </div>
  );
}


/* CONDITION */

function Condition({
  icon,
  label,
  value,
  status,
}) {
  return (
    <div className="condition-row">

      <div className="condition-icon">
        {icon}
      </div>

      <div className="condition-info">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <small>{status}</small>

    </div>
  );
}

export default Map;