import { useState } from "react";
import { Waves, Thermometer, ChevronDown, Database } from "lucide-react";
import Navbar from "../components/Navbar";
import "./Ocean.css";

export default function Ocean() {
  const [showReasoning, setShowReasoning] = useState(false);

  const profileData = [
    {
      depth: "Surface",
      temperature: "27.4°C",
      salinity: "34.6 PSU",
      type: "OBSERVED",
      width: "100%",
    },
    {
      depth: "10 m",
      temperature: "27.1°C",
      salinity: "34.8 PSU",
      type: "OBSERVED",
      width: "92%",
    },
    {
      depth: "25 m",
      temperature: "26.2°C",
      salinity: "35.0 PSU",
      type: "OBSERVED",
      width: "80%",
    },
    {
      depth: "50 m",
      temperature: "24.8°C",
      salinity: "35.2 PSU",
      type: "AI PREDICTION",
      width: "65%",
    },
    {
      depth: "100 m",
      temperature: "21.3°C",
      salinity: "35.4 PSU",
      type: "AI PREDICTION",
      width: "30%",
    },
  ];

  return (
    <div className="samudra-ocean-page">

      <Navbar />

      <div className="samudra-ocean-content">

        {/* HEADER */}

        <div className="samudra-ocean-header">

          <div className="samudra-ocean-heading">
            <h1>Ocean Intelligence</h1>

            <p>
              Below-surface temperature and salinity structure near your
              position. Values deeper than 25 m are model predictions,
              not direct measurements.
            </p>
          </div>

          <div className="samudra-ocean-status">

            <span className="samudra-fresh">
              <span className="samudra-fresh-dot"></span>
              FRESH
            </span>

            <span className="samudra-updated">
              Last updated 22 min ago
            </span>

            <span className="samudra-tag">
              AI PROTOTYPE
            </span>

            <span className="samudra-tag">
              OCEAN MODEL
            </span>

          </div>

        </div>


        {/* MAIN CONTENT */}

        <div className="samudra-ocean-layout">

          {/* LEFT SIDE */}

          <div className="samudra-profile-card">

            <div className="samudra-card-header">

              <div className="samudra-card-icon">
                <Waves size={15} />
              </div>

              <div>
                <h2>Vertical ocean profile</h2>
                <p>Select a depth to inspect conditions</p>
              </div>

            </div>


            <div className="samudra-profile-table">

              {profileData.map((item) => (
                <div
                  className="samudra-profile-row"
                  key={item.depth}
                >

                  <div className="samudra-depth">
                    {item.depth}
                  </div>

                  <div className="samudra-profile-middle">

                    <div className="samudra-profile-values">
                      <span>{item.temperature}</span>
                      <span className="samudra-separator">·</span>
                      <span>{item.salinity}</span>
                    </div>

                    <div className="samudra-profile-track">
                      <div
                        className="samudra-profile-fill"
                        style={{
                          width: item.width,
                        }}
                      ></div>
                    </div>

                  </div>

                  <div
                    className={
                      item.type === "OBSERVED"
                        ? "samudra-type samudra-observed"
                        : "samudra-type samudra-prediction"
                    }
                  >
                    {item.type}
                  </div>

                </div>
              ))}

            </div>


            <p className="samudra-profile-note">
              Values below 25 m are model predictions, not direct
              measurements. Use alongside on-board observation.
            </p>

          </div>


          {/* RIGHT SIDE */}

          <div className="samudra-ocean-right">

            {/* DEPTH CARD */}

            <div className="samudra-prediction-card">

              <div className="samudra-prediction-header">

                <div className="samudra-prediction-title">

                  <div className="samudra-card-icon">
                    <Thermometer size={15} />
                  </div>

                  <div>
                    <h2>Depth: 50 m</h2>
                    <p>Ocean Model v0.4 (prototype)</p>
                  </div>

                </div>

                <span className="samudra-prediction-label">
                  AI PREDICTION
                </span>

              </div>


              <div className="samudra-value-grid">

                <div className="samudra-value-box">
                  <span>TEMPERATURE</span>
                  <strong>24.8°C</strong>
                </div>

                <div className="samudra-value-box">
                  <span>SALINITY</span>
                  <strong>35.2 PSU</strong>
                </div>

              </div>


              <div className="samudra-confidence">

                <div className="samudra-confidence-top">
                  <span>PREDICTION CONFIDENCE</span>
                  <strong>81%</strong>
                </div>

                <div className="samudra-confidence-track">
                  <div></div>
                </div>

              </div>


              <button
                className="samudra-reasoning-button"
                onClick={() =>
                  setShowReasoning(!showReasoning)
                }
              >

                <span>
                  <Waves size={12} />
                  How was this predicted?
                </span>

                <ChevronDown
                  size={13}
                  className={
                    showReasoning
                      ? "samudra-arrow-open"
                      : ""
                  }
                />

              </button>


              {showReasoning && (
                <div className="samudra-reasoning">

                  <p>
                    The model combines recent surface observations,
                    historical ocean profiles and current ocean-model
                    conditions to estimate subsurface temperature and
                    salinity.
                  </p>

                  <div>
                    <span>Surface observations</span>
                    <strong>Observed</strong>
                  </div>

                  <div>
                    <span>Historical profiles</span>
                    <strong>Included</strong>
                  </div>

                  <div>
                    <span>Ocean model</span>
                    <strong>v0.4</strong>
                  </div>

                </div>
              )}

            </div>


            {/* CHART CARD */}

            <div className="samudra-chart-card">

              <div className="samudra-chart-header">

                <div className="samudra-chart-icon">
                  <Database size={14} />
                </div>

                <div>
                  <h2>Predicted vs observed</h2>
                  <p>
                    Model check at 25 m over the last five passes
                  </p>
                </div>

              </div>


              <div className="samudra-chart">

                <ChartRow
                  date="05 Sep"
                  width="82%"
                  prediction="26.5°"
                  observed="26.3°"
                />

                <ChartRow
                  date="06 Sep"
                  width="76%"
                  prediction="26.4°"
                  observed="26.6°"
                />

                <ChartRow
                  date="07 Sep"
                  width="68%"
                  prediction="26.2°"
                  observed="26.2°"
                />

                <ChartRow
                  date="08 Sep"
                  width="72%"
                  prediction="26.1°"
                  observed="26.4°"
                />

                <ChartRow
                  date="09 Sep"
                  width="70%"
                  prediction="26.2°"
                  observed="26.4°"
                />

              </div>


              <div className="samudra-chart-legend">

                <span>
                  <i className="samudra-observed-legend"></i>
                  Observed
                </span>

                <span>
                  <i className="samudra-prediction-legend"></i>
                  AI prediction
                </span>

              </div>


              <div className="samudra-chart-sources">
                <span>INCOIS</span>
                <span>OCEAN MODEL</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   CHART ROW
===================================================== */

function ChartRow({
  date,
  width,
  prediction,
  observed,
}) {
  return (
    <div className="samudra-chart-row">

      <span className="samudra-chart-date">
        {date}
      </span>

      <div className="samudra-chart-track">

        <div
          className="samudra-chart-observed"
          style={{ width }}
        ></div>

        <div className="samudra-chart-marker"></div>

      </div>

      <span className="samudra-chart-value">
        {prediction} / {observed}
      </span>

    </div>
  );
}