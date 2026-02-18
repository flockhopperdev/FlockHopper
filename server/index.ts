import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { buildSpatialGrid } from './utils/geo.js';
import { createHealthRouter } from './routes/health.js';
import { createDirectionsRouter } from './routes/directions.js';
import { errorHandler } from './middleware/errorHandler.js';
import type { ALPRCamera } from './types/index.js';

// ============================================================================
// LOAD CAMERA DATA
// ============================================================================

let cameras: ALPRCamera[] = [];

function loadCameras(): void {
  const dataPath = resolve(import.meta.dirname, config.cameraDataPath);
  console.log(`[Startup] Loading camera data from ${dataPath}...`);

  try {
    const raw = readFileSync(dataPath, 'utf-8');
    cameras = JSON.parse(raw) as ALPRCamera[];
    console.log(`[Startup] Loaded ${cameras.length.toLocaleString()} cameras`);

    // Pre-build spatial grid for fast lookups
    console.log('[Startup] Building spatial grid...');
    const grid = buildSpatialGrid(cameras);
    console.log(`[Startup] Spatial grid ready (${grid.cells.size} cells)`);
  } catch (err) {
    console.error('[Startup] FATAL: Failed to load camera data:', err);
    process.exit(1);
  }
}

function getCameras(): ALPRCamera[] {
  return cameras;
}

// ============================================================================
// EXPRESS SERVER
// ============================================================================

loadCameras();

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json());

// Request logging (dev only)
if (config.nodeEnv !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/v1', createHealthRouter(getCameras));
app.use('/api/v1', createDirectionsRouter(getCameras));

// Error handler
app.use(errorHandler);

// Start
app.listen(config.port, () => {
  console.log(`[Startup] FlockHopper API listening on port ${config.port}`);
  console.log(`[Startup] GraphHopper endpoint: ${config.graphhopperEndpoint}`);
  console.log(`[Startup] Environment: ${config.nodeEnv}`);
});
