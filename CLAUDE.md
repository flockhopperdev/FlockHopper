# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlockHopper is a privacy-focused route planning application that helps users navigate while minimizing exposure to Automatic License Plate Reader (ALPR) cameras across the United States. It visualizes 62,000+ ALPR camera locations and calculates alternative routes that minimize camera exposure.

## Commands

```bash
npm run dev       # Start development server (port 3000)
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

**GraphHopper routing server** (required for route calculation):
```bash
cd graphhopper
./start.sh        # Starts GraphHopper on port 8989
```

## Architecture

### Tech Stack
- React 18 + TypeScript + Vite
- Zustand for state management
- MapLibre GL for maps
- Tailwind CSS for styling
- GraphHopper (self-hosted Java service) for routing

### Key Data Flow

1. **Camera Data Loading**: `PreloadManager` starts background fetch while user browses landing page → `cameraStore` loads `/public/cameras-us.json` → builds spatial grid (0.5° cells) for O(1) lookups

2. **Route Calculation** (`src/services/cameraAwareRouting.ts`):
   - Filters cameras to bounding box around route (62K → ~1K cameras)
   - Calls GraphHopper for normal route
   - Calls GraphHopper with `custom_model` (priority=0.001) for camera avoidance route
   - Falls back to iterative waypoint avoidance if needed
   - Returns both routes with exposure comparison

### Critical Files

| File | Purpose |
|------|---------|
| `src/services/cameraAwareRouting.ts` | Core routing algorithm with camera avoidance logic |
| `src/services/graphHopperService.ts` | GraphHopper API client and custom model generation |
| `src/services/routingConfig.ts` | All routing parameters (detection radius, zone multipliers, penalties) |
| `src/store/cameraStore.ts` | Camera data management + spatial grid indexing |
| `src/store/routeStore.ts` | Route calculation state and UI state |
| `src/pages/MapPage.tsx` | Main application page container |
| `src/components/map/MapLibreContainer.tsx` | Map rendering, camera markers, route layers (1400+ lines) |
| `src/utils/geo.ts` | Geospatial utilities (haversine, bearing, spatial grid, directional cones) |

### State Management Pattern

Zustand stores expose both state and actions. Key stores:
- `cameraStore`: Camera data, spatial grid, loading phases (idle → fetching → hydrating → ready → error)
- `routeStore`: Route calculation, active route display, UI state
- `customRouteStore`: Multi-leg waypoint routing
- `mapStore`: Map bounds/viewport

Stores use `dataVersion` signals to update the map without React diffing overhead.

### Directory Structure

```
src/
├── components/
│   ├── common/     # ErrorBoundary, LoadingSpinner, BottomSheet, Seo
│   ├── inputs/     # AddressSearch autocomplete
│   ├── landing/    # Landing page sections (Hero, Header, MapPreviewGL, etc.)
│   ├── map/        # MapLibreContainer, MapSearch, CameraStats, WaypointLayer
│   ├── panels/     # RoutePanel, RouteComparison, TabbedPanel, CustomRoutePanel
│   └── ui/         # Shadcn components (button, slider, switch)
├── pages/          # LandingPage, MapPage, PrivacyPolicy, TermsOfUse, SupportProject
├── services/       # cameraAwareRouting, graphHopperService, geocodingService, routingConfig
├── store/          # Zustand stores (camera, route, map, customRoute, landing, audio)
├── types/          # TypeScript definitions (camera, route, map)
└── utils/          # geo, polyline, formatting, routeScoring
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_GRAPHHOPPER_ENDPOINT` | GraphHopper API URL | `http://localhost:8989` |
| `VITE_LOCATIONIQ_KEY` | LocationIQ geocoding API key | (optional) |
| `VITE_PERF_LOGGING` | Enable performance logging | `false` |

### Routing Parameters

All routing tuning happens in `src/services/routingConfig.ts`:

- **Base detection radius**: 75m (how close camera must be to "see" vehicle)
- **Block zone multiplier**: 1.6× (roads nearly-blocked within 120m)
- **Penalty zone multiplier**: 2.5× (roads penalized within ~187m)
- **Max detour**: 100% (routes can double in length to avoid cameras)
- **Max route distance**: 300 miles straight-line

## Important Patterns

### Camera Avoidance Strategy
GraphHopper's `custom_model` with `priority` values near-blocks roads within camera zones. Strategy:
1. Try complete blocking (priority=0.0001) for zero-camera routes
2. Fall back to graduated penalties (0.001, 0.05, 0.3) if routing fails
3. Fall back to iterative waypoint insertion as last resort

### Spatial Optimization
The spatial grid (0.5° cells) is critical for performance. Always use `getCamerasInBounds()` or `getCamerasInBoundsFromGrid()` rather than filtering the full 62K camera array.

### Zone Generation
Cameras can have circular or directional (cone) avoidance zones:
- Circular: Default, 360° coverage
- Directional: 70° FOV cone when camera has direction data (opt-in via `useDirectionalZones`)

### Map Rendering
`MapLibreContainer.tsx` handles:
- GeoJSON source for clustered camera markers
- Direction cone visualization for cameras with direction data
- Route line rendering (normal = orange dashed, avoidance = blue solid)
- Pulse animation on camera markers
- Watchdog retry system for ensuring data loads

### Code Splitting
Vite splits bundles by vendor: react-vendor, map-vendor, leaflet-vendor, motion, geo-utils, state. Pages use React lazy loading with Suspense.

## Data Sources

- **Camera Data**: `/public/cameras-us.json` - 62K cameras from OpenStreetMap + DeFlock
- **ZIP Codes**: `/public/zipcodes-us.json` - Local lookup, no API needed
- **Map Tiles**: OpenStreetMap raster tiles
- **Geocoding**: Photon (OSM-based) with LocationIQ fallback
