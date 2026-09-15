const { query } = require('../config/db');

/**
 * GIS Agent
 * Serves map layers (PFZ zones, restricted zones, IMBL boundary, hazards,
 * safe harbors) as GeoJSON for the frontend's Leaflet/MapLibre map.
 */

async function getPfzZonesGeoJSON() {
  const { rows } = await query(`
    SELECT id, name, confidence, source, updated_at,
           ST_AsGeoJSON(geom)::json AS geometry
    FROM pfz_zones
  `);
  return toFeatureCollection(rows);
}

async function getRestrictedZonesGeoJSON() {
  const { rows } = await query(`
    SELECT id, name, zone_type,
           ST_AsGeoJSON(geom)::json AS geometry
    FROM restricted_zones
  `);
  return toFeatureCollection(rows);
}

async function getImblBoundaryGeoJSON() {
  const { rows } = await query(`
    SELECT id, name, ST_AsGeoJSON(geom)::json AS geometry
    FROM imbl_boundary
  `);
  return toFeatureCollection(rows);
}

async function getSafeHarborsGeoJSON() {
  const { rows } = await query(`
    SELECT id, name, capacity_notes,
           ST_AsGeoJSON(geom)::json AS geometry
    FROM safe_harbors
  `);
  return toFeatureCollection(rows);
}

async function getHazardOverlayGeoJSON({ sinceHours = 72 } = {}) {
  const { rows } = await query(
    `
    SELECT id, hazard_type, confidence, sar_source, suspected_vessel_id,
           correlation_confidence, detected_at,
           ST_AsGeoJSON(geom)::json AS geometry
    FROM hazard_detections
    WHERE detected_at >= now() - ($1 || ' hours')::interval
    `,
    [sinceHours]
  );
  return toFeatureCollection(rows);
}

/** Combines all map layers into one payload — handy for initial map load. */
async function getAllLayers() {
  const [pfz, restricted, imbl, harbors, hazards] = await Promise.all([
    getPfzZonesGeoJSON(),
    getRestrictedZonesGeoJSON(),
    getImblBoundaryGeoJSON(),
    getSafeHarborsGeoJSON(),
    getHazardOverlayGeoJSON()
  ]);
  return { pfz, restricted, imbl, harbors, hazards };
}

function toFeatureCollection(rows) {
  return {
    type: 'FeatureCollection',
    features: rows.map((row) => {
      const { geometry, ...properties } = row;
      return { type: 'Feature', geometry, properties };
    })
  };
}

module.exports = {
  getPfzZonesGeoJSON,
  getRestrictedZonesGeoJSON,
  getImblBoundaryGeoJSON,
  getSafeHarborsGeoJSON,
  getHazardOverlayGeoJSON,
  getAllLayers
};
