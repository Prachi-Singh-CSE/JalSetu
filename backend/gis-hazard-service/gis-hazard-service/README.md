# GIS, Hazard, Risk & Emergency Backend (Lavanya's module)

Node.js + Express + PostGIS service implementing:
- **GIS Agent** — map layers (PFZ zones, restricted zones, IMBL boundary, safe harbors, hazards) as GeoJSON
- **Route Agent** — nearest safe harbor + hazard/restricted-zone-aware safe route suggestion
- **Risk Agent** — composite Marine Risk Score (wave, wind, cyclone, lightning, hazard proximity, subsurface confidence)
- **Hazard Agent** — AIS "going dark" anomaly pre-screening + SAR oil-slick/AIS vessel correlation
- **Emergency/SOS backend** — GPS + nearest safe harbor push to the authority dashboard, plus IMBL boundary dwell-time auto-escalation

## 1. Install

```
cd gis-hazard-service
npm install
```

## 2. Set up PostgreSQL + PostGIS

Create a database (locally or via Docker), then:

```
cp .env.example .env
# edit .env with your real DB credentials and dashboard webhook URL
npm run db:init
```

`npm run db:init` runs `src/db/schema.sql`, which creates every table this
service needs (`pfz_zones`, `restricted_zones`, `imbl_boundary`,
`safe_harbors`, `vessel_positions`, `imbl_dwell_tracking`,
`hazard_detections`, `sos_alerts`) with PostGIS spatial indexes.

You'll need to seed `imbl_boundary` and `safe_harbors` with real geometry
before the Route Agent / IMBL check will return anything useful — those are
static/slow-changing reference layers per the project doc.

## 3. Run

```
npm run dev     # with nodemon, auto-restarts on change
# or
npm start
```

Server starts on `http://localhost:5000` (configurable via `PORT` in `.env`).
Check it's alive: `GET /health`.

## 4. Endpoints

| Agent | Method & Path | Purpose |
|---|---|---|
| GIS | `GET /api/gis/layers` | All map layers combined, for initial map load |
| GIS | `GET /api/gis/pfz-zones` | PFZ zones GeoJSON |
| GIS | `GET /api/gis/restricted-zones` | Restricted/protected zones GeoJSON |
| GIS | `GET /api/gis/imbl-boundary` | IMBL boundary line GeoJSON |
| GIS | `GET /api/gis/safe-harbors` | Safe harbor points GeoJSON |
| GIS | `GET /api/gis/hazards?sinceHours=72` | Recent hazard detections GeoJSON |
| Route | `GET /api/route/nearest-harbor?lat=&lng=` | Nearest safe harbor to a point |
| Route | `POST /api/route/safe-route` | `{origin:{lat,lng}, destination:{lat,lng}}` → route avoiding hazards/restricted zones |
| Risk | `GET /api/risk/score?lat=&lng=` | Composite Marine Risk Score at a point |
| Hazard | `GET /api/hazard/feed` | Combined AIS anomalies + SAR-confirmed hazards (72h) |
| Hazard | `GET /api/hazard/ais-anomalies?sinceHours=6` | Fast AIS "going dark" pre-screen |
| Hazard | `POST /api/hazard/correlate` | Run SAR-slick ↔ AIS-vessel correlation on unlinked detections |
| Hazard | `POST /api/hazard/sar-inference` | `{bbox, sceneDate}` → trigger external Python SAR/U-Net service |
| Hazard | `POST /api/hazard/imbl-check` | `{vesselId, lat, lng}` → call on every incoming position fix |
| Emergency | `POST /api/emergency/sos` | `{vesselId, lat, lng}` → trigger SOS, pushes to authority dashboard |
| Emergency | `GET /api/emergency/alerts?sinceHours=24` | Recent SOS/escalation alerts |

## 5. What's a placeholder vs. what's real logic

**Real, working logic:**
- All PostGIS queries (GeoJSON layer serving, nearest-harbor via Turf, hazard
  proximity distance calc, AIS anomaly detection rules, IMBL buffer +
  dwell-time tracking, SOS insert + dashboard push).

**Placeholders you must wire up with teammates:**
- `WEATHER_OCEAN_SERVICE_URL` in `risk.service.js` — the exact JSON field
  names Prachi's service returns (`waveHeightM`, `windSpeedKts`, etc.) are
  guesses. Confirm with her and adjust `fetchWeatherOceanContext()`.
- `SAR_INFERENCE_SERVICE_URL` in `hazard.service.js` — actual U-Net
  inference for oil-slick detection is a Python job; this service either
  calls that job or reads results already written into `hazard_detections`
  by an ingestion script (you may need to write that ingestion script, or
  coordinate with whoever runs the model).
- `AUTHORITY_DASHBOARD_WEBHOOK_URL` — the real endpoint Dolima's dashboard
  frontend (or a dashboard backend) exposes to receive alerts.
- The `suggestSafeRoute()` detour logic in `route.service.js` is a simple
  v1 (single perpendicular waypoint around blockers) — swap in a proper
  marine routing engine (e.g. OSRM with a water-only graph) if time allows.

## 6. Git workflow reminder

```
git checkout -b lavanya-gis-backend
# ...build inside this folder, e.g. backend/gis-hazard-service...
git add .
git commit -m "gis/route/risk/hazard/emergency backend skeleton"
git checkout main && git pull origin main
git checkout lavanya-gis-backend && git merge main   # resolve conflicts if any
git push origin lavanya-gis-backend
# open a PR into main
```
