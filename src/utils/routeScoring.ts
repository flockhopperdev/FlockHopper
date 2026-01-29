import type { ALPRCamera, CameraOnRoute } from '../types';
import { findCamerasOnRoute } from './geo';

/**
 * Configuration for camera avoidance scoring
 */
export interface CameraScoringConfig {
  // Distance within which cameras affect route scoring (meters)
  cameraDistanceMeters: number;
  // Base penalty per camera (in "equivalent meters")
  baseCameraPenalty: number;
  // Only count cameras facing the route (for directional zone mode)
  useDirectionalZones?: boolean;
}

export const DEFAULT_SCORING_CONFIG: CameraScoringConfig = {
  cameraDistanceMeters: 150,
  baseCameraPenalty: 800,
  useDirectionalZones: false,
};

/**
 * Score for a single camera on route
 */
export interface CameraScore {
  camera: ALPRCamera;
  distanceFromRoute: number;
  proximityFactor: number; // 0-1, higher = closer to route
  penalty: number;
}

/**
 * Complete route score breakdown
 */
export interface RouteScore {
  distanceMeters: number;
  durationSeconds: number;
  cameraCount: number;
  cameraScores: CameraScore[];
  totalCameraPenalty: number;
  compositeScore: number; // Lower is better
  exposureRating: 'low' | 'medium' | 'high' | 'extreme';
}

/**
 * Calculate individual camera penalty based on proximity
 * Simpler linear penalty - closer cameras = higher penalty
 */
export function calculateCameraPenalty(
  cam: CameraOnRoute,
  config: CameraScoringConfig
): CameraScore {
  // Linear proximity: 1 when at route, 0 at detection radius edge
  const proximityFactor = Math.max(0, 1 - (cam.distanceFromRoute / config.cameraDistanceMeters));

  // Simple linear penalty
  const penalty = config.baseCameraPenalty * proximityFactor;

  return {
    camera: cam.camera,
    distanceFromRoute: cam.distanceFromRoute,
    proximityFactor,
    penalty,
  };
}

/**
 * Calculate complete route score with camera penalties
 */
export function scoreRoute(
  geometry: [number, number][],
  distanceMeters: number,
  durationSeconds: number,
  cameras: ALPRCamera[],
  config: CameraScoringConfig = DEFAULT_SCORING_CONFIG
): RouteScore {
  // Find all cameras within detection radius of route
  // When directional zones are enabled, only count cameras facing the route
  const camerasOnRoute = findCamerasOnRoute(
    cameras,
    geometry,
    config.cameraDistanceMeters,
    config.useDirectionalZones ?? false
  );

  // Score each camera
  const cameraScores = camerasOnRoute.map(cam => calculateCameraPenalty(cam, config));

  // Sum total camera penalty
  const totalCameraPenalty = cameraScores.reduce((sum, cs) => sum + cs.penalty, 0);

  // Composite score combines distance and camera penalty
  const compositeScore = distanceMeters + totalCameraPenalty;

  // Determine exposure rating based on camera count
  const exposureRating = getExposureRating(camerasOnRoute.length);

  return {
    distanceMeters,
    durationSeconds,
    cameraCount: camerasOnRoute.length,
    cameraScores,
    totalCameraPenalty,
    compositeScore,
    exposureRating,
  };
}

/**
 * Determine exposure rating based on camera count
 */
function getExposureRating(cameraCount: number): 'low' | 'medium' | 'high' | 'extreme' {
  if (cameraCount === 0) return 'low';
  if (cameraCount <= 2) return 'medium';
  if (cameraCount <= 5) return 'high';
  return 'extreme';
}
