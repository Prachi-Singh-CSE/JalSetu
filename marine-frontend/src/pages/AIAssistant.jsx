import { useState } from "react";
import {
  Sparkles,
  Send,
  ChevronDown,
  Database,
  UserRound,
  MapPin,
  Bell,
  Shield,
} from "lucide-react";

import Navbar from "../components/Navbar";
import "./AIAssistant.css";

export default function AIAssistant() {
  const [reasoning1, setReasoning1] = useState(false);
  const [reasoning2, setReasoning2] = useState(false);
  const [message, setMessage] = useState("");

  const quickPrompts = [
    "Can I go fishing today?",
    "Find fishing zones near me",
    "Is there a cyclone nearby?",
    "Take me to a safe harbour",
    "Show hazards near my route",
    "What about tomorrow?",
    "Explain my risk score",
    "How far am I from the IMBL?",
    "Is there any oil spill near my route?",
    "What should I do if I am in danger?",
  ];

  return (
    <div className="ai-page">
      <Navbar />

      <main className="ai-main">

        {/* ================= PAGE HEADER ================= */}

        <div className="ai-page-heading">
          <div className="ai-heading-icon">
            <Sparkles size={15} />
          </div>

          <div>
            <h1>Marine AI Copilot</h1>
            <p>
              Ask anything about your waters, route, safety or fishing.
            </p>
          </div>

          <span className="demo-badge">
            DEMO MODE
          </span>
        </div>

        {/* ================= MAIN CONTENT ================= */}

        <div className="ai-layout">

          {/* ================= CHAT ================= */}

          <section className="chat-panel">

            <div className="chat-messages">

              {/* USER MESSAGE */}

              <div className="message-row user-row">
                <div className="user-message">
                  Is it safe to go fishing today?
                </div>

                <div className="user-avatar">
                  <UserRound size={12} />
                </div>
              </div>

              {/* AI RESPONSE */}

              <div className="message-row ai-row">

                <div className="ai-message">

                  <p>
                    Conditions near your current location are currently
                    <strong> HIGH RISK.</strong> Wave height is 2.8 m and
                    winds are reaching 34 km/h. A severe-weather zone is
                    also nearby, 84 km north-east. I would not recommend
                    going out before tomorrow morning.
                  </p>

                  <div className="message-sources">
                    <span>
                      <Database size={9} />
                      INCOIS
                    </span>

                    <span>IMD</span>
                    <span>GPS</span>

                    <small>
                      Confidence 92% · 14:24 IST
                    </small>
                  </div>

                </div>

              </div>

              {/* REASONING */}

              <ReasoningBar
                open={reasoning1}
                setOpen={setReasoning1}
              />

              {/* SUGGESTIONS */}

              <div className="suggestion-row">
                <button>What about tomorrow?</button>
                <button>Explain my risk score</button>
                <button>Find safe harbour</button>
              </div>

              {/* USER 2 */}

              <div className="message-row user-row second-user">
                <div className="user-message">
                  Explain my risk score
                </div>

                <div className="user-avatar">
                  <UserRound size={12} />
                </div>
              </div>

              {/* AI RESPONSE 2 */}

              <div className="message-row ai-row">

                <div className="ai-message">

                  <p>
                    Your score is <strong>76 / 100</strong>. Wave height
                    contributes the most (28 points), then cyclone proximity
                    (22), wind (14), nearby hazards (8) and IMBL proximity
                    (4). Lightning adds nothing right now. Anything above
                    70 is HIGH RISK for your vessel class.
                  </p>

                  <div className="message-sources">
                    <span>
                      <Database size={9} />
                      INCOIS
                    </span>

                    <span>IMD</span>
                    <span>OCEAN MODEL</span>
                    <span>GPS</span>

                    <small>
                      Confidence 92% · Just now
                    </small>
                  </div>

                </div>

              </div>

              {/* REASONING 2 */}

              <ReasoningBar
                open={reasoning2}
                setOpen={setReasoning2}
              />

              {/* SUGGESTIONS 2 */}

              <div className="suggestion-row">
                <button>What about tomorrow?</button>
                <button>View Safer Route</button>
              </div>

            </div>

            {/* INPUT */}

            <div className="chat-input-area">

              <div className="chat-input">

                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask anything about your waters..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && message.trim()) {
                      setMessage("");
                    }
                  }}
                />

                <button
                  className="send-button"
                  onClick={() => setMessage("")}
                >
                  <Send size={13} />
                  Send
                </button>

              </div>

              <p className="input-note">
                Answers combine prepared demo feeds. Always confirm
                with your own judgement at sea.
              </p>

            </div>

          </section>

          {/* ================= RIGHT SIDEBAR ================= */}

          <aside className="ai-sidebar">

            {/* QUICK PROMPTS */}

            <section className="quick-prompts">

              <h2>Quick prompts</h2>

              <div className="prompt-list">

                {quickPrompts.map((prompt) => (
                  <button key={prompt}>
                    {prompt}
                  </button>
                ))}

              </div>

            </section>

            {/* COPILOT CONTEXT */}

            <section className="copilot-context">

              <h2>What the copilot can see</h2>

              <div className="context-list">

                <ContextItem
                  label="Your position"
                  value="19.6200° N, 71.9500° E"
                />

                <ContextItem
                  label="Risk score"
                  value="76 / 100 · HIGH"
                  danger
                />

                <ContextItem
                  label="Nearest zone"
                  value="Zone A · 18 km"
                />

                <ContextItem
                  label="Nearest harbour"
                  value="Vasai · 18.4 km"
                />

                <ContextItem
                  label="IMBL distance"
                  value="1.8 km"
                  danger
                />

                <ContextItem
                  label="Active alerts"
                  value="3"
                  danger
                />

              </div>

              <div className="context-sources">

                <span>GPS</span>
                <span>INCOIS</span>
                <span>IMD</span>
                <span>MOSDAC</span>
                <span>AIS</span>

              </div>

            </section>

          </aside>

        </div>

      </main>
    </div>
  );
}


/* ================= REASONING ================= */

function ReasoningBar({ open, setOpen }) {
  return (
    <div className={`reasoning-wrapper ${open ? "open" : ""}`}>

      <button
        className="reasoning-bar"
        onClick={() => setOpen(!open)}
      >
        <span>
          <Sparkles size={12} />
          View reasoning
        </span>

        <ChevronDown
          size={13}
          className={open ? "rotate" : ""}
        />
      </button>

      {open && (
        <div className="reasoning-details">
          <p>
            Risk is calculated using current ocean conditions,
            weather, nearby hazards, vessel position and IMBL
            proximity.
          </p>

          <div>
            <span>Ocean conditions</span>
            <strong>High impact</strong>
          </div>

          <div>
            <span>Weather</span>
            <strong>Moderate impact</strong>
          </div>

          <div>
            <span>IMBL proximity</span>
            <strong>Low impact</strong>
          </div>
        </div>
      )}

    </div>
  );
}


/* ================= CONTEXT ITEM ================= */

function ContextItem({ label, value, danger }) {
  return (
    <div className="context-item">

      <span>{label}</span>

      <strong className={danger ? "context-danger" : ""}>
        {value}
      </strong>

    </div>
  );
}