import { Router } from 'express';
import type { ALPRCamera } from '../types/index.js';
import type { CameraAvoidanceConfig } from '../types/route.js';
import { calculateCameraAwareRoute } from '../services/cameraAwareRouting.js';
import type { CameraRoutingResult } from '../services/cameraAwareRouting.js';
import { calculateAvoidanceRouteWithWaypoints } from '../services/graphHopperService.js';
import { findCamerasOnRoute, getCamerasInBoundsFromGrid, buildSpatialGrid } from '../utils/geo.js';
import { ZONE_SAFETY_MULTIPLIERS } from '../services/routingConfig.js';

interface RouteRequestBody {
  origin: { latitude?: number; longitude?: number; lat?: number; lon?: number };
  destination: { latitude?: number; longitude?: number; lat?: number; lon?: number };
  format?: 'deflock' | 'full';
  costing?: 'auto' | 'bicycle' | 'pedestrian';

  // Optional avoidance config fields
  avoidanceWeight?: number;
  maxDetourPercent?: number;
  cameraDistanceMeters?: number;
  useDirectionalZones?: boolean;
  cameraFovDegrees?: number;
  backBufferMeters?: number;
  maxIterations?: number;
  useIterativeWaypoints?: boolean;
  bboxBufferDegrees?: number;
}

interface CustomRouteRequestBody extends RouteRequestBody {
  waypoints?: Array<{ lat: number; lon: number; name?: string }>;
}

function normalizeCoord(point: RouteRequestBody['origin']): { lat: number; lon: number } | null {
  const lat = point.latitude ?? point.lat;
  const lon = point.longitude ?? point.lon;
  if (lat === undefined || lon === undefined) return null;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  return { lat, lon };
}

function validateCoord(coord: { lat: number; lon: number }): string | null {
  if (coord.lat < -90 || coord.lat > 90) return `Invalid latitude: ${coord.lat}`;
  if (coord.lon < -180 || coord.lon > 180) return `Invalid longitude: ${coord.lon}`;
  return null;
}

function extractAvoidanceConfig(body: RouteRequestBody): Partial<CameraAvoidanceConfig> {
  const config: Partial<CameraAvoidanceConfig> = {};
  if (body.costing !== undefined) config.costing = body.costing;
  if (body.avoidanceWeight !== undefined) config.avoidanceWeight = body.avoidanceWeight;
  if (body.maxDetourPercent !== undefined) config.maxDetourPercent = body.maxDetourPercent;
  if (body.cameraDistanceMeters !== undefined) config.cameraDistanceMeters = body.cameraDistanceMeters;
  if (body.useDirectionalZones !== undefined) config.useDirectionalZones = body.useDirectionalZones;
  if (body.cameraFovDegrees !== undefined) config.cameraFovDegrees = body.cameraFovDegrees;
  if (body.backBufferMeters !== undefined) config.backBufferMeters = body.backBufferMeters;
  if (body.maxIterations !== undefined) config.maxIterations = body.maxIterations;
  if (body.useIterativeWaypoints !== undefined) config.useIterativeWaypoints = body.useIterativeWaypoints;
  if (body.bboxBufferDegrees !== undefined) config.bboxBufferDegrees = body.bboxBufferDegrees;
  return config;
}

function formatDeflockResponse(result: CameraRoutingResult) {
  const avoidance = result.avoidanceRoute;
  const normal = result.normalRoute;

  return {
    ok: true,
    result: {
      route: {
        // Flip geometry from [lat, lon] to [lon, lat] for DeFlock
        coordinates: avoidance.route.geometry.map(([lat, lon]) => [lon, lat]),
        distance: avoidance.route.distanceMeters,
        duration: avoidance.route.durationSeconds,
      },
      normal_route: {
        coordinates: normal.route.geometry.map(([lat, lon]) => [lon, lat]),
        distance: normal.route.distanceMeters,
        duration: normal.route.durationSeconds,
      },
      cameras_avoided: result.improvement.camerasAvoided,
      camera_reduction_percent: parseFloat(result.improvement.cameraReductionPercent.toFixed(1)),
      normal_camera_count: normal.camerasOnRoute.length,
      avoidance_camera_count: avoidance.camerasOnRoute.length,
      distance_increase_percent: parseFloat(result.improvement.distanceIncreasePercent.toFixed(1)),
      strategy: avoidance.strategy,
    },
  };
}

