import { AlertTriangle, Compass, MapPinned } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../state/useAppData";
import "./IMBLSafetyWarning.css";

export default function IMBLSafetyWarning() {
  const navigate = useNavigate();
  const { state, selectRoute, dismissIMBL } = useAppData();
  const warning = state.imbl;

  if (state.imblDismissed) return null;

  const changeRoute = () => {
    selectRoute("safer", "IMBL safety");
    navigate("/routes");
  };

  return (
    <section className={`imbl-safety-warning imbl-${warning.status.toLowerCase()}`} aria-live="polite">
      <div className="imbl-warning-heading">
        <AlertTriangle size={15} />
        <div>
          <strong>IMBL DEMO SAFETY STATUS</strong>
          <span>{warning.status}</span>
        </div>
      </div>

      <p>{warning.warning}</p>

      <div className="imbl-warning-data">
        <span><b>Distance</b>{warning.distanceKm} km</span>
        <span><b>Estimated time</b>{warning.estimatedMinutes} min</span>
      </div>

      <p className="imbl-warning-action">Recommended: {warning.recommendedAction}</p>
      <small>{warning.disclaimer}</small>

      <div className="imbl-warning-actions">
        <button onClick={() => navigate("/map?focus=imbl")}><MapPinned size={13} /> View Map</button>
        {warning.status !== "SAFE" && <button onClick={changeRoute}><Compass size={13} /> Change Route</button>}
        <button onClick={dismissIMBL}>Dismiss</button>
      </div>
    </section>
  );
}
