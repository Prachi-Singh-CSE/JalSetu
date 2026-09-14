const routes = [
  {
    id: "fastest",
    name: "FASTEST ROUTE",
    distanceKm: 31,
    duration: "1h 20m",
    risk: "HIGH",
    path: [[15.1, 73.8], [15.25, 73.45], [15.45, 73.7], [15.65, 73.95]],
    destination: "Zone A",
  },
  {
    id: "safer",
    name: "SAFER ROUTE",
    distanceKm: 36,
    duration: "1h 32m",
    risk: "LOW",
    recommended: true,
    path: [[15.1, 73.8], [15.18, 73.55], [15.32, 73.5], [15.02, 73.68]],
    destination: "Vasai Safe Harbour",
  },
];

export function getRouteOptions() {
  return { mode: "demo", routes };
}

export function selectRoute(routeId) {
  return routes.find((route) => route.id === routeId) || routes[1];
}