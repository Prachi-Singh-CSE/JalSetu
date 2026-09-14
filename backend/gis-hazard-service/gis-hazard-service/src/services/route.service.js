const turf = require('@turf/turf');
const { query } = require('../config/db');
const { toPoint, distanceKm } = require('../utils/turfHelpers');

/**
 * Route Agent
 * - Finds the nearest safe harbor to a given position (used by both the
 *   normal "safe route" query and the Emergency/SOS flow).
 * - Suggests a route that avoids restricted zones and known hazards.
 *   NOTE: this uses a straight-line/waypoint-detour approach rather than a
 *   full marine routing engine (e.g. OSRM with a water-only graph) — that's
 *   a reasonable v1 and the obvious next upgrade once you have more time.
 */

async function findNearestSafeHarbor({ lat, lng }) {
  const { rows } = await query(`
    SELECT id, name, capacity_notes, ST_AsGeoJSON(geom)::json AS geometry
    FROM safe_harbors
  `);

  if (!rows.length) return null;

  const from = toPoint({ lat, lng });
  const harborFeatures = turf.featureCollection(
    rows.map((r) => turf.point(r.geometry.coordinates, { id: r.id, name: r.name }))
  );

  const nearest = turf.nearestPoint(from, harborFeatures);
  const matched = rows.find((r) => r.id === nearest.properties.id);

  return {
    id: matched.id,
    name: matched.name,
    capacityNotes: matched.capacity_notes,
    location: { lat: nearest.geometry.coordinates[1], lng: nearest.geometry.coordinates[0] },
    distanceKm: turf.distance(from, nearest, { units: 'kilometers' })
  };
}

async function suggestSafeRoute({ origin, destination }) {
  const [restrictedZones, hazards] = await Promise.all([
    query(`SELECT id, name, ST_AsGeoJSON(geom)::json AS geometry FROM restricted_zones`),
    query(`SELECT id, ST_AsGeoJSON(geom)::json AS geometry FROM hazard_detections
           WHERE detected_at >= now() - interval '72 hours'`)
  ]);

  const straightLine = turf.lineString([
    [origin.lng, origin.lat],
    [destination.lng, destination.lat]
  ]);

  const blockers = [...restrictedZones.rows, ...hazards.rows].map((r) => ({
    id: r.id,
    name: r.name || 'hazard',
    geometry: r.geometry
  }));

  const intersected = blockers.filter((b) =>
    turf.booleanIntersects(straightLine, turf.feature(b.geometry))
  );

  if (intersected.length === 0) {
    return {
      status: 'clear',
      path: [origin, destination],
      distanceKm: distanceKm(origin, destination),
      avoided: []
    };
  }

  // Simple detour: route via the midpoint offset perpendicular to the
  // straight line, away from the centroid of the blocking zone(s).
  // This is intentionally simple — good enough for a demo-grade v1.
  const midpoint = turf.midpoint(turf.point([origin.lng, origin.lat]), turf.point([destination.lng, destination.lat]));
  const bearing = turf.bearing(turf.point([origin.lng, origin.lat]), turf.point([destination.lng, destination.lat]));
  const detourPoint = turf.destination(midpoint, 15, bearing + 90, { units: 'kilometers' });

  const path = [
    origin,
    { lat: detourPoint.geometry.coordinates[1], lng: detourPoint.geometry.coordinates[0] },
    destination
  ];

  const totalDistanceKm =
    distanceKm(path[0], path[1]) + distanceKm(path[1], path[2]);

  return {
    status: 'detoured',
    path,
    distanceKm: totalDistanceKm,
    avoided: intersected.map((b) => ({ id: b.id, name: b.name }))
  };
}

module.exports = { findNearestSafeHarbor, suggestSafeRoute };
