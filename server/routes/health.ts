import { Router } from 'express';
import { config } from '../config.js';
import type { ALPRCamera } from '../types/index.js';

export function createHealthRouter(getCameras: () => ALPRCamera[]): Router {
  const router = Router();
  const startTime = Date.now();

  router.get('/health', (_req, res) => {
    const cameras = getCameras();
    res.json({
      ok: true,
      status: 'healthy',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      cameras: cameras.length,
      graphhopper: config.graphhopperEndpoint,
      version: '1.0.0',
    });
  });

  return router;
}
