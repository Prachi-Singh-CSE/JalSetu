import { AlertTriangle, TriangleAlert, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../state/useAppData";
import "./ProactiveHazardBanner.css";

const SEVERITY_ORDER = { High: 0, Medium: 1, Low: 2, CRITICAL: 0, WARNING: 1, CAUTION: 2 };

/**
 * Unsolicited, app-wide hazard push notifications.
 *
 * This is deliberately separate from the Alerts *page* (which the user has
 * to navigate to). This component mounts once in App.jsx and surfaces
 * unread, active, non-IMBL alerts as toasts on top of whatever page the
 * user is already on — the "push notification" the requirements doc asks
 * for. IMBL proximity has its own dedicated banner (IMBLSafetyWarning), so
 * it's excluded here to avoid showing the same warning twice.
 */
export default function ProactiveHazardBanner() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state, markAlertRead, dismissAlert } = useAppData();

  // Don't stack toasts on top of the page whose entire job is showing them.
  if (pathname === "/alerts") return null;

  const pending = state.alerts
    .filter((alert) => alert.type !== "IMBL" && alert.status === "active" && !alert.read)
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 2) - (SEVERITY_ORDER[b.severity] ?? 2))
    .slice(0, 3);

  if (pending.length === 0) return null;

  return (
    <div className="proactive-hazard-stack" aria-live="polite">
      {pending.map((alert) => (
        <article
          key={alert.id}
          className={`proactive-hazard-toast ${(alert.severity || "low").toLowerCase()}`}
          role="alert"
        >
          <div className="proactive-hazard-icon">
            {alert.severity === "WARNING" ? <AlertTriangle size={16} /> : <TriangleAlert size={16} />}
          </div>

          <div className="proactive-hazard-body">
            <div className="proactive-hazard-heading">
              <span className="proactive-hazard-severity">{alert.severity}</span>
              <span className="proactive-hazard-type">{alert.type.replace(/_/g, " ")}</span>
            </div>

            <strong>{alert.title}</strong>
            <p>{alert.message}</p>

            <div className="proactive-hazard-actions">
              <button
                onClick={() => {
                  markAlertRead(alert.id);
                  navigate(alert.mapPath);
                }}
              >
                View
              </button>
              <button
                className="proactive-hazard-dismiss-text"
                onClick={() => dismissAlert(alert.id)}
              >
                Dismiss
              </button>
            </div>
          </div>

          <button
            className="proactive-hazard-close"
            aria-label="Mark alert as read"
            onClick={() => markAlertRead(alert.id)}
          >
            <X size={13} />
          </button>
        </article>
      ))}
    </div>
  );
}