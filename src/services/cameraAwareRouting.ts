/**
 * Camera-Aware Routing using GraphHopper
 *
 * GraphHopper provides superior camera avoidance compared to Valhalla:
 * - custom_model with priority=0 COMPLETELY blocks roads in camera zones
 * - Valhalla's exclude_polygons only works at segment level
 *
 * Strategy:
 * 1. Try complete blocking (priority=0) for guaranteed zero-camera routes
 * 2. If that fails, use graduated penalties to minimize exposure
 * 3. Fallback to normal route if all else fails
 */

import type {
  Location,
  Route,
  ALPRCamera,
  CameraOnRoute,
} from '../types';
import {
  findCamerasOnRoute,
  calculateBearing,
  destinationPoint,
  haversineDistance,
  buildSpatialGrid,
  getCamerasInBoundsFromGrid,
} from '../utils/geo';
import {
  calculateRoute,
  calculateAvoidanceRouteWithStats,
  calculateRouteWithWaypoints,
  type GraphHopperConfig,
  type ZoneGenerationOptions,
  type ZoneStats,
} from './graphHopperService';
import {
  CAMERA_DETECTION,
  WAYPOINT_AVOIDANCE,
  ROUTE_SCORING,
  DETOUR_LIMITS,
  ROUTE_LIMITS,
  ROUTING_DEBUG,
  DIRECTIONAL_ZONE,
  ZONE_SAFETY_MULTIPLIERS,
} from './routingConfig';

/** Conditional debug logger */
const debug = ROUTING_DEBUG
  ? (...args: unknown[]) => console.log('[Routing]', ...args)
  : () => {};

// ============================================================================
// SPATIAL OPTIMIZATION UTILITIES
// ============================================================================

/**
 * Filter cameras to only those within the route's bounding box
 * Uses spatial grid for O(1) cell lookups instead of O(n) linear scan
 */
function filterCamerasToRouteBounds(
  cameras: ALPRCamera[],
  origin: Location,
  destination: Location,
  bufferDegrees: number = 0.5
): ALPRCamera[] {
  const lats = [origin.lat, destination.lat];
  const lons = [origin.lon, destination.lon];

  // Create bounding box with buffer
  const south = Math.min(...lats) - bufferDegrees;
  const north = Math.max(...lats) + bufferDegrees;
  const west = Math.min(...lons) - bufferDegrees;
  const east = Math.max(...lons) + bufferDegrees;

  // Use spatial grid for efficient lookup
  const grid = buildSpatialGrid(cameras);
  return getCamerasInBoundsFromGrid(grid, north, south, east, west);
}

/**
 * Configuration for camera-aware routing
 */
export interface CameraAvoidanceConfig {
  avoidanceWeight: number;
  maxDetourPercent: number;
  /** Distance in meters for camera detection and avoidance (used for blocking, penalties, and route detection) */
  cameraDistanceMeters: number;
  costing: 'auto' | 'bicycle' | 'pedestrian';
  maxIterations: number;
  /** Enable iterative waypoint fallback (tries harder but slower) */
  useIterativeWaypoints: boolean;
  /** Buffer in degrees to expand bounding box for camera filtering (~0.5 = ~55km) */
  bboxBufferDegrees: number;

  // Directional zone options (all optional, defaults to circular zones)
  /** Enable directional cone zones for cameras with direction data */
  useDirectionalZones?: boolean;
  /** Total field of view for camera cone (degrees) */
  cameraFovDegrees?: number;
  /** Back buffer distance behind camera (meters) */
  backBufferMeters?: number;
  // NOTE: directionalRangeMeters was removed - the cameraDistanceMeters value
  // (from the slider) is now used for both circular AND directional zones.
}

export const DEFAULT_AVOIDANCE_CONFIG: CameraAvoidanceConfig = {
  avoidanceWeight: 0.7,
  maxDetourPercent: DETOUR_LIMITS.maxDetourPercent,
  cameraDistanceMeters: CAMERA_DETECTION.routeBufferMeters,
  costing: 'auto',
  maxIterations: WAYPOINT_AVOIDANCE.maxIterations,
  useIterativeWaypoints: false, // Disabled by default - expensive fallback
  bboxBufferDegrees: CAMERA_DETECTION.bboxBufferDegrees,
  useDirectionalZones: true, // Use directional cones for cameras with direction data
};

