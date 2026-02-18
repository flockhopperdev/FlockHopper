# Technical Assessment: FlockHopper Routing API for DeFlock Integration

## The Ask

Build an HTTP API server that wraps FlockHopper's camera-aware routing logic, sitting in front of the self-hosted GraphHopper instance, so DeFlock can call it instead of (or alongside) the ALPRWatch API.

## Difficulty Rating: Moderate — Very Doable

The core routing logic in the codebase (`cameraAwareRouting.ts`, `graphHopperService.ts`, `routingConfig.ts`) is already well-separated from the React frontend. It doesn't touch the DOM, Zustand stores, or any UI. The main work is standing up a Node/Express (or similar) server, loading the camera data, and exposing an HTTP endpoint.

---

## What Needs to Happen

### 1. Extract the routing core (Low effort)

The following files are essentially pure functions with no UI dependencies:

| File | Browser-only dependency |
|------|------------------------|
| `src/services/cameraAwareRouting.ts` | None |
| `src/services/graphHopperService.ts` | `import.meta.env` (just for the endpoint URL) |
| `src/services/routingConfig.ts` | `import.meta.env.DEV` (just for debug flag) |
| `src/utils/geo.ts` | None |
| `src/types/camera.ts`, `route.ts` | None |

The only Vite-isms are `import.meta.env` references for the GraphHopper endpoint URL and the debug flag. These are trivial to replace with `process.env` or hardcoded config in a server context.

### 2. Load camera data server-side (Low effort)

Currently the frontend fetches `cameras-us.json` (62K cameras) at page load and builds a spatial grid. The server would do the same thing once at startup — read the JSON file into memory, build the spatial grid, and keep it resident. At ~62K entries this is a few MB of RAM. No database needed.

### 3. Build the HTTP endpoint (Low-moderate effort)

A single `POST /api/v1/route` endpoint that:
- Accepts: `start`, `end`, `avoidance_distance` (optional), `profile` (optional)
- Calls `calculateCameraAwareRoute()` with the in-memory camera array
- Returns: both routes (normal + avoidance), camera counts, distance/duration, improvement stats

### 4. Match DeFlock's expected API contract (Low effort)

DeFlock currently expects the ALPRWatch response shape:

```json
{
  "ok": true,
  "result": {
    "route": {
      "coordinates": [[lon, lat], ...],
      "distance": 12500.0,
      "duration": 900.0
    }
  }
}
```

This requires a thin translation layer to map `CameraRoutingResult` into this shape. The key differences to handle:

- DeFlock sends `{longitude, latitude}` — FlockHopper uses `{lat, lon}`
- DeFlock expects `[lon, lat]` coordinate arrays — FlockHopper geometry is `[lat, lon]` internally (already converted from GraphHopper's `[lon, lat]`)
- DeFlock sends `avoidance_distance` as a single number — maps to `cameraDistanceMeters`
- DeFlock sends `enabled_profiles` with OSM tags — can be ignored since FlockHopper uses its own static camera dataset

---

## Key Architectural Decisions

**Camera data source**: FlockHopper's 62K pre-built dataset vs. DeFlock's live Overpass queries. The static dataset is faster (no per-request API call) but needs periodic updates. This is a clear advantage for response times.

**Avoidance quality**: FlockHopper's system is significantly more sophisticated than ALPRWatch's:
- Graduated penalties (block + penalty zones) vs. binary polygon exclusion
- Multi-strategy fallback (custom_model → graduated penalties → iterative waypoints) vs. single attempt
- Route comparison (normal vs. avoidance) vs. avoidance-only

**What DeFlock gains**: Faster responses (no Overpass query per request), better fallback handling (ALPRWatch returns "unroutable" where FlockHopper finds a minimized-exposure route), and route comparison data if desired.

---

## Minimal Implementation Outline

```
server/
├── index.ts              # Express/Fastify server, loads camera data at startup
├── routes/directions.ts  # POST /api/v1/route endpoint
├── services/             # Copy of cameraAwareRouting, graphHopperService, routingConfig
│                         #   (with import.meta.env replaced by process.env)
├── utils/                # Copy of geo.ts
├── types/                # Copy of camera.ts, route.ts
└── data/
    └── cameras-us.json   # Symlink or copy of the camera dataset
```

The server would:
1. **On startup**: load `cameras-us.json`, build spatial grid, hold in memory
2. **On each request**: validate input, call `calculateCameraAwareRoute()`, transform response
3. **Forward GraphHopper calls** to the self-hosted instance (already running on port 8989)

---

## Infrastructure Requirements

- **GraphHopper server** must be running and accessible from the API server (already self-hosted)
- **Node.js server** — Express or Fastify, single process is fine for this workload
- **Deployment**: The API server and GraphHopper need to be co-located or on the same network. Only the API server is exposed publicly (with rate limiting + API keys)
- **No database needed** — camera data is a static JSON file loaded into memory

---

## Risks and Considerations

| Risk | Severity | Mitigation |
|------|----------|------------|
| GraphHopper must stay running | High | Health check endpoint, process manager (pm2/systemd) |
| Camera data staleness | Medium | Periodic re-download of `cameras-us.json`, or build a refresh endpoint |
| Large request payloads (camera zones) to GraphHopper | Low | Already handled — bbox filtering reduces 62K → ~1K cameras per request |
| Rate limiting / abuse | Medium | API key + rate limiter middleware |
| DeFlock's 90s timeout | Low | Routing is fast (GraphHopper is local, no Overpass call). Should be well under 90s |
| CORS / network | Low | Standard CORS config if DeFlock calls directly; not needed if server-to-server |

---

## What to Tell the DeFlock Developer

1. FlockHopper exposes a `POST /api/v1/route` endpoint
2. They send `start`/`end` coordinates and an optional `avoidance_distance`
3. They get back an avoidance route (coordinates, distance, duration) in the same shape they currently expect from ALPRWatch, **plus** optionally a normal route for comparison and camera exposure stats
4. The camera dataset covers the US (62K cameras from OSM + DeFlock data)
5. No Overpass dependency — responses are fast because everything is in-memory + local GraphHopper

---

## Bottom Line

This is a straightforward extraction. The routing logic is already cleanly separated from the UI. The main work is:

1. Copy the service/util/type files into a Node server project
2. Replace `import.meta.env` references with `process.env`
3. Add an Express endpoint that loads cameras at startup and calls the existing routing function
4. Add a response transformer to match DeFlock's expected format

The routing algorithm, spatial indexing, GraphHopper integration, and fallback strategies all carry over unchanged.
