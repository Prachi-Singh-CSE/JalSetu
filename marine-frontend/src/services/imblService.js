function statusForDistance(distanceKm) {
  if (distanceKm <= 1) return "CRITICAL";
  if (distanceKm <= 2) return "WARNING";
  if (distanceKm <= 5) return "CAUTION";
  return "SAFE";
}

export function evaluateIMBLSafety({ routeId = "safer", marineData }) {
  const routeData = routeId === "fastest"
    ? { distanceKm: 1.8, estimatedMinutes: 11 }
    : { distanceKm: 6.4, estimatedMinutes: 38 };
  const status = statusForDistance(routeData.distanceKm);
  const escalationRequired = status === "CRITICAL";

  return {
    mode: "demo",
    status,
    distanceKm: routeData.distanceKm,
    estimatedMinutes: routeData.estimatedMinutes,
    approaching: status !== "SAFE",
    escalationRequired,
    location: marineData.userPosition,
    warning: status === "SAFE"
      ? "Your selected route remains outside the demo IMBL warning range."
      : "Your vessel is approaching the IMBL demo boundary.",
    recommendedAction: status === "SAFE"
      ? "Remain within the selected safe operating area."
      : "Change route and remain within the safe operating area.",
    disclaimer: "Demo safety calculation; this is not an official live maritime boundary feed.",
  };
}