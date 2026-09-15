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

function buildDerivedData(marine, dataSources, imbl) {
  const risk = getRiskAssessment(marine, dataSources);
  const alerts = evaluateMarineAlerts(marine, dataSources, imbl);

  return {
    risk,
    alerts,
  };
}

function createInitialState() {
  const marine = getMarineSnapshot();
  const dataSources = getDataSourceHealth();
  const imbl = evaluateIMBLSafety({
    routeId: "safer",
    marineData: marine,
  });

  const { risk, alerts } = buildDerivedData(
    marine,
    dataSources,
    imbl
  );

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

    chat: getInitialChat({
      risk,
      marineData: marine,
      dataSourceHealth: dataSources,
    }),

    sos: getSOSDetails(),
    welfare: getWelfareSchemes(),

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
          alert.id === action.alertId
            ? {
                ...alert,
                status: "acknowledged",
                acknowledged: true,
                read: true,
              }
            : alert
        ),

        authorityAlerts: state.authorityAlerts.map((alert) =>
          alert.id === action.alertId
            ? {
                ...alert,
                status: "Acknowledged",
              }
            : alert
        ),
      };
      case "replay-demo-hazard": {
  const demoAlert = {
    id: `DEMO-HAZARD-${Date.now()}`,
    type: "LIGHTNING",
    severity: "WARNING",
    title: "Lightning activity detected",
    message:
      "Lightning activity has been detected near the planned fishing area. Consider delaying departure or moving to a safer area.",
    location: "Arabian Sea · Demo Zone",
    timestamp: "Just now",
    status: "active",
    acknowledged: false,
    read: false,
    mapPath: "/map?focus=hazards",
    sources: ["IMD / Weather"],
  };

  return {
    ...state,
    alerts: [
      demoAlert,
      ...state.alerts.filter(
        (alert) => alert.status !== "dismissed"
      ),
    ],
  };
}



    case "record-demo-sos": {
      const event = createSOSEvent(action.details);

      return {
        ...state,
        lastDemoSOS: event,
        sosEvents: [...state.sosEvents, event],
      };
    }

    case "append-chat":
      return {
        ...state,
        chat: [...state.chat, action.message],
      };

    case "read-alert":
      return {
        ...state,

        alerts: state.alerts.map((alert) =>
          alert.id === action.alertId
            ? {
                ...alert,
                read: true,
              }
            : alert
        ),
      };

    case "dismiss-alert":
      return {
        ...state,

        alerts: state.alerts.map((alert) =>
          alert.id === action.alertId
            ? {
                ...alert,
                status: "dismissed",
                read: true,
              }
            : alert
        ),
      };

    case "set-source-status": {
      setDemoSourceStatus(action.sourceId, action.status);

      const dataSources = getDataSourceHealth();

      const { risk, alerts } = buildDerivedData(
        state.marine,
        dataSources,
        state.imbl
      );

      return {
        ...state,
        dataSources,
        risk,
        alerts,
      };
    }

    case "select-route": {
      const imbl = evaluateIMBLSafety({
        routeId: action.routeId,
        marineData: state.marine,
      });

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

      const { alerts } = buildDerivedData(
        state.marine,
        state.dataSources,
        imbl
      );

      return {
        ...state,

        selectedRouteId: action.routeId,

        routeChangeReason:
          action.reason || null,

        imbl,

        alerts,

        imblDismissed: false,

        imblEscalations: escalation
          ? [
              ...state.imblEscalations.filter(
                (item) => item.status !== "ACTIVE"
              ),
              escalation,
            ]
          : state.imblEscalations,
      };
    }

    case "dismiss-imbl":
      return {
        ...state,
        imblDismissed: true,
      };

    case "acknowledge-authority":
      return {
        ...state,

        sosEvents: state.sosEvents.map((event) =>
          event.id === action.id
            ? acknowledgeSOSEvent(event)
            : event
        ),

        imblEscalations: state.imblEscalations.map((event) =>
          event.id === action.id
            ? {
                ...event,
                status: "ACKNOWLEDGED",
              }
            : event
        ),

        authorityAlerts: state.authorityAlerts.map((event) =>
          event.id === action.id
            ? {
                ...event,
                status: "Acknowledged",
              }
            : event
        ),
      };

    case "update-location":
      return {
        ...state,
        location: action.location,
      };

    case "answer-welfare":
      return {
        ...state,
        welfareResponse: answerWelfareQuestion(action.question),
      };

    default:
      return state;
  }
}

export function AppDataProvider({ children }) {
  const [state, dispatch] = useReducer(
    appDataReducer,
    undefined,
    createInitialState
  );

  const acknowledgeAlert = (alertId) =>
    dispatch({
      type: "acknowledge-alert",
      alertId,
    });

  const markAlertRead = (alertId) =>
    dispatch({
      type: "read-alert",
      alertId,
    });

  const dismissAlert = (alertId) =>
    dispatch({
      type: "dismiss-alert",
      alertId,
    });
    const replayDemoHazard = () =>
  dispatch({
    type: "replay-demo-hazard",
  });

  const recordDemoSOS = (details) =>
    dispatch({
      type: "record-demo-sos",
      details,
    });

  const askQuestion = (question) =>
    dispatch({
      type: "append-chat",
      message: askChat(question, {
        risk: state.risk,
        marineData: state.marine,
        dataSourceHealth: state.dataSources,
        previousMessages: state.chat,
      }),
    });

  const selectRoute = (routeId, reason) =>
    dispatch({
      type: "select-route",
      routeId,
      reason,
    });

  const dismissIMBL = () =>
    dispatch({
      type: "dismiss-imbl",
    });

  const acknowledgeAuthority = (id) =>
    dispatch({
      type: "acknowledge-authority",
      id,
    });

  const setSourceStatus = useCallback(
    (sourceId, status) =>
      dispatch({
        type: "set-source-status",
        sourceId,
        status,
      }),
    []
  );

  const updateLocation = useCallback(
    (location) =>
      dispatch({
        type: "update-location",
        location,
      }),
    []
  );

  const askWelfare = (question) =>
    dispatch({
      type: "answer-welfare",
      question,
    });

  return (
    <AppDataContext.Provider
      value={{
        state,
        acknowledgeAlert,
        markAlertRead,
        dismissAlert,
        recordDemoSOS,
        askQuestion,
        selectRoute,
        updateLocation,
        dismissIMBL,
        acknowledgeAuthority,
        setSourceStatus,
        askWelfare,
        replayDemoHazard,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}