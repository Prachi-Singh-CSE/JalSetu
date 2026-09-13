import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import "./EmergencySOS.css";

function EmergencySOS() {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sent, setSent] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const animationRef = useRef(null);

  const startHold = () => {
    if (sent) return;

    setHolding(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const percentage = Math.min((elapsed / 3000) * 100, 100);

      setProgress(percentage);

      if (percentage >= 100) {
        sendSOS();
        return;
      }

      animationRef.current = requestAnimationFrame(updateProgress);
    };

    animationRef.current = requestAnimationFrame(updateProgress);

    timerRef.current = setTimeout(() => {
      sendSOS();
    }, 3000);
  };

  const cancelHold = () => {
    if (sent) return;

    setHolding(false);
    setProgress(0);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const sendSOS = () => {
    if (sent) return;

    setHolding(false);
    setProgress(100);
    setSent(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Demo action
    console.log("SOS SENT");
  };

  const resetSOS = () => {
    setSent(false);
    setHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <Navbar />

      <main className="sos-page">
        <div className="sos-container">

          <div className="sos-header">
            <div>
              <p className="sos-eyebrow">
                EMERGENCY · SAFETY SYSTEM
              </p>

              <h1>Emergency SOS</h1>

              <p>
                Send your location and emergency status to your saved
                contacts and nearby rescue services.
              </p>
            </div>

            <div className="sos-status">
              <span className="status-dot"></span>
              {sent ? "SOS ACTIVE" : "SYSTEM READY"}
            </div>
          </div>

          <section className={`sos-main-card ${sent ? "sos-sent" : ""}`}>

            <div
              className={`sos-circle ${holding ? "holding" : ""} ${
                sent ? "sent" : ""
              }`}
              style={{
                "--progress": `${progress}%`,
              }}
            >
              <div className="sos-inner">
                {sent ? (
                  <>
                    <span>✓</span>
                    <small>SOS SENT</small>
                  </>
                ) : (
                  <>
                    <span>SOS</span>
                    <small>
                      {holding
                        ? `${(progress / 100 * 3).toFixed(1)}s`
                        : "EMERGENCY"}
                    </small>
                  </>
                )}
              </div>
            </div>

            {sent ? (
              <>
                <h2>SOS Alert Sent</h2>

                <p className="sos-description">
                  Your emergency alert has been triggered. Your location
                  and vessel details have been shared with your emergency
                  contact.
                </p>

                <button
                  className="sos-reset-btn"
                  onClick={resetSOS}
                >
                  RESET SOS
                </button>
              </>
            ) : (
              <>
                <h2>
                  {holding
                    ? "Keep holding..."
                    : "Need immediate help?"}
                </h2>

                <p className="sos-description">
                  {holding
                    ? "Keep holding the button for 3 seconds to send the emergency alert."
                    : "Press and hold the SOS button for 3 seconds to send an emergency alert."}
                </p>

                <button
                  className={`sos-trigger ${
                    holding ? "is-holding" : ""
                  }`}
                  onMouseDown={startHold}
                  onMouseUp={cancelHold}
                  onMouseLeave={cancelHold}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    startHold();
                  }}
                  onTouchEnd={cancelHold}
                  onTouchCancel={cancelHold}
                >
                  <span>⚠</span>

                  {holding
                    ? "KEEP HOLDING"
                    : "HOLD TO SEND SOS"}
                </button>

                <p className="sos-note">
                  Release before 3 seconds to cancel.
                </p>
              </>
            )}

          </section>

          <div className="sos-grid">

            <section className="sos-info-card">
              <div className="info-icon">⌖</div>

              <div>
                <span>YOUR LOCATION</span>
                <strong>Location services active</strong>
                <small>GPS accuracy · High</small>
              </div>

              <span className="verified">● LIVE</span>
            </section>

            <section className="sos-info-card">
              <div className="info-icon">♧</div>

              <div>
                <span>EMERGENCY CONTACT</span>
                <strong>Ramesh Kolekar</strong>
                <small>Family contact · +91 XXXXX XXXXX</small>
              </div>

              <button>EDIT</button>
            </section>

            <section className="sos-info-card">
              <div className="info-icon">⚓</div>

              <div>
                <span>REGISTERED VESSEL</span>
                <strong>Sagar Rani</strong>
                <small>IND-KL-2291 · Crew 5</small>
              </div>

              <span className="verified">✓ VERIFIED</span>
            </section>

          </div>

          <section className="sos-protocol">

            <div className="protocol-heading">
              <span>EMERGENCY PROTOCOL</span>
              <small>WHAT HAPPENS AFTER SOS</small>
            </div>

            <div className="protocol-steps">

              <div className="protocol-step">
                <div className="step-number">01</div>

                <div>
                  <strong>Location captured</strong>
                  <p>
                    Your latest GPS coordinates are attached.
                  </p>
                </div>
              </div>

              <div className="protocol-line"></div>

              <div className="protocol-step">
                <div className="step-number">02</div>

                <div>
                  <strong>Contacts alerted</strong>
                  <p>
                    Your saved emergency contact receives the alert.
                  </p>
                </div>
              </div>

              <div className="protocol-line"></div>

              <div className="protocol-step">
                <div className="step-number">03</div>

                <div>
                  <strong>Rescue assistance</strong>
                  <p>
                    Nearest available authority is notified.
                  </p>
                </div>
              </div>

            </div>

          </section>

          <div className="sos-footer">
            <span>⚠</span>
            Only use SOS for genuine emergencies. False emergency
            alerts may delay assistance to others.
          </div>

        </div>
      </main>
    </>
  );
}

export default EmergencySOS;