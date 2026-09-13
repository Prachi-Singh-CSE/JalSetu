import {
  MapPin,
  Waves,
  Wind,
  Thermometer,
  AlertTriangle,
  ShieldCheck,
  Navigation,
  Fish,
  Clock,
  ArrowRight,
} from "lucide-react";

import Navbar from "../components/Navbar";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-content">

        {/* Header */}
        <section className="dashboard-header">
          <div>
            <div className="dashboard-label">
              MARINE SITUATION
            </div>

            <h1>Good morning, Fisherman</h1>

            <p>
              Here's your marine situation for today.
            </p>
          </div>

          <div className="dashboard-location">
            <MapPin size={16} />
            <div>
              <span>YOUR LOCATION</span>
              <strong>Arabian Sea · Sector AR-14</strong>
            </div>
          </div>
        </section>


        {/* Situation cards */}
        <section className="situation-grid">

          <WeatherCard
            icon={<Thermometer size={19} />}
            label="SEA TEMPERATURE"
            value="27.2°C"
            status="Normal"
          />

          <WeatherCard
            icon={<Wind size={19} />}
            label="WIND"
            value="18 km/h"
            status="SW · Moderate"
          />

          <WeatherCard
            icon={<Waves size={19} />}
            label="WAVE HEIGHT"
            value="1.9 m"
            status="Moderate"
          />

          <div className="safety-card">
            <div className="safety-top">
              <span>SAFETY SCORE</span>
              <ShieldCheck size={19} />
            </div>

            <div className="safety-score">
              82<span>/100</span>
            </div>

            <div className="safety-status">
              <span></span>
              SAFE TO SAIL
            </div>
          </div>

        </section>


        {/* Main dashboard */}
        <section className="dashboard-grid">

          {/* Marine map */}
          <div className="dashboard-panel map-panel">

            <div className="panel-header">
              <div>
                <div className="panel-label">
                  <Navigation size={13} />
                  MARINE MAP
                </div>

                <h2>Current ocean conditions</h2>
              </div>

              <button className="panel-button">
                Open map
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="dashboard-map">

              <div className="ocean-grid"></div>

              <div className="map-sea-label">
                ARABIAN SEA
              </div>

              <div className="map-india-label">
                INDIA
              </div>

              {/* User location */}
              <div className="dashboard-user-marker">
                <span></span>
              </div>

              {/* Fishing zone */}
              <div className="fishing-zone-marker zone-one">
                <Fish size={13} />
              </div>

              <div className="fishing-zone-marker zone-two">
                <Fish size={13} />
              </div>

              {/* Route */}
              <div className="dashboard-route"></div>

              <div className="route-start">YOU</div>
              <div className="route-end">ZONE A</div>

              {/* Map legend */}
              <div className="map-legend">
                <div>
                  <span className="legend-dot safe"></span>
                  Safe
                </div>

                <div>
                  <span className="legend-dot fishing"></span>
                  Fishing zone
                </div>

                <div>
                  <span className="legend-dot warning"></span>
                  Hazard
                </div>
              </div>

            </div>

          </div>


          {/* Alerts */}
          <div className="dashboard-panel alerts-panel">

            <div className="panel-header">
              <div>
                <div className="panel-label">
                  <AlertTriangle size={13} />
                  ACTIVE ALERTS
                </div>

                <h2>Things you should know</h2>
              </div>

              <span className="alert-count">2</span>
            </div>


            <AlertItem
              type="warning"
              title="Moderate wave conditions"
              description="Wave height may reach 2.3 m along your route."
              time="Updated 18 min ago"
            />

            <AlertItem
              type="danger"
              title="Vessel activity nearby"
              description="High vessel density detected 12 km northeast."
              time="Updated 31 min ago"
            />

            <AlertItem
              type="safe"
              title="No cyclone threat"
              description="No significant cyclone activity in your area."
              time="Updated 42 min ago"
            />

            <button className="view-alerts">
              View all alerts
              <ArrowRight size={13} />
            </button>

          </div>

        </section>


        {/* Bottom cards */}
        <section className="bottom-grid">

          <div className="dashboard-panel recommendation-panel">

            <div className="panel-label">
              <Fish size={13} />
              AI RECOMMENDATION
            </div>

            <h2>
              Zone A looks like your best option today.
            </h2>

            <p>
              Strong chlorophyll concentration and favorable
              ocean conditions make this zone a high-potential
              fishing area.
            </p>

            <div className="recommendation-details">

              <div>
                <span>POTENTIAL</span>
                <strong>HIGH</strong>
              </div>

              <div>
                <span>DISTANCE</span>
                <strong>18 km</strong>
              </div>

              <div>
                <span>CONFIDENCE</span>
                <strong>91%</strong>
              </div>

            </div>

            <button className="primary-dashboard-button">
              View fishing zones
              <ArrowRight size={14} />
            </button>

          </div>


          <div className="dashboard-panel route-panel">

            <div className="panel-label">
              <Navigation size={13} />
              RECOMMENDED ROUTE
            </div>

            <h2>Safest route to Zone A</h2>

            <div className="route-info">

              <div className="route-stat">
                <Clock size={15} />
                <div>
                  <span>EST. TIME</span>
                  <strong>1h 12m</strong>
                </div>
              </div>

              <div className="route-stat">
                <Navigation size={15} />
                <div>
                  <span>DISTANCE</span>
                  <strong>18.4 km</strong>
                </div>
              </div>

            </div>

            <button className="secondary-dashboard-button">
              Open route planner
              <ArrowRight size={14} />
            </button>

          </div>

        </section>

      </main>
    </div>
  );
}


/* Weather card */

function WeatherCard({ icon, label, value, status }) {
  return (
    <div className="weather-card">

      <div className="weather-icon">
        {icon}
      </div>

      <div className="weather-info">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{status}</small>
      </div>

    </div>
  );
}


/* Alert */

function AlertItem({
  type,
  title,
  description,
  time,
}) {
  return (
    <div className={`alert-item ${type}`}>

      <div className="alert-icon">
        <AlertTriangle size={15} />
      </div>

      <div className="alert-text">
        <strong>{title}</strong>
        <p>{description}</p>
        <small>{time}</small>
      </div>

    </div>
  );
}

export default Dashboard;