// ZoneStats is imported from graphHopperService

/**
 * Result of camera-aware routing
 */
export interface CameraAwareRouteResult {
  route: Route;
  camerasOnRoute: CameraOnRoute[];
  score: {
    distanceMeters: number;
    durationSeconds: number;
    cameraCount: number;
    totalCameraPenalty: number;
    compositeScore: number;
    exposureRating: 'low' | 'medium' | 'high' | 'extreme';
  };
  strategy: string;
  attempts: number;
  /** Zone type statistics (only present when avoidance routing was attempted) */
  zoneStats?: ZoneStats;
}

/**
 * Full result with comparison data
 */
export interface CameraRoutingResult {
  normalRoute: CameraAwareRouteResult;
  avoidanceRoute: CameraAwareRouteResult;
  improvement: {
    camerasAvoided: number;
    cameraReductionPercent: number;
    distanceIncrease: number;
    distanceIncreasePercent: number;
    durationIncrease: number;
    durationIncreasePercent: number;
    penaltyReduction: number;
  };
}

/**
 * MAIN ENTRY: Calculate camera-aware routes using GraphHopper
 * 
 * GraphHopper advantages:
 * - priority=0.001 in custom_model near-completely blocks roads while maintaining connectivity
 * - Multiple penalty tiers for graduated avoidance
 * - Faster and more reliable than Valhalla for avoidance routing
 * 
 * Optimizations:
 * - Bounding box filtering reduces camera payload from MBs to KBs
 * - Iterative waypoints disabled by default (expensive fallback)
 */
export async function calculateCameraAwareRoute(
  origin: Location,
  destination: Location,
  cameras: ALPRCamera[],
  config: Partial<CameraAvoidanceConfig> = {}
): Promise<CameraRoutingResult> {
  // Check distance limit before doing any heavy computation
  const straightLineDistance = haversineDistance(origin.lat, origin.lon, destination.lat, destination.lon);
  if (straightLineDistance > ROUTE_LIMITS.maxDistanceMeters) {
    const actualMiles = (straightLineDistance / 1609.34).toFixed(0);
    throw new Error(
      `Route distance exceeds maximum. The straight-line distance is ${actualMiles} miles, ` +
      `but routes longer than ${ROUTE_LIMITS.maxDistanceDisplay} are not supported.`
    );
  }

  const fullConfig: CameraAvoidanceConfig = { ...DEFAULT_AVOIDANCE_CONFIG, ...config };

  debug('=== Camera Avoidance Routing ===');
  debug(`Max detour: ${fullConfig.maxDetourPercent}%`);

  // OPTIMIZATION: Filter cameras to only those within route bounding box
  // Uses spatial grid for efficient O(1) cell lookups
  const relevantCameras = filterCamerasToRouteBounds(
    cameras,
    origin,
    destination,
    fullConfig.bboxBufferDegrees
  );

  debug(`Spatial filter: ${cameras.length} → ${relevantCameras.length} cameras`);
  
  // Build GraphHopper config from avoidance config
  // IMPORTANT: Avoidance zones must be LARGER than detection radius to ensure
  // routes that avoid zones are outside the detection buffer.
  const ghConfig: Partial<GraphHopperConfig> = {
    cameraBlockRadius: fullConfig.cameraDistanceMeters * ZONE_SAFETY_MULTIPLIERS.block,
    cameraPenaltyRadius: fullConfig.cameraDistanceMeters * ZONE_SAFETY_MULTIPLIERS.penalty,
    maxDetourFactor: 1 + (fullConfig.maxDetourPercent / 100),
    fallbackToMinimize: true,
  };
  
  // Step 1: Calculate normal route (no avoidance)
  let normalRoute: Route;
  try {
    normalRoute = await calculateRoute(origin, destination, fullConfig.costing, ghConfig);
  } catch (error) {
    throw new Error(`Failed to calculate baseline route: ${error}`);
  }
  
  // Use filtered cameras for route analysis
  // When directional zones are enabled, only count cameras facing the route
  const useDirectional = fullConfig.useDirectionalZones ?? false;
  const normalCameras = findCamerasOnRoute(relevantCameras, normalRoute.geometry, fullConfig.cameraDistanceMeters, useDirectional);
  
  const normalResult: CameraAwareRouteResult = {
    route: normalRoute,
    camerasOnRoute: normalCameras,
    score: scoreRoute(normalRoute, normalCameras),
    strategy: 'normal',
    attempts: 1,
  };
  
  debug(`Normal route: ${(normalRoute.distanceMeters / 1609.34).toFixed(2)} mi, ${normalCameras.length} cameras`);

  // If no cameras on normal route, we're done
  if (normalCameras.length === 0) {
    debug('No cameras on normal route');
    return buildResult(normalResult, normalResult);
  }
  
  // Step 2: Try GraphHopper camera avoidance (primary strategy)
  // Uses filtered cameras for smaller payload
  let avoidanceResult = await tryGraphHopperAvoidance(
    origin,
    destination,
    relevantCameras,
    normalResult,
    fullConfig,
    ghConfig
  );
  
  // Step 3: If GraphHopper didn't achieve zero cameras, try iterative waypoints
  // Auto-enable for small number of remaining cameras (quick to fix) or if user explicitly enabled
  const shouldTryWaypoints = avoidanceResult.camerasOnRoute.length > 0 && (
    fullConfig.useIterativeWaypoints ||
    avoidanceResult.camerasOnRoute.length <= WAYPOINT_AVOIDANCE.autoEnableThreshold
  );

  if (shouldTryWaypoints) {
    debug(`Trying iterative waypoints for ${avoidanceResult.camerasOnRoute.length} remaining camera(s)`);

    // Limit iterations for auto-mode (faster)
    const waypointConfig = {
      ...fullConfig,
      maxIterations: fullConfig.useIterativeWaypoints
        ? fullConfig.maxIterations
        : WAYPOINT_AVOIDANCE.autoModeIterations,
    };
    
    const waypointResult = await iterativeWaypointAvoidance(
      origin,
      destination,
      relevantCameras,
      avoidanceResult, // Start from current best, not normal
      waypointConfig,
      ghConfig
    );
    
    // Use waypoint result if it's better
    if (waypointResult.camerasOnRoute.length < avoidanceResult.camerasOnRoute.length) {
      avoidanceResult = waypointResult;
    }
  } else if (avoidanceResult.camerasOnRoute.length > 0) {
    debug(`${avoidanceResult.camerasOnRoute.length} cameras remain - may be on unavoidable roads`);
  }
  
  return buildResult(normalResult, avoidanceResult);
}

