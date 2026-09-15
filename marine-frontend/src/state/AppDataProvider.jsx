import { useCallback, useReducer } from "react";
import {
  getAuthorityAlerts,
  evaluateMarineAlerts,
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
  const alerts = evaluateMarineAlerts(marine, dataSources, imbl);

  return {
    marine,
    risk,
    routes: getRouteOptions(),
    selectedRouteId: "safer",
    routeChangeReason: null,
    imbl,
    imblDismissed: false,
    location: {
      position: marine.userPosition,
      status: "fallback",
      source: "demo",
    },
    alerts,
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
        const alerts = evaluateMarineAlerts(state.marine, dataSources, state.imbl);
        return { ...state, dataSources, risk, alerts };
      }
    case "select-route":
      {
        const imbl = evaluateIMBLSafety({ routeId: action.routeId, marineData: state.marine });
        const escalation = imbl.escalationRequired
          ? {
              id: `IMBL-DEMO-${Date.now()}`,
              type: "IMBL",
              title: "IMBL Escalation",
              location: imbl.location.join(", "),
              time: "Just now",
              severity: imbl.status,
              status: "ACTIVE",
              distanceKm: imbl.distanceKm,
              recommendedAction: imbl.recommendedAction,
            }
          : null;
        return {
          ...state,
          selectedRouteId: action.routeId,
          routeChangeReason: action.reason || null,
          imbl,
          alerts: evaluateMarineAlerts(state.marine, state.dataSources, imbl),
          imblDismissed: false,
          imblEscalations: escalation
            ? [...state.imblEscalations.filter((item) => item.status !== "ACTIVE"), escalation]
            : state.imblEscalations,
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

  const acknowledgeAlert = (alertId) =>
    dispatch({ type: "acknowledge-alert", alertId });
  const markAlertRead = (alertId) => dispatch({ type: "read-alert", alertId });
  const dismissAlert = (alertId) => dispatch({ type: "dismiss-alert", alertId });
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

  return (
    <AppDataContext.Provider value={{ state, acknowledgeAlert, markAlertRead, dismissAlert, recordDemoSOS, askQuestion, selectRoute, updateLocation, dismissIMBL, acknowledgeAuthority, setSourceStatus, askWelfare, replayHazardPush }}>
      {children}
    </AppDataContext.Provider>
  );
}