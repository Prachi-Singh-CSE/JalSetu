const userPosition = [15.1, 73.8];

const fishingZones = [
  { id: 1, name: "PFZ Alpha", position: [15.45, 72.9], score: 92, risk: "Low" },
  { id: 2, name: "PFZ Bravo", position: [14.7, 73.55], score: 86, risk: "Low" },
  { id: 3, name: "PFZ Charlie", position: [15.8, 74.15], score: 78, risk: "Medium" },
];

const vessels = [
  { id: 1, name: "Fishing Vessel", position: [15.25, 73.25] },
  { id: 2, name: "Commercial Vessel", position: [14.8, 74.45] },
  { id: 3, name: "Unknown Vessel", position: [15.65, 73.65], suspicious: true },
];

const hazards = [
  {
    id: 1,
    name: "Moderate Wave Risk",
    type: "High-wave zone",
    position: [15.35, 73.9],
    severity: "moderate",
    status: "Detected 22 min ago",
    recommendedAction: "Avoid this area where possible.",
  },
];

const harbours = [
  {
    id: "vasai",
    name: "Vasai Safe Harbour",
    position: [15.02, 73.68],
    status: "Demo harbour reference",
  },
  {
    id: "mormugao",
    name: "Mormugao Harbour",
    position: [15.41, 73.8],
    status: "Demo harbour reference",
  },
];

const weatherRiskZones = [
  {
    id: "weather-ar14",
    name: "AR-14 weather-risk zone",
    center: [15.35, 73.9],
    radius: 50000,
    score: 57,
    status: "HIGH demo risk",
  },
];

const imblBoundary = [
  [16.5, 72.3],
  [16.5, 74.8],
  [13.8, 74.8],
  [13.8, 72.3],
];

const recommendedRoute = [
  userPosition,
  [15.25, 73.45],
  [15.45, 73.7],
  [15.65, 73.95],
];

export function getMarineSnapshot() {
  return {
    mode: "demo",
    userPosition,
    fishingZones,
    vessels,
    hazards,
    harbours,
    weatherRiskZones,
    imblBoundary,
    recommendedRoute,
    ocean: { temperature: "27.2°C", wind: "18 km/h", waveHeight: "1.9 m" },
    updatedAt: "22 min ago",
  };
}