/**
 * Build zone generation options from config
 * 
 * NOTE: The zone range (radius for circular, forward range for directional) is NOT
 * set here - it's passed as the radiusMeters parameter to generateCameraZone.
 * This allows block zones and penalty zones to have different sizes.
 */
function buildZoneOptions(config: CameraAvoidanceConfig): ZoneGenerationOptions {
  return {
    useDirectionalZones: config.useDirectionalZones ?? false,
    cameraFovDegrees: config.cameraFovDegrees ?? DIRECTIONAL_ZONE.cameraFovDegrees,
    backBufferMeters: config.backBufferMeters ?? DIRECTIONAL_ZONE.backBufferMeters,
  };
}

/**
 * Try GraphHopper's native camera avoidance using custom_model
 */
async function tryGraphHopperAvoidance(
  origin: Location,
  destination: Location,
  cameras: ALPRCamera[],
  normalResult: CameraAwareRouteResult,
  config: CameraAvoidanceConfig,
  ghConfig: Partial<GraphHopperConfig>
): Promise<CameraAwareRouteResult> {
  const maxDistance = normalResult.route.distanceMeters * (1 + config.maxDetourPercent / 100);

  // Build zone options from config
  const zoneOptions = buildZoneOptions(config);

  try {
    // Use GraphHopper's custom model to block camera zones
    const { route: avoidanceRoute, zoneStats } = await calculateAvoidanceRouteWithStats(
      origin,
      destination,
      cameras,
      config.costing,
      ghConfig,
      zoneOptions
    );

    // Check if within detour limit
    if (avoidanceRoute.distanceMeters > maxDistance) {
      debug('Avoidance route exceeds max detour, using minimized exposure');
    }

    const useDirectional = config.useDirectionalZones ?? false;
    const routeCameras = findCamerasOnRoute(cameras, avoidanceRoute.geometry, config.cameraDistanceMeters, useDirectional);

    debug(`Avoidance: ${routeCameras.length} cameras, ${(avoidanceRoute.distanceMeters / 1609.34).toFixed(2)} mi`);

    if (routeCameras.length === 0) {
      debug('Achieved zero cameras');
    }

    return {
      route: avoidanceRoute,
      camerasOnRoute: routeCameras,
      score: scoreRoute(avoidanceRoute, routeCameras),
      strategy: routeCameras.length === 0 ? 'graphhopper-blocked' : 'graphhopper-minimized',
      attempts: 1,
      zoneStats,
    };
  } catch (error) {
    debug('GraphHopper avoidance failed:', error);
    return normalResult;
  }
}

