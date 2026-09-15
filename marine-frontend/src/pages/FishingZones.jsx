import {
  Waves,
  Thermometer,
  Wind,
  MapPin,
  Database,
  ChevronDown,
  Route,
} from "lucide-react";
import MarineLeafletMap from "../components/MarineLeafletMap";
import Sidebar from "../components/Sidebar";
import "./FishingZones.css";

function FishingZones() {
  return (
    <div className="zones-page">

      <Sidebar />

      <main className="zones-content">

        {/* Page heading */}
        <div className="zones-header">
          <div>
            <div className="page-label">
              <Waves size={14} />
              MARINE INTELLIGENCE
            </div>

            <h1>Fishing Zones</h1>

            <p>
              AI-ranked fishing zones based on ocean,
              weather and marine conditions.
            </p>
          </div>

          <div className="location-info">
            <MapPin size={15} />
            <span>Your location</span>
            <strong>15.2993° N, 73.9116° E</strong>
          </div>
        </div>


        {/* Main layout */}
        <div className="zones-layout">

          {/* LEFT — MAP */}
          <section className="zones-map-panel">

            <div className="map-toolbar">

              <button className="map-filter active">
                All Zones
              </button>

              <button className="map-filter">
                High Potential
              </button>

              <button className="map-filter">
                Safe Only
              </button>

            </div>

<div className="zones-map">
  <MarineLeafletMap
    fishing={true}
    vesselsVisible={false}
    hazardsVisible={false}
    ocean={false}
    imbl={false}
    route={false}
    safeOnly={true}
    highPotentialOnly={true}
  />
</div>

            <div className="map-footer">

              <span>
                Showing 3 candidate zones within 45 km
                of your position
              </span>

              <div className="data-sources">
                <span>
                  <Database size={12} />
                  MOSDAC
                </span>

                <span>INCOIS</span>
                <span>OCEAN MODEL</span>
              </div>

            </div>

          </section>


          {/* RIGHT — ZONES */}
          <section className="zone-list">

            <div className="zone-list-header">

              <div>
                <div className="page-label">
                  TOP RECOMMENDATIONS
                </div>

                <h2>
                  Best fishing zones near you
                </h2>
              </div>

              <button className="sort-button">
                Best overall
                <ChevronDown size={14} />
              </button>

            </div>


            {/* Zone A */}
            <ZoneCard
              name="Zone A"
              distance="18 km away"
              potential="HIGH"
              safety="MODERATE"
              confidence="91%"
              temperature="27.2°C"
              wave="1.9 m"
              chlorophyll="0.86 mg/m³ · elevated"
              best
            />


            {/* Why Zone A */}
            <div className="why-card">

              <div className="why-header">
                <div>
                  <Waves size={15} />
                  Why Zone A is ranked here
                </div>

                <ChevronDown size={15} />
              </div>

              <ul>
                <li>
                  High PFZ potential from thermal front
                  and chlorophyll gradient
                </li>

                <li>
                  Moderate wave height (1.9 m) along
                  the recommended route
                </li>

                <li>
                  Low cyclone exposure in the next
                  6 hours
                </li>

                <li>
                  Shortest route of all candidate zones
                </li>

                <li>
                  No major hazards detected on the approach
                </li>
              </ul>

              <div className="confidence-row">
                <div>
                  <span>CONFIDENCE</span>
                  <strong>91%</strong>
                </div>

                <div className="confidence-bar">
                  <div style={{ width: "91%" }}></div>
                </div>
              </div>

              <div className="source-row">
                <span>MOSDAC</span>
                <span>INCOIS</span>
                <span>IMD</span>
              </div>

              <div className="zone-actions">

                <button className="view-route">
                  <Route size={15} />
                  View Route
                </button>

                <button className="show-map">
                  Show on map
                </button>

              </div>

            </div>


            {/* Zone B */}
            <ZoneCard
              name="Zone B"
              distance="27 km away"
              potential="VERY HIGH"
              safety="LOW"
              confidence="84%"
              temperature="27.9°C"
              wave="3.1 m"
              chlorophyll="1.24 mg/m³ · high"
            />


            {/* Zone C */}
            <ZoneCard
              name="Zone C"
              distance="34 km away"
              potential="HIGH"
              safety="HIGH"
              confidence="79%"
              temperature="26.8°C"
              wave="1.6 m"
              chlorophyll="0.72 mg/m³"
            />

          </section>

        </div>

      </main>

    </div>
  );
}


/* ---------------- ZONE CARD ---------------- */

function ZoneCard({
  name,
  distance,
  potential,
  safety,
  confidence,
  temperature,
  wave,
  chlorophyll,
  best = false,
}) {
  return (
    <div className={`zone-card ${best ? "best-zone" : ""}`}>

      <div className="zone-card-heading">

        <div className="zone-name">
          <span className="zone-icon">
            <Waves size={14} />
          </span>

          <strong>{name}</strong>

          {best && (
            <span className="best-badge">
              BEST OVERALL
            </span>
          )}
        </div>

        <span className="distance">
          {distance}
        </span>

      </div>


      <div className="zone-stats">

        <Stat
          label="POTENTIAL"
          value={potential}
          type="potential"
        />

        <Stat
          label="SAFETY"
          value={safety}
          type="safety"
        />

        <Stat
          label="CONFIDENCE"
          value={confidence}
          type="confidence"
        />

      </div>


      <div className="zone-weather">

        <span>
          <Thermometer size={13} />
          {temperature}
        </span>

        <span>
          <Waves size={13} />
          {wave}
        </span>

        <span>
          Chlorophyll {chlorophyll}
        </span>

      </div>

    </div>
  );
}


/* ---------------- STAT ---------------- */

function Stat({
  label,
  value,
  type,
}) {
  return (
    <div className="stat-box">

      <span>{label}</span>

      <strong className={`stat-${type}`}>
        {value}
      </strong>

    </div>
  );
}

export default FishingZones;