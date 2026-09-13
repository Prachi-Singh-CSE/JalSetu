import "./Intelligence.css";
import Navbar from "../components/Navbar";

const evidenceItems = [
  {
    type: "good",
    text: "SAR backscatter anomaly detected",
  },
  {
    type: "good",
    text: "Slick-like geometry consistent with surface film",
  },
  {
    type: "good",
    text: "Vessel detected 7.4 km from estimated spill location",
  },
  {
    type: "warning",
    text: "AIS correlation incomplete — requires verification",
  },
];

export default function Intelligence() {
  return (
    <>
    <Navbar />

    <main className="intelligence-page">
      <div className="intelligence-content">

        {/* ================= HEADER ================= */}

        <header className="intelligence-header">

          <div className="intelligence-heading">
            <h1>Maritime Intelligence</h1>

            <p>
              Satellite (SAR) anomaly detection with vessel correlation.
              All associations are analytical evidence pending field
              verification.
            </p>
          </div>

          <div className="intelligence-status">

            <div className="intelligence-status-top">
              <span className="fresh-badge">
                <span className="fresh-dot"></span>
                FRESH
              </span>

              <span className="updated-text">
                Last updated 14 min ago
              </span>
            </div>

            <div className="intelligence-tags">
              <span>SATELLITE DEMO DATA</span>
              <span>AIS: DEMO / PROVIDER PENDING</span>
            </div>

          </div>

        </header>


        {/* ================= MAIN GRID ================= */}

        <div className="intelligence-grid">

          {/* ================= SAR MAP ================= */}

          <section className="sar-card">

            <div className="sar-header">

              <div className="sar-title">
                <span className="sar-icon">⌁</span>

                <strong>
                  SAR SCENE · SECTOR AR-11 · 13:52 IST
                </strong>
              </div>

              <span className="sar-meta">
                VV polarisation · 10 m
              </span>

            </div>


            {/* MAP */}
            <div className="sar-map">

              {/* grid */}
              <div className="map-grid"></div>

              {/* latitude labels */}
              <span className="lat lat-1">21°N</span>
              <span className="lat lat-2">20°N</span>
              <span className="lat lat-3">20°N</span>
              <span className="lat lat-4">20°N</span>


              {/* coastline / large red strip */}
              <div className="coastline"></div>

              {/* dashed boundary */}
              <div className="boundary-line"></div>


              {/* spill polygon */}
              <div className="spill-area">
                <div className="spill-inner"></div>
              </div>


              {/* vessel without AIS */}
              <div className="vessel-marker"></div>


              {/* current vessel */}
              <div className="current-location">
                <span></span>
              </div>


              {/* small vessel/aircraft marker */}
              <div className="small-marker">▲</div>

            </div>


            {/* MAP LEGEND */}
            <div className="sar-footer">

              <div className="sar-legend">

                <span className="legend-item">
                  <span className="legend-square"></span>
                  Low-backscatter anomaly
                </span>

                <span className="legend-item">
                  <span className="legend-diamond"></span>
                  Vessel without AIS
                </span>

              </div>


              <div className="sar-source-tags">

                <span className="source-icon">▤</span>

                <span>SAR</span>
                <span>SATELLITE</span>
                <span>AIS</span>

              </div>

            </div>

          </section>


          {/* ================= RIGHT COLUMN ================= */}

          <section className="intelligence-right">

            {/* ================= DETECTION CARD ================= */}

            <div className="detection-card">

              <div className="detection-heading">

                <div className="warning-icon">
                  !
                </div>

                <div>
                  <div className="detection-label">
                    UNVERIFIED DETECTION
                  </div>

                  <h2>Potential Oil Spill</h2>
                </div>

              </div>


              {/* VALUES */}

              <div className="detection-values">

                <div className="detection-value">
                  <span>DETECTION CONFIDENCE</span>
                  <strong>87%</strong>
                </div>

                <div className="detection-value">
                  <span>DETECTED</span>
                  <strong>14 min ago</strong>
                </div>

                <div className="detection-value">
                  <span>AREA</span>
                  <strong>3.2 km²</strong>
                </div>

                <div className="detection-value">
                  <span>CENTROID</span>
                  <strong>20.0200° N, 70.8600° E</strong>
                </div>

              </div>


              {/* EVIDENCE CONFIDENCE */}

              <div className="evidence-confidence">

                <div className="confidence-header">
                  <span>EVIDENCE CONFIDENCE</span>
                  <strong>78%</strong>
                </div>

                <div className="confidence-track">
                  <div></div>
                </div>

              </div>

            </div>


            {/* ================= EVIDENCE CARD ================= */}

            <div className="evidence-card">

              <div className="evidence-heading">

                <div className="evidence-icon">
                  ◎
                </div>

                <h2>Evidence</h2>

              </div>


              <div className="evidence-list">

                {evidenceItems.map((item, index) => (
                  <div
                    className="evidence-row"
                    key={index}
                  >

                    <span
                      className={
                        item.type === "warning"
                          ? "evidence-status warning"
                          : "evidence-status"
                      }
                    >
                      {item.type === "warning" ? "!" : "✓"}
                    </span>

                    <span className="evidence-text">
                      {item.text}
                    </span>

                  </div>
                ))}

              </div>


              {/* DISCLAIMER */}

              <div className="intelligence-disclaimer">
                Potential association only. This analysis does not establish
                that any vessel caused the observed anomaly and requires
                field verification.
              </div>

            </div>

          </section>

        </div>

      </div>
    </main>
    </>
);

}