/**
 * Iteratively add waypoints to avoid remaining cameras
 */
async function iterativeWaypointAvoidance(
  origin: Location,
  destination: Location,
  allCameras: ALPRCamera[],
  normalResult: CameraAwareRouteResult,
  config: CameraAvoidanceConfig,
  ghConfig: Partial<GraphHopperConfig>
): Promise<CameraAwareRouteResult> {
  const maxDistance = normalResult.route.distanceMeters * (1 + config.maxDetourPercent / 100);
  
  // Track all waypoints we're accumulating
  let waypoints: [number, number][] = [];
  let currentBest = normalResult;
  let iteration = 0;
  
  // Track cameras we've already tried to avoid
  const attemptedCameras = new Set<number>();

  debug(`Iterative waypoint avoidance - max distance: ${(maxDistance / 1609.34).toFixed(2)} mi`);
  
  while (iteration < config.maxIterations) {
    iteration++;
    
    const camerasOnRoute = currentBest.camerasOnRoute;
    
    // SUCCESS: No cameras left!
    if (camerasOnRoute.length === 0) {
      debug(`Reached 0 cameras after ${iteration - 1} iterations`);
      return {
        ...currentBest,
        strategy: `iterative (${iteration - 1} waypoints)`,
        attempts: iteration,
      };
    }

    debug(`Iteration ${iteration}: ${camerasOnRoute.length} cameras remaining`);
    
    // Find the camera closest to the route that we haven't tried yet
    const targetCamera = camerasOnRoute.find(c => !attemptedCameras.has(c.camera.osmId));
    
    if (!targetCamera) {
      debug('All cameras have been attempted');
      break;
    }
    
    attemptedCameras.add(targetCamera.camera.osmId);
    
    // Calculate avoidance waypoints for this camera
    const geometry = currentBest.route.geometry;
    const waypointOptions = calculateAvoidanceWaypoints(
      targetCamera,
      geometry,
      WAYPOINT_AVOIDANCE.offsetDistances as unknown as number[]
    );
    
    // Try each waypoint option
    let foundBetter = false;
    for (const newWaypoint of waypointOptions) {
      const testWaypoints = [...waypoints, newWaypoint];
      
      try {
        const testRoute = await calculateRouteWithWaypoints(
          origin,
          destination,
          testWaypoints,
          config.costing,
          ghConfig
        );
        
        // Check if within detour limit
        if (testRoute.distanceMeters > maxDistance) {
          continue;
        }
        
        const useDirectional = config.useDirectionalZones ?? false;
        const testCameras = findCamerasOnRoute(allCameras, testRoute.geometry, config.cameraDistanceMeters, useDirectional);
        
        debug(`  Waypoint at ${newWaypoint[0].toFixed(4)}, ${newWaypoint[1].toFixed(4)}: ${testCameras.length} cameras`);
        
        // Accept if it reduces cameras
        if (testCameras.length < currentBest.camerasOnRoute.length) {
          currentBest = {
            route: testRoute,
            camerasOnRoute: testCameras,
            score: scoreRoute(testRoute, testCameras),
            strategy: `iterative (${testWaypoints.length} waypoints)`,
            attempts: iteration,
          };
          waypoints = testWaypoints;
          foundBetter = true;
          debug(`  Accepted: now at ${testCameras.length} cameras`);
          break;
        }
      } catch (error) {
        // Waypoint routing failed, try next option
        debug(`  Waypoint routing failed:`, error);
      }
    }
    
    if (!foundBetter) {
      debug(`  No improvement found for camera ${targetCamera.camera.osmId}`);
    }
  }

  debug(`Iterative complete: ${currentBest.camerasOnRoute.length} cameras (started with ${normalResult.camerasOnRoute.length})`);
  
  return currentBest;
}

