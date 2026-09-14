function action(label, to) {
  return { label, to };
}

function responseText(intent, risk, marineData) {
  if (intent === "route") {
    return `The safer demo route is preferred because it avoids the ${marineData.hazards[0]?.name.toLowerCase() || "known hazard area"}.`;
  }
  if (intent === "zone") {
    return "Zone A is the best nearby demo fishing area: it has high potential and a shorter approach than the alternatives.";
  }
  if (intent === "hazard") {
    return `${marineData.hazards.length} hazard is currently recorded near the marine route. Review the map before leaving.`;
  }
  if (intent === "cyclone") {
    return "The demo weather feed includes an elevated weather contribution. Treat the current risk as a reason to verify conditions before departure.";
  }
  if (intent === "boundary") {
    return "Crossing the marked boundary is not recommended while the IMBL proximity warning is active. Use the safer route instead.";
  }
  if (intent === "why") {
    return `The current risk is ${risk.severity.toLowerCase()} because wind, wave height, weather contribution, and the nearby hazard are contributing to the score.`;
  }
  return `Based on the current demo marine data, the risk is ${risk.severity.toLowerCase()} at ${risk.score}/100. ${risk.recommendation}`;
}

function intentForQuestion(question) {
  const normalized = question.toLowerCase();
  if (normalized.includes("why") || normalized.includes("explain")) return "why";
  if (normalized.includes("route") || normalized.includes("harbour") || normalized.includes("harbor")) return "route";
  if (normalized.includes("zone") || normalized.includes("fishing area")) return "zone";
  if (normalized.includes("hazard") || normalized.includes("danger")) return "hazard";
  if (normalized.includes("cyclone") || normalized.includes("weather")) return "cyclone";
  if (normalized.includes("cross") || normalized.includes("imbl") || normalized.includes("boundary")) return "boundary";
  return "risk";
}

export function getInitialChat({ risk, marineData, dataSourceHealth }) {
  return [
    {
      id: "demo-1",
      role: "assistant",
      answer: responseText("risk", risk, marineData),
      risk,
      sources: dataSourceHealth.sources.filter((source) => source.status === "operational").map((source) => source.name),
    },
  ];
}

export function askChat(question, { risk, marineData, dataSourceHealth, previousMessages = [] }) {
  const intent = intentForQuestion(question);
  const previous = previousMessages[previousMessages.length - 1];
  const answer = intent === "why" && previous?.risk
    ? responseText("why", previous.risk, marineData)
    : responseText(intent, risk, marineData);

  return {
    id: `demo-${Date.now()}`,
    role: "assistant",
    question,
    answer,
    risk,
    factors: risk.factors,
    confidence: risk.confidence,
    warnings: risk.warnings,
    recommendation: risk.recommendation,
    sources: dataSourceHealth.sources.map((source) => source.name),
    actions: [
      action("View Risk", "/intelligence"),
      action("View Map", "/map"),
      action("Find Safer Route", "/routes"),
    ],
    state: risk.confidence.level === "LOW" ? "low-confidence" : risk.warnings.length ? "warning" : "success",
  };
}