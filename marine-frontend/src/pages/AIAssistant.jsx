import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

import Navbar from "../components/Navbar";
import ChatWindow from "../components/ChatWindow";
import { useAppData } from "../state/useAppData";
import { useLanguage } from "../state/useLanguage";
import { voiceLangFor } from "../i18n/voiceLang";
import "./AIAssistant.css";

export default function AIAssistant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { state, askQuestion } = useAppData();
  const { language, t } = useLanguage();

  const quickPrompts = t("ai.quickPrompts");

  const submitMessage = (question) => {
    setError("");
    setLoading(true);

    window.setTimeout(() => {
      try {
        askQuestion(question);
      } catch {
        setError(t("ai.errorStatus"));
      } finally {
        setLoading(false);
      }
    }, 180);
  };

  // Two scripted opening turns that seed the demo, followed by whatever the
  // person has actually asked (state.chat) rendered with the full structured
  // risk/confidence/why/actions breakdown.
  const messages = [
    {
      id: "demo-1",
      question: "Is it safe to go fishing today?",
      answer: (
        <>
          Conditions near your current location are currently
          <strong> {state.risk.status}.</strong> Wave height is {state.marine.ocean.waveHeight}
          {" "}and wind is {state.marine.ocean.wind}. A nearby hazard is present on the current
          route. {state.risk.recommendation}
        </>
      ),
      sources: ["INCOIS", "IMD", "GPS"],
      confidence: state.risk.confidence,
      reasoning: (
        <>
          <p>
            Risk is calculated using current ocean conditions, weather, nearby hazards, vessel
            position and IMBL proximity.
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
        </>
      ),
      suggestions: ["What about tomorrow?", "Explain my risk score", "Find safe harbour"],
    },
    {
      id: "demo-2",
      question: "Explain my risk score",
      answer: (
        <>
          Your score is <strong>{state.risk.score} / 100</strong>.
          {state.risk.factors
            .filter((factor) => factor.points > 0)
            .map((factor) => ` ${factor.name} contributes ${factor.points} points.`)}{" "}
          {state.risk.status} for the current demo conditions.
        </>
      ),
      sources: ["INCOIS", "IMD", "OCEAN MODEL", "GPS"],
      confidence: state.risk.confidence,
      suggestions: ["What about tomorrow?", "View safer route"],
    },
    ...state.chat
      .filter((item) => item.question)
      .map((item) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        sources: item.sources,
        confidence: item.confidence,
        structured: {
          risk: item.risk,
          confidence: item.confidence,
          factors: item.factors,
          warnings: item.warnings,
          recommendation: item.recommendation,
          actions: item.actions,
        },
      })),
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
            <h1>{t("ai.title")}</h1>
            <p>{t("ai.subtitle")}</p>
          </div>

          <span className="demo-badge">{t("ai.demoBadge")}</span>
        </div>

        {/* ================= MAIN CONTENT ================= */}

        <div className="ai-layout">
          <ChatWindow
            messages={messages}
            onSubmit={submitMessage}
            onNavigate={navigate}
            loading={loading}
            error={error}
            voiceLang={voiceLangFor(language)}
            placeholder={t("ai.inputPlaceholder")}
            listeningPlaceholder={t("ai.listening")}
            sendLabel={t("ai.send")}
            inputNote={t("ai.inputNote")}
            voiceUnsupportedLabel={t("ai.voiceUnsupported")}
          />

          {/* ================= RIGHT SIDEBAR ================= */}

          <aside className="ai-sidebar">
            {/* QUICK PROMPTS */}
            <section className="quick-prompts">
              <h2>{t("ai.quickPromptsTitle")}</h2>

              <div className="prompt-list">
                {quickPrompts.map((prompt) => (
                  <button key={prompt} onClick={() => submitMessage(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </section>

            {/* COPILOT CONTEXT */}
            <section className="copilot-context">
              <h2>{t("ai.contextTitle")}</h2>

              <div className="context-list">
                <ContextItem label="Your position" value="19.6200° N, 71.9500° E" />

                <ContextItem
                  label="Risk score"
                  value={`${state.risk.score} / 100 · ${state.risk.severity}`}
                  danger
                />

                <ContextItem label="Nearest zone" value="Zone A · 18 km" />
                <ContextItem label="Nearest harbour" value="Vasai · 18.4 km" />
                <ContextItem label="IMBL distance" value="1.8 km" danger />
                <ContextItem label="Active alerts" value="3" danger />
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

/* ================= CONTEXT ITEM ================= */

function ContextItem({ label, value, danger }) {
  return (
    <div className="context-item">
      <span>{label}</span>
      <strong className={danger ? "context-danger" : ""}>{value}</strong>
    </div>
  );
}