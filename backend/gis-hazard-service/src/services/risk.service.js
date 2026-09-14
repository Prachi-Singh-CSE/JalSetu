const axios = require('axios');
const { query } = require('../config/db');
const { distanceKm } = require('../utils/turfHelpers');
require('dotenv').config();

/**
 * Risk Agent
 * Combines: wave height, wind speed, cyclone proximity, lightning activity
 * (from Prachi's Weather/Ocean service), proximity to detected hazards
 * (oil slicks / flagged vessels, from our own hazard_detections table),
 * and subsurface-data confidence (also from Prachi's Ocean Data Agent)
 * into one 0-100 composite Marine Risk Score.
 *
 * IMPORTANT: the exact JSON shape of Prachi's weather/ocean response below
 * is a PLACEHOLDER — confirm the real field names with her and update
 * `fetchWeatherOceanContext()` accordingly. Until her service is live,
 * this falls back to safe defaults so the rest of the pipeline still runs.
 */

const WEATHER_OCEAN_SERVICE_URL = process.env.WEATHER_OCEAN_SERVICE_URL;

async function fetchWeatherOceanContext({ lat, lng }) {
  if (!WEATHER_OCEAN_SERVICE_URL) return defaultWeatherOceanContext();
  try {
    const { data } = await axios.get(`${WEATHER_OCEAN_SERVICE_URL}/api/weather-ocean/context`, {
      params: { lat, lng },
      timeout: 4000
    });
    // Expected shape (confirm with Prachi):
    // { waveHeightM, windSpeedKts, cycloneDistanceKm, lightningRisk (0-1),
    //   subsurfaceConfidence (0-1), stale (bool) }
    return data;
  } catch (err) {
    console.warn('[risk.service] weather/ocean service unavailable, using defaults:', err.message);
    return defaultWeatherOceanContext();
  }
}

function defaultWeatherOceanContext() {
  return {
    waveHeightM: 1.0,
    windSpeedKts: 10,
    cycloneDistanceKm: null,
    lightningRisk: 0,
    subsurfaceConfidence: 0.5,
    stale: true
  };
}

async function nearestHazardDistanceKm({ lat, lng }) {
  const { rows } = await query(`
    SELECT id, ST_Y(ST_Centroid(geom)) AS lat, ST_X(ST_Centroid(geom)) AS lng
    FROM hazard_detections
    WHERE detected_at >= now() - interval '72 hours'
  `);
  if (!rows.length) return null;
  let min = Infinity;
  for (const r of rows) {
    const d = distanceKm({ lat, lng }, { lat: r.lat, lng: r.lng });
    if (d < min) min = d;
  }
  return min;
}

/** Each sub-score is normalized 0-100 (100 = most dangerous). */
function scoreWave(waveHeightM) {
  return clamp((waveHeightM / 6) * 100, 0, 100); // 6m+ treated as max danger
}
function scoreWind(windSpeedKts) {
  return clamp((windSpeedKts / 50) * 100, 0, 100); // 50kt+ treated as max danger
}
function scoreCyclone(cycloneDistanceKm) {
  if (cycloneDistanceKm === null || cycloneDistanceKm === undefined) return 0;
  if (cycloneDistanceKm <= 50) return 100;
  if (cycloneDistanceKm >= 500) return 0;
  return clamp(100 - ((cycloneDistanceKm - 50) / (500 - 50)) * 100, 0, 100);
}
function scoreLightning(lightningRisk) {
  return clamp(lightningRisk * 100, 0, 100);
}
function scoreHazardProximity(hazardDistanceKm) {
  if (hazardDistanceKm === null || hazardDistanceKm === undefined) return 0;
  if (hazardDistanceKm <= 2) return 100;
  if (hazardDistanceKm >= 30) return 0;
  return clamp(100 - ((hazardDistanceKm - 2) / (30 - 2)) * 100, 0, 100);
}
/** Low subsurface confidence doesn't raise physical danger, but it raises
 * uncertainty — we fold a portion of it in so low-confidence zones don't
 * present with false certainty, per the project's confidence-first design. */
function scoreConfidencePenalty(subsurfaceConfidence) {
  return clamp((1 - subsurfaceConfidence) * 100, 0, 100);
}

// Weights sum to 1.0 — tune these with your team once you have real data
// to validate against.
const WEIGHTS = {
  wave: 0.25,
  wind: 0.2,
  cyclone: 0.2,
  lightning: 0.1,
  hazard: 0.15,
  confidencePenalty: 0.1
};

async function computeMarineRiskScore({ lat, lng }) {
  const [weatherOcean, hazardDistanceKm] = await Promise.all([
    fetchWeatherOceanContext({ lat, lng }),
    nearestHazardDistanceKm({ lat, lng })
  ]);

  const subScores = {
    wave: scoreWave(weatherOcean.waveHeightM),
    wind: scoreWind(weatherOcean.windSpeedKts),
    cyclone: scoreCyclone(weatherOcean.cycloneDistanceKm),
    lightning: scoreLightning(weatherOcean.lightningRisk),
    hazard: scoreHazardProximity(hazardDistanceKm),
    confidencePenalty: scoreConfidencePenalty(weatherOcean.subsurfaceConfidence)
  };

  const compositeScore = Object.entries(WEIGHTS).reduce(
    (sum, [key, weight]) => sum + subScores[key] * weight,
    0
  );

  return {
    location: { lat, lng },
    compositeScore: Math.round(compositeScore * 10) / 10, // 0-100
    riskLevel: toRiskLevel(compositeScore),
    subScores,
    inputs: {
      waveHeightM: weatherOcean.waveHeightM,
      windSpeedKts: weatherOcean.windSpeedKts,
      cycloneDistanceKm: weatherOcean.cycloneDistanceKm,
      lightningRisk: weatherOcean.lightningRisk,
      nearestHazardKm: hazardDistanceKm,
      subsurfaceConfidence: weatherOcean.subsurfaceConfidence,
      dataStale: Boolean(weatherOcean.stale)
    }
  };
}

function toRiskLevel(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'moderate';
  return 'low';
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

module.exports = { computeMarineRiskScore };