/**
 * Calculate multiple avoidance waypoint options for a camera
 */
function calculateAvoidanceWaypoints(
  targetCamera: CameraOnRoute,
  geometry: [number, number][],
  offsets: number[]
): [number, number][] {
  const waypoints: [number, number][] = [];
  
  // Find the route segment nearest to this camera
  let nearestIdx = 0;
  let nearestDist = Infinity;
  
  for (let i = 0; i < geometry.length; i++) {
    const dist = haversineDistance(
      targetCamera.camera.lat, 
      targetCamera.camera.lon, 
      geometry[i][0], 
      geometry[i][1]
    );
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestIdx = i;
    }
  }
  
  // Calculate route bearing at this point
  const prevIdx = Math.max(0, nearestIdx - 2);
  const nextIdx = Math.min(geometry.length - 1, nearestIdx + 2);
  const routeBearing = calculateBearing(
    geometry[prevIdx][0], geometry[prevIdx][1],
    geometry[nextIdx][0], geometry[nextIdx][1]
  );
  
  // Create waypoints perpendicular to the route at various distances
  for (const offset of offsets) {
    // Try right side
    const rightBearing = (routeBearing + 90) % 360;
    const rightPoint = destinationPoint(
      targetCamera.camera.lat,
      targetCamera.camera.lon,
      offset,
      rightBearing
    );
    waypoints.push(rightPoint);
    
    // Try left side
    const leftBearing = (routeBearing + 270) % 360;
    const leftPoint = destinationPoint(
      targetCamera.camera.lat,
      targetCamera.camera.lon,
      offset,
      leftBearing
    );
    waypoints.push(leftPoint);
  }
  
  return waypoints;
}

/**
 * Score a route based on distance and camera exposure
 */
function scoreRoute(route: Route, cameras: CameraOnRoute[]) {
  const cameraCount = cameras.length;
  const penalty = cameras.reduce((sum, c) => {
    const proximity = 1 - (c.distanceFromRoute / ROUTE_SCORING.proximityMaxMeters);
    return sum + (proximity * ROUTE_SCORING.penaltyPerCamera);
  }, 0);

  return {
    distanceMeters: route.distanceMeters,
    durationSeconds: route.durationSeconds,
    cameraCount,
    totalCameraPenalty: penalty,
    compositeScore: route.distanceMeters + penalty,
    exposureRating: getExposureRating(cameraCount),
  };
}

function getExposureRating(count: number): 'low' | 'medium' | 'high' | 'extreme' {
  const { exposureThresholds } = ROUTE_SCORING;
  if (count <= exposureThresholds.low) return 'low';
  if (count <= exposureThresholds.medium) return 'medium';
  if (count <= exposureThresholds.high) return 'high';
  return 'extreme';
}

/**
 * Build the final comparison result
 */
function buildResult(
  normalResult: CameraAwareRouteResult,
  avoidanceResult: CameraAwareRouteResult
): CameraRoutingResult {
  const camerasAvoided = normalResult.camerasOnRoute.length - avoidanceResult.camerasOnRoute.length;
  const cameraReductionPercent = normalResult.camerasOnRoute.length > 0
    ? (camerasAvoided / normalResult.camerasOnRoute.length) * 100
    : 0;
  
  const distanceIncrease = avoidanceResult.route.distanceMeters - normalResult.route.distanceMeters;
  const distanceIncreasePercent = (distanceIncrease / normalResult.route.distanceMeters) * 100;
  
  const durationIncrease = avoidanceResult.route.durationSeconds - normalResult.route.durationSeconds;
  const durationIncreasePercent = (durationIncrease / normalResult.route.durationSeconds) * 100;
  
  const penaltyReduction = normalResult.score.totalCameraPenalty - avoidanceResult.score.totalCameraPenalty;
  
  return {
    normalRoute: normalResult,
    avoidanceRoute: avoidanceResult,
    improvement: {
      camerasAvoided,
      cameraReductionPercent,
      distanceIncrease,
      distanceIncreasePercent,
      durationIncrease,
      durationIncreasePercent,
      penaltyReduction,
    },
  };
}