export function createDirectionsRouter(getCameras: () => ALPRCamera[]): Router {
  const router = Router();

  router.post('/route', async (req, res) => {
    try {
      const body = req.body as RouteRequestBody;

      // Validate required fields
      if (!body.origin || !body.destination) {
        res.status(400).json({ ok: false, error: 'Missing origin or destination' });
        return;
      }

      // Normalize coordinates (accept both DeFlock and FlockHopper formats)
      const origin = normalizeCoord(body.origin);
      const destination = normalizeCoord(body.destination);

      if (!origin) {
        res.status(400).json({ ok: false, error: 'Invalid origin: must include lat/lon or latitude/longitude' });
        return;
      }
      if (!destination) {
        res.status(400).json({ ok: false, error: 'Invalid destination: must include lat/lon or latitude/longitude' });
        return;
      }

      // Validate coordinate bounds
      const originError = validateCoord(origin);
      if (originError) {
        res.status(400).json({ ok: false, error: `Origin: ${originError}` });
        return;
      }
      const destError = validateCoord(destination);
      if (destError) {
        res.status(400).json({ ok: false, error: `Destination: ${destError}` });
        return;
      }

      const format = body.format || 'deflock';
      const avoidanceConfig = extractAvoidanceConfig(body);

      // Calculate route
      const cameras = getCameras();
      const result = await calculateCameraAwareRoute(
        origin,
        destination,
        cameras,
        avoidanceConfig
      );

      // Return response in requested format
      if (format === 'full') {
        res.json({ ok: true, result });
      } else {
        res.json(formatDeflockResponse(result));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      // Map error types to HTTP status codes
      if (message.includes('Route distance exceeds maximum')) {
        res.status(400).json({ ok: false, error: message });
        return;
      }
      if (message.includes('Failed to calculate baseline route') || message.includes('GraphHopper error')) {
        res.status(502).json({ ok: false, error: 'Routing service unavailable', detail: message });
        return;
      }

      console.error('[Route Error]', message);
      res.status(500).json({ ok: false, error: 'Route calculation failed', detail: message });
    }
  });

  router.post('/route/custom', async (req, res) => {
    try {
      const body = req.body as CustomRouteRequestBody;

      // Validate required fields
      if (!body.origin || !body.destination) {
        res.status(400).json({ ok: false, error: 'Missing origin or destination' });
        return;
      }

      const origin = normalizeCoord(body.origin);
      const destination = normalizeCoord(body.destination);

      if (!origin) {
        res.status(400).json({ ok: false, error: 'Invalid origin: must include lat/lon or latitude/longitude' });
        return;
      }
      if (!destination) {
        res.status(400).json({ ok: false, error: 'Invalid destination: must include lat/lon or latitude/longitude' });
        return;
      }

      const originError = validateCoord(origin);
      if (originError) {
        res.status(400).json({ ok: false, error: `Origin: ${originError}` });
        return;
      }
      const destError = validateCoord(destination);
      if (destError) {
        res.status(400).json({ ok: false, error: `Destination: ${destError}` });
        return;
      }

      const avoidanceConfig = extractAvoidanceConfig(body);
      const costing = body.costing || 'auto';
      const cameraDistanceMeters = avoidanceConfig.cameraDistanceMeters ?? 75;
      const maxDetourPercent = avoidanceConfig.maxDetourPercent ?? 100;
      const bboxBufferDegrees = avoidanceConfig.bboxBufferDegrees ?? 0.5;
      const useDirectionalZones = avoidanceConfig.useDirectionalZones ?? false;

      // Parse waypoints
      const waypointCoords: [number, number][] = (body.waypoints || []).map(wp => [wp.lat, wp.lon]);

      // All points for bounding box
      const allPoints = [origin, destination, ...(body.waypoints || [])];
      const lats = allPoints.map(p => p.lat);
      const lons = allPoints.map(p => p.lon);
      const minLat = Math.min(...lats) - bboxBufferDegrees;
      const maxLat = Math.max(...lats) + bboxBufferDegrees;
      const minLon = Math.min(...lons) - bboxBufferDegrees;
      const maxLon = Math.max(...lons) + bboxBufferDegrees;

      // Filter cameras to bounding box
      const allCameras = getCameras();
      const grid = buildSpatialGrid(allCameras);
      const relevantCameras = getCamerasInBoundsFromGrid(grid, maxLat, minLat, maxLon, minLon);

      console.log(`[Custom Route] ${allCameras.length} -> ${relevantCameras.length} cameras in area`);

      const zoneOptions = {
        useDirectionalZones,
        cameraFovDegrees: avoidanceConfig.cameraFovDegrees,
        backBufferMeters: avoidanceConfig.backBufferMeters,
      };

      const route = await calculateAvoidanceRouteWithWaypoints(
        origin,
        destination,
        waypointCoords,
        relevantCameras,
        costing,
        {
          cameraBlockRadius: cameraDistanceMeters * ZONE_SAFETY_MULTIPLIERS.block,
          cameraPenaltyRadius: cameraDistanceMeters * ZONE_SAFETY_MULTIPLIERS.penalty,
          maxDetourFactor: 1 + (maxDetourPercent / 100),
        },
        zoneOptions
      );

      // Add waypoints to route object
      route.waypoints = (body.waypoints || []).map(wp => ({
        lat: wp.lat,
        lon: wp.lon,
        name: wp.name,
      }));

      const camerasOnRoute = findCamerasOnRoute(
        relevantCameras,
        route.geometry,
        cameraDistanceMeters,
        useDirectionalZones
      );

      res.json({
        ok: true,
        result: {
          route,
          camerasOnRoute,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      if (message.includes('Failed to calculate baseline route') || message.includes('GraphHopper error')) {
        res.status(502).json({ ok: false, error: 'Routing service unavailable', detail: message });
        return;
      }

      console.error('[Custom Route Error]', message);
      res.status(500).json({ ok: false, error: 'Custom route calculation failed', detail: message });
    }
  });

  return router;
}
