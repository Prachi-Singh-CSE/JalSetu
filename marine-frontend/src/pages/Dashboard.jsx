import { useNavigate } from "react-router-dom";
import MarineLeafletMap from "../components/MarineLeafletMap";
import { useAppData } from "../state/useAppData";
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
  const navigate = useNavigate();
  const { state, acknowledgeAlert, dismissAlert } = useAppData();
  const { marine, risk, alerts, dataSources } = state;
  const activeAlerts = alerts.filter((alert) => ["active", "read"].includes(alert.status));

const safetyStatus =
  risk.score >= 75
    ? "SAFE TO SAIL"
    : risk.score >= 50
    ? "CAUTION ADVISED"
    : "HIGH RISK";

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
            value={marine.ocean.temperature}
            status="Normal"
          />

          <WeatherCard
            icon={<Wind size={19} />}
            label="WIND"
            value={marine.ocean.wind}
            status="SW · Moderate"
          />

          <WeatherCard
            icon={<Waves size={19} />}
            label="WAVE HEIGHT"
            value={marine.ocean.waveHeight}
            status="Moderate"
          />

          <div className="safety-card">
            <div className="safety-top">
              <span>SAFETY SCORE</span>
              <ShieldCheck size={19} />
            </div>

            <div className="safety-score">
  {risk.score}<span>/100</span>
</div>

<div className="safety-status">
  <span></span>
  {safetyStatus}
</div>
          </div>

        </section>

        {dataSources.degraded && (
          <div className="dashboard-degraded-state" role="status">
            <AlertTriangle size={14} />
            <span>{dataSources.message} Recommendations use reduced confidence.</span>
          </div>
        )}


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

               <button
  className="panel-button"
  onClick={() => navigate("/map")}
>
  Open map
  <ArrowRight size={13} />
</button>

            </div>

           <div className="dashboard-map">
  <MarineLeafletMap
    fishing={true}
    vesselsVisible={true}
    hazardsVisible={true}
    ocean={true}
    route={true}
  />
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

              <span className="alert-count">{activeAlerts.length}</span>
            </div>


            {activeAlerts.slice(0, 3).map((alert) => (
  <AlertItem
    key={alert.id}
    type={alert.severity === "CRITICAL" ? "danger" : alert.severity === "CAUTION" ? "warning" : alert.severity.toLowerCase()}
    title={alert.title}
    description={alert.message}
    time={`${alert.severity} · ${alert.timestamp}`}
    onViewMap={() => navigate(alert.mapPath)}
    onAcknowledge={() => acknowledgeAlert(alert.id)}
    onDismiss={() => dismissAlert(alert.id)}
  />
))}

            <button
  className="view-alerts"
  onClick={() => navigate("/alerts")}
>
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

            <button
  className="primary-dashboard-button"
  onClick={() => navigate("/fishing-zones")}
>
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

            <button
  className="secondary-dashboard-button"
  onClick={() => navigate("/routes")}
>
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
  onViewMap,
  onAcknowledge,
  onDismiss,
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
        <div className="dashboard-alert-actions">
          <button onClick={onViewMap}>View</button>
          <button onClick={onAcknowledge}>Acknowledge</button>
          <button onClick={onDismiss}>Dismiss</button>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;