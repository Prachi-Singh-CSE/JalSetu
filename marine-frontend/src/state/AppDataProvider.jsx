import { useCallback, useEffect, useReducer } from "react";
import {
  getAuthorityAlerts,
  fetchLiveAlerts,
  updateAlertState,
  backendUnavailableAlert,
  getDataSourceHealth,
  setDemoSourceStatus,
  getInitialChat,
  getMarineSnapshot,
  getRiskAssessment,
  getRouteOptions,
  getSOSDetails,
  getWelfareSchemes,
  createSOSEvent,
  acknowledgeSOSEvent,
  evaluateIMBLSafety,
  IMBL_DWELL_THRESHOLD_SECONDS,
  askChat,
  answerWelfareQuestion,
} from "../services";
import { AppDataContext } from "./AppDataContext";
import { useLanguage } from "./useLanguage";

function createInitialState() {
  const marine = getMarineSnapshot();
  const dataSources = getDataSourceHealth();
  const risk = getRiskAssessment(marine, dataSources);
  const imbl = evaluateIMBLSafety({ routeId: "safer", marineData: marine });

  return {
    marine,
    risk,
    routes: getRouteOptions(),
    selectedRouteId: "safer",
    routeChangeReason: null,
    imbl,
    imblDismissed: false,
    // Dwell timer for the IMBL buffer zone: `active` starts the moment the
    // vessel enters a non-SAFE distance band, and resets the instant it
    // leaves — so a brief drift through the buffer never escalates.
    // Escalation to the authority dashboard only fires once `elapsedSeconds`
    // crosses IMBL_DWELL_THRESHOLD_SECONDS while continuously inside.
    imblDwell: { active: false, enteredAt: null, elapsedSeconds: 0, escalated: false },
    location: {
      position: marine.userPosition,
      status: "fallback",
      source: "demo",
    },
    alerts: [],
    alertsLoading: true,
    alertsLive: false,
    authorityAlerts: getAuthorityAlerts(),
    chat: getInitialChat({ risk, marineData: marine, dataSourceHealth: dataSources }),
    sos: getSOSDetails(),
    welfare: getWelfareSchemes(),
    // Multi-turn history for the Welfare Scheme Assistant, mirroring `chat`
    // above so both screens can share the ChatWindow component. Seeded with
    // the same placeholder used previously as Government.jsx's static
    // fallback answer.
    welfareChat: [
      {
        id: "welfare-seed",
        answer:
          "Based on your profile — registered trawler owner in Maharashtra with 5 crew — you most likely qualify for three schemes. PMMSY covers equipment and safety upgrades, the state diesel subsidy covers fuel, and the fisheries Kisan Credit Card covers working capital.",
        sources: ["GPS"],
        confidence: { level: "Moderate", score: 86 },
      },
    ],
    dataSources,
    lastDemoSOS: null,
    sosEvents: [],
    imblEscalations: [],
  };
}

function appDataReducer(state, action) {
  switch (action.type) {
    case "set-live-alerts":
      {
        const previous = new Map(state.alerts.map((alert) => [alert.id, alert]));
        const merged = action.alerts.map((alert) => {
          const local = previous.get(alert.id);
          if (!local) return alert;
          return {
            ...alert,
            read: Boolean(alert.read || local.read),
            acknowledged: Boolean(alert.acknowledged || local.acknowledged),
            status:
              local.status === "dismissed" || alert.status === "dismissed"
                ? "dismissed"
                : alert.acknowledged || local.acknowledged
                  ? "acknowledged"
                  : alert.status,
          };
        });
        return {
          ...state,
          alerts: merged,
          alertsLoading: false,
          alertsLive: !action.liveFailed,
        };
      }
    case "acknowledge-alert":
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.alertId ? { ...alert, status: "acknowledged", acknowledged: true, read: true } : alert
        ),
        authorityAlerts: state.authorityAlerts.map((alert) =>
          alert.id === action.alertId ? { ...alert, status: "Acknowledged" } : alert
        ),
      };
    case "record-demo-sos":
      {
        const event = createSOSEvent(action.details);
        return {
          ...state,
          lastDemoSOS: event,
          sosEvents: [...state.sosEvents, event],
        };
      }
    case "append-chat":
      return { ...state, chat: [...state.chat, action.message] };
    case "read-alert":
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.alertId ? { ...alert, read: true } : alert
        ),
      };
    case "dismiss-alert":
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.alertId ? { ...alert, status: "dismissed", read: true } : alert
        ),
      };
    case "set-source-status":
      {
        setDemoSourceStatus(action.sourceId, action.status);
        const dataSources = getDataSourceHealth();
        const risk = getRiskAssessment(state.marine, dataSources);
        return { ...state, dataSources, risk };
      }
    case "select-route":
      {
        const imbl = evaluateIMBLSafety({ routeId: action.routeId, marineData: state.marine });
        const wasApproaching = state.imbl.approaching;
        const nowApproaching = imbl.approaching;

        // Start the dwell clock the instant the vessel enters the buffer;
        // clear it the instant it leaves. Staying inside across repeated
        // "select-route" evaluations (or the ticking clock below) is what
        // eventually triggers escalation — a single crossing does not.
        let imblDwell = state.imblDwell;
        if (nowApproaching && !wasApproaching) {
          imblDwell = { active: true, enteredAt: Date.now(), elapsedSeconds: 0, escalated: false };
        } else if (!nowApproaching) {
          imblDwell = { active: false, enteredAt: null, elapsedSeconds: 0, escalated: false };
        }

        return {
          ...state,
          selectedRouteId: action.routeId,
          routeChangeReason: action.reason || null,
          imbl,
          imblDismissed: false,
          imblDwell,
        };
      }
    case "imbl-dwell-tick":
      {
        if (!state.imblDwell.active || state.imblDwell.escalated) return state;

        const elapsedSeconds = Math.floor((Date.now() - state.imblDwell.enteredAt) / 1000);

        if (elapsedSeconds < IMBL_DWELL_THRESHOLD_SECONDS) {
          return { ...state, imblDwell: { ...state.imblDwell, elapsedSeconds } };
        }

        // Threshold crossed while continuously inside the buffer — this is
        // the sustained-incursion case, so escalate to the authority
        // dashboard now (distinct from the on-app warning shown all along).
        const escalation = {
          id: `IMBL-DEMO-${Date.now()}`,
          type: "IMBL",
          title: "IMBL Escalation — sustained boundary incursion",
          location: state.imbl.location.join(", "),
          time: "Just now",
          severity: state.imbl.status,
          status: "ACTIVE",
          distanceKm: state.imbl.distanceKm,
          dwellSeconds: elapsedSeconds,
          recommendedAction: state.imbl.recommendedAction,
        };

        return {
          ...state,
          imblDwell: { ...state.imblDwell, elapsedSeconds, escalated: true },
          imblEscalations: [...state.imblEscalations.filter((item) => item.status !== "ACTIVE"), escalation],
        };
      }
    case "dismiss-imbl":
      return { ...state, imblDismissed: true };
    case "acknowledge-authority":
      return {
        ...state,
        sosEvents: state.sosEvents.map((event) =>
          event.id === action.id ? acknowledgeSOSEvent(event) : event
        ),
        imblEscalations: state.imblEscalations.map((event) =>
          event.id === action.id ? { ...event, status: "ACKNOWLEDGED" } : event
        ),
        authorityAlerts: state.authorityAlerts.map((event) =>
          event.id === action.id ? { ...event, status: "Acknowledged" } : event
        ),
      };
    case "update-location":
      return { ...state, location: action.location };
    case "replay-hazard-push":
      // Demo-only: simulates a fresh unsolicited push by marking active
      // hazard-type alerts unread again so the proactive banner re-appears,
      // without touching alerts the user has already dismissed for good.
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.status === "dismissed" ? alert : { ...alert, read: false, status: "active" }
        ),
      };
    case "answer-welfare":
      return { ...state, welfareResponse: answerWelfareQuestion(action.question) };
    case "append-welfare-chat":
      {
        // answerWelfareQuestion's return shape is defined elsewhere in the
        // service layer; normalize defensively so a missing field never
        // breaks the shared ChatWindow's rendering.
        const response = answerWelfareQuestion(action.question) || {};
        const turn = {
          id: `welfare-${Date.now()}`,
          question: action.question,
          answer: response.answer || "",
          sources: response.sources || ["GPS"],
          confidence: response.confidence || { level: "Moderate", score: 86 },
        };
        return {
          ...state,
          welfareResponse: response, // kept for any other existing consumer
          welfareChat: [...state.welfareChat, turn],
        };
      }
    default:
      return state;
  }
}

export function AppDataProvider({ children }) {
  const { language } = useLanguage();
  const [state, dispatch] = useReducer(appDataReducer, undefined, createInitialState);

  const acknowledgeAlert = (alertId) => {
    dispatch({ type: "acknowledge-alert", alertId });
    updateAlertState(alertId, "acknowledge").catch(() => {});
  };
  const markAlertRead = (alertId) => {
    dispatch({ type: "read-alert", alertId });
    updateAlertState(alertId, "read").catch(() => {});
  };
  const dismissAlert = (alertId) => {
    dispatch({ type: "dismiss-alert", alertId });
    updateAlertState(alertId, "dismiss").catch(() => {});
  };
  const recordDemoSOS = (details) =>
    dispatch({ type: "record-demo-sos", details });
  const askQuestion = (question) =>
    dispatch({
      type: "append-chat",
      message: askChat(question, {
        risk: state.risk,
        marineData: state.marine,
        dataSourceHealth: state.dataSources,
        previousMessages: state.chat,
        language,
      }),
    });
  const selectRoute = (routeId, reason) =>
    dispatch({ type: "select-route", routeId, reason });
  const dismissIMBL = () => dispatch({ type: "dismiss-imbl" });
  const acknowledgeAuthority = (id) =>
    dispatch({ type: "acknowledge-authority", id });
  const setSourceStatus = useCallback(
    (sourceId, status) => dispatch({ type: "set-source-status", sourceId, status }),
    []
  );
  const updateLocation = useCallback(
    (location) => dispatch({ type: "update-location", location }),
    []
  );
  const replayHazardPush = useCallback(() => dispatch({ type: "replay-hazard-push" }), []);
  const askWelfare = (question) =>
    dispatch({ type: "append-welfare-chat", question });

  // Runs the IMBL dwell clock: while the vessel is inside the buffer zone
  // and hasn't already escalated, tick once a second so the UI countdown
  // and the eventual authority-dashboard escalation both advance in real
  // time. Stops automatically once the vessel leaves the buffer or the
  // escalation has already fired.
  useEffect(() => {
    if (!state.imblDwell.active || state.imblDwell.escalated) return undefined;

    const interval = setInterval(() => {
      dispatch({ type: "imbl-dwell-tick" });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.imblDwell.active, state.imblDwell.escalated, state.imblDwell.enteredAt]);

  const positionKey = Array.isArray(state.location?.position)
    ? state.location.position.join(",")
    : "";

  useEffect(() => {
    let cancelled = false;

    async function loadAlerts() {
      const [lat, lon] = positionKey.split(",").map(Number);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

      try {
        const data = await fetchLiveAlerts(lat, lon);
        if (!cancelled) {
          dispatch({ type: "set-live-alerts", alerts: data.alerts });
        }
      } catch {
        if (!cancelled) {
          dispatch({
            type: "set-live-alerts",
            alerts: [backendUnavailableAlert()],
            liveFailed: true,
          });
        }
      }
    }

    loadAlerts();
    const interval = setInterval(loadAlerts, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [positionKey]);

  return (
    <AppDataContext.Provider value={{ state, acknowledgeAlert, markAlertRead, dismissAlert, recordDemoSOS, askQuestion, selectRoute, updateLocation, dismissIMBL, acknowledgeAuthority, setSourceStatus, askWelfare, replayHazardPush }}>
      {children}
    </AppDataContext.Provider>
  );
}