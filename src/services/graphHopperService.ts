/**
 * GraphHopper Camera Avoidance Routing Service
 * 
 * Superior to Valhalla for camera avoidance:
 * - GraphHopper's custom_model with priority=0 COMPLETELY blocks roads
 * - Valhalla's exclude_polygons only excludes at segment level
 */

import type {
  Location,
  Route,
  Maneuver,
  ALPRCamera,
} from '../types';
import { generateId } from '../utils/formatting';
import { createCircle, generateDirectionalCone } from '../utils/geo';
import {
  GRAPHHOPPER_AVOIDANCE,
  GRADUATED_PENALTIES,
  DETOUR_LIMITS,
  ROUTING_DEBUG,
  ROAD_CLASS_PENALTIES,
  DIRECTIONAL_ZONE,
} from './routingConfig';

/** Conditional debug logger */
const debug = ROUTING_DEBUG
  ? (...args: unknown[]) => console.log('[GraphHopper]', ...args)
  : () => {};

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface GraphHopperConfig {
  endpoint: string;
  profile: 'car' | 'bike' | 'foot';
  cameraBlockRadius: number;      // Roads within this radius are BLOCKED (priority=0)
  cameraPenaltyRadius: number;    // Roads within this radius are penalized
  maxDetourFactor: number;        // e.g., 2.0 = accept routes up to 2x normal length
  fallbackToMinimize: boolean;    // If zero-camera impossible, minimize exposure
}

// GraphHopper endpoint configuration
const GRAPHHOPPER_ENDPOINT = import.meta.env.VITE_GRAPHHOPPER_ENDPOINT || 'http://localhost:8989';

// Warn about localhost endpoint in production builds
if (import.meta.env.PROD && GRAPHHOPPER_ENDPOINT.includes('localhost')) {
  console.error('[GraphHopper] CRITICAL: Using localhost endpoint in production! Set VITE_GRAPHHOPPER_ENDPOINT to your production server.');
}

export const DEFAULT_GRAPHHOPPER_CONFIG: GraphHopperConfig = {
  endpoint: GRAPHHOPPER_ENDPOINT,
  profile: 'car',
  cameraBlockRadius: GRAPHHOPPER_AVOIDANCE.blockRadiusMeters,
  cameraPenaltyRadius: GRAPHHOPPER_AVOIDANCE.penaltyRadiusMeters,
  maxDetourFactor: DETOUR_LIMITS.maxDetourFactor,
  fallbackToMinimize: true,
};

// ============================================================================
// ROAD CLASS PENALTY RULES
// ============================================================================

/**
 * Build priority rules for road class penalties.
 * These discourage routing through parking lots, driveways, and unpaved roads.
 */
function buildRoadClassPenalties(): Array<{ if: string; multiply_by: number }> {
  return [
    { if: 'road_class == SERVICE', multiply_by: ROAD_CLASS_PENALTIES.service },
    { if: 'road_class == TRACK', multiply_by: ROAD_CLASS_PENALTIES.track },
    { if: 'road_class == UNCLASSIFIED', multiply_by: ROAD_CLASS_PENALTIES.unclassified },
  ];
}

// ============================================================================
// ZONE GENERATION OPTIONS
// ============================================================================

/**
 * Options for generating camera avoidance zones
 */
export interface ZoneGenerationOptions {
  /** Enable directional cone zones for cameras with direction data */
  useDirectionalZones?: boolean;
  /** Total field of view for camera cone (degrees) */
  cameraFovDegrees?: number;
  /** Back buffer distance behind camera (meters) */
  backBufferMeters?: number;
  // NOTE: directionalRangeMeters was removed - the radiusMeters parameter
  // passed to generateCameraZone is now used for both circular AND directional zones.
  // This ensures block zones are smaller than penalty zones for all zone types.
}

/**
 * Result of zone generation with statistics
 */
export interface ZoneGenerationResult {
  /** The generated zone polygon coordinates */
  coordinates: number[][];
  /** Whether this is a directional (cone) zone */
  isDirectional: boolean;
}

/**
 * Statistics about zone types generated
 */
export interface ZoneStats {
  directionalZones: number;
  circularZones: number;
}

/**
 * Generate an avoidance zone for a single camera.
 * Uses directional cone if enabled and camera has direction data,
 * otherwise falls back to circular zone.
 *
 * @param camera - The camera to generate a zone for
 * @param radiusMeters - Radius/range for the zone (used for both circular AND directional)
 * @param options - Zone generation options
 * @returns Zone coordinates and whether it's directional
 */
export function generateCameraZone(
  camera: ALPRCamera,
  radiusMeters: number,
  options: ZoneGenerationOptions = {}
): ZoneGenerationResult {
  const {
    useDirectionalZones = false,
    cameraFovDegrees = DIRECTIONAL_ZONE.cameraFovDegrees,
    backBufferMeters = DIRECTIONAL_ZONE.backBufferMeters,
  } = options;

  // Use directional zone if enabled AND camera has valid direction
  if (useDirectionalZones && camera.direction !== undefined && camera.direction !== null) {
    // IMPORTANT: Use radiusMeters for the cone range, not a separate directionalRangeMeters.
    // This ensures block zones get smaller cones than penalty zones.
    const coordinates = generateDirectionalCone(
      [camera.lon, camera.lat],
      camera.direction,
      cameraFovDegrees,
      radiusMeters,  // Use the passed radius, not options.directionalRangeMeters
      backBufferMeters,
      DIRECTIONAL_ZONE.arcSegments
    );
    return { coordinates, isDirectional: true };
  }

  // Fall back to circular zone
  const coordinates = createCircle(camera.lat, camera.lon, radiusMeters);
  return { coordinates, isDirectional: false };
}

/**
 * Generate avoidance zones for multiple cameras with statistics.
 *
 * @param cameras - Array of cameras to generate zones for
 * @param radiusMeters - Radius for circular zones
 * @param options - Zone generation options
 * @returns Object with zone coordinates array and statistics
 */
export function generateCameraZones(
  cameras: ALPRCamera[],
  radiusMeters: number,
  options: ZoneGenerationOptions = {}
): { zones: number[][][]; stats: ZoneStats } {
  const zones: number[][][] = [];
  const stats: ZoneStats = { directionalZones: 0, circularZones: 0 };

  for (const camera of cameras) {
    const result = generateCameraZone(camera, radiusMeters, options);
    zones.push(result.coordinates);

    if (result.isDirectional) {
      stats.directionalZones++;
    } else {
      stats.circularZones++;
    }
  }

  return { zones, stats };
}

// ============================================================================
// GRAPHHOPPER API TYPES
// ============================================================================

// GeoJSON Feature wrapper for areas (required by GraphHopper 9+)
interface GHAreaFeature {
  type: 'Feature';
  geometry: GeoJSON.MultiPolygon;
}

interface GHRequest {
  points: [number, number][];
  profile: string;
  custom_model?: {
    areas?: Record<string, GHAreaFeature>;
    priority?: Array<{ if: string; multiply_by: number }>;
    distance_influence?: number;
  };
  points_encoded?: boolean;
  instructions?: boolean;
  calc_points?: boolean;
  algorithm?: string;
  'ch.disable'?: boolean;
}

interface GHPath {
  distance: number;
  time: number;
  points: {
    coordinates: [number, number][];
  };
  instructions?: Array<{
    text: string;
    distance: number;
    time: number;
    interval: [number, number];
    street_name?: string;
  }>;
}

interface GHResponse {
  paths?: GHPath[];
  message?: string;
}

// ============================================================================
// GRAPHHOPPER API CALL
// ============================================================================

async function callGraphHopper(
  request: GHRequest,
  endpoint: string
): Promise<GHResponse> {
  const url = `${endpoint}/route`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const data: GHResponse = await response.json();

  if (!response.ok || data.message) {
    throw new Error(data.message || `GraphHopper error: ${response.status}`);
  }

  return data;
}

// ============================================================================
// ROUTE CONVERSION
// ============================================================================

function ghPathToRoute(
  path: GHPath,
  origin: Location,
  destination: Location,
  profile: string
): Route {
  const maneuvers: Maneuver[] = path.instructions?.map((inst, i) => ({
    instruction: inst.text,
    type: i,
    streetNames: inst.street_name ? [inst.street_name] : undefined,
    length: inst.distance,
    time: inst.time / 1000,
    beginShapeIndex: inst.interval[0],
    endShapeIndex: inst.interval[1],
  })) || [];

  // Map GraphHopper profile to our costing type
  const costingMap: Record<string, 'auto' | 'bicycle' | 'pedestrian'> = {
    car: 'auto',
    bike: 'bicycle',
    foot: 'pedestrian',
  };

  return {
    id: generateId(),
    origin,
    destination,
    // GraphHopper returns [lon, lat], convert to [lat, lon]
    geometry: path.points.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]),
    encodedPolyline: '', // GraphHopper returns decoded coordinates
    distanceMeters: path.distance,
    durationSeconds: path.time / 1000,
    maneuvers,
    costing: costingMap[profile] || 'auto',
    timestamp: new Date(),
  };
}

// ============================================================================
// MAIN ROUTING FUNCTIONS
// ============================================================================

/**
 * Calculate baseline route (no camera avoidance)
 */
export async function calculateRoute(
  origin: Location,
  destination: Location,
  costing: 'auto' | 'bicycle' | 'pedestrian' = 'auto',
  config: Partial<GraphHopperConfig> = {}
): Promise<Route> {
  const cfg = { ...DEFAULT_GRAPHHOPPER_CONFIG, ...config };
  
  // Map our costing to GraphHopper profile
  const profileMap: Record<string, string> = {
    auto: 'car',
    bicycle: 'bike',
    pedestrian: 'foot',
  };

  const request: GHRequest = {
    points: [
      [origin.lon, origin.lat],
      [destination.lon, destination.lat],
    ],
    profile: profileMap[costing] || cfg.profile,
    points_encoded: false,
    instructions: true,
    calc_points: true,
  };

  const response = await callGraphHopper(request, cfg.endpoint);
  
  if (!response.paths || response.paths.length === 0) {
    throw new Error('No route found');
  }

  return ghPathToRoute(response.paths[0], origin, destination, request.profile);
}

/**
 * Result from avoidance route calculation with zone statistics
 */
export interface AvoidanceRouteResult {
  route: Route;
  zoneStats: ZoneStats;
}

/**
 * Calculate a route that avoids camera locations using GraphHopper's custom model
 * This is superior to Valhalla because priority=0 completely blocks roads
 */
export async function calculateAvoidanceRoute(
  origin: Location,
  destination: Location,
  camerasToAvoid: ALPRCamera[],
  costing: 'auto' | 'bicycle' | 'pedestrian' = 'auto',
  config: Partial<GraphHopperConfig> = {},
  zoneOptions: ZoneGenerationOptions = {}
): Promise<Route> {
  const result = await calculateAvoidanceRouteWithStats(
    origin,
    destination,
    camerasToAvoid,
    costing,
    config,
    zoneOptions
  );
  return result.route;
}

/**
 * Calculate a route that avoids camera locations, returning zone statistics.
 * Use this when you need to track how many directional vs circular zones were used.
 */
export async function calculateAvoidanceRouteWithStats(
  origin: Location,
  destination: Location,
  camerasToAvoid: ALPRCamera[],
  costing: 'auto' | 'bicycle' | 'pedestrian' = 'auto',
  config: Partial<GraphHopperConfig> = {},
  zoneOptions: ZoneGenerationOptions = {}
): Promise<AvoidanceRouteResult> {
  const cfg = { ...DEFAULT_GRAPHHOPPER_CONFIG, ...config };

  // Map our costing to GraphHopper profile
  const profileMap: Record<string, string> = {
    auto: 'car',
    bicycle: 'bike',
    pedestrian: 'foot',
  };
  const profile = profileMap[costing] || cfg.profile;

  // Default zone stats (no zones)
  let zoneStats: ZoneStats = { directionalZones: 0, circularZones: 0 };

  // If no cameras to avoid, return normal route
  if (camerasToAvoid.length === 0) {
    const route = await calculateRoute(origin, destination, costing, config);
    return { route, zoneStats };
  }

  debug(`Creating avoidance zones for ${camerasToAvoid.length} cameras`);
  if (zoneOptions.useDirectionalZones) {
    debug('Directional zones enabled');
  }

  // Generate camera avoidance zones using the new conditional function
  const blockResult = generateCameraZones(camerasToAvoid, cfg.cameraBlockRadius, zoneOptions);
  const penaltyResult = generateCameraZones(camerasToAvoid, cfg.cameraPenaltyRadius, zoneOptions);

  // Use block zone stats (both should be the same since same cameras)
  zoneStats = blockResult.stats;

  debug(`Zone types: ${zoneStats.directionalZones} directional, ${zoneStats.circularZones} circular`);

  // Build camera avoidance zones as GeoJSON Feature with MultiPolygon geometry
  // GraphHopper 9+ requires Feature format for areas
  const blockZones: GHAreaFeature = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: blockResult.zones.map(z => [z]),
    },
  };

  const penaltyZones: GHAreaFeature = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: penaltyResult.zones.map(z => [z]),
    },
  };

  // Build custom model that blocks all camera zones
  const request: GHRequest = {
    points: [
      [origin.lon, origin.lat],
      [destination.lon, destination.lat],
    ],
    profile,
    custom_model: {
      areas: {
        block_zones: blockZones,
        penalty_zones: penaltyZones,
      },
      priority: [
        // Camera avoidance (highest priority)
        { if: 'in_block_zones', multiply_by: GRAPHHOPPER_AVOIDANCE.blockPriority },
        { if: 'in_penalty_zones', multiply_by: GRAPHHOPPER_AVOIDANCE.penaltyPriority },
        // Road class penalties (avoid parking lots, tracks)
        ...buildRoadClassPenalties(),
      ],
      distance_influence: GRAPHHOPPER_AVOIDANCE.distanceInfluence,
    },
    points_encoded: false,
    instructions: true,
    calc_points: true,
    'ch.disable': true, // Required for custom models
  };

  try {
    const response = await callGraphHopper(request, cfg.endpoint);

    if (response.paths && response.paths.length > 0) {
      debug('Zero-camera route found');
      return {
        route: ghPathToRoute(response.paths[0], origin, destination, profile),
        zoneStats,
      };
    }
  } catch (error) {
    debug('Zero-camera route failed:', error);
  }

  // Fallback: minimize exposure if zero-camera route not possible
  if (cfg.fallbackToMinimize) {
    debug('Falling back to minimized exposure route');
    const route = await calculateMinimizedExposureRoute(
      origin,
      destination,
      camerasToAvoid,
      costing,
      cfg,
      zoneOptions
    );
    return { route, zoneStats };
  }

  // Ultimate fallback: normal route
  debug('All strategies failed, returning normal route');
  const route = await calculateRoute(origin, destination, costing, config);
  return { route, zoneStats };
}

/**
 * Calculate route that minimizes (but doesn't guarantee zero) camera exposure
 */
async function calculateMinimizedExposureRoute(
  origin: Location,
  destination: Location,
  cameras: ALPRCamera[],
  costing: 'auto' | 'bicycle' | 'pedestrian',
  config: GraphHopperConfig,
  zoneOptions: ZoneGenerationOptions = {}
): Promise<Route> {
  const profileMap: Record<string, string> = {
    auto: 'car',
    bicycle: 'bike',
    pedestrian: 'foot',
  };
  const profile = profileMap[costing] || config.profile;

  // Use graduated penalties from config
  const zones = GRADUATED_PENALTIES.zones;

  // Generate zones with directional option support
  const innerResult = generateCameraZones(cameras, zones[0].radiusMeters, zoneOptions);
  const middleResult = generateCameraZones(cameras, zones[1].radiusMeters, zoneOptions);
  const outerResult = generateCameraZones(cameras, zones[2].radiusMeters, zoneOptions);

  const innerZones: GHAreaFeature = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: innerResult.zones.map(z => [z]),
    },
  };
  const middleZones: GHAreaFeature = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: middleResult.zones.map(z => [z]),
    },
  };
  const outerZones: GHAreaFeature = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: outerResult.zones.map(z => [z]),
    },
  };

  const request: GHRequest = {
    points: [
      [origin.lon, origin.lat],
      [destination.lon, destination.lat],
    ],
    profile,
    custom_model: {
      areas: {
        inner: innerZones,
        middle: middleZones,
        outer: outerZones,
      },
      priority: [
        // Camera avoidance (graduated)
        { if: 'in_inner', multiply_by: zones[0].priority },
        { if: 'in_middle', multiply_by: zones[1].priority },
        { if: 'in_outer', multiply_by: zones[2].priority },
        // Road class penalties (avoid parking lots, tracks)
        ...buildRoadClassPenalties(),
      ],
      distance_influence: GRADUATED_PENALTIES.distanceInfluence,
    },
    points_encoded: false,
    instructions: true,
    calc_points: true,
    'ch.disable': true,
  };

  const response = await callGraphHopper(request, config.endpoint);

  if (!response.paths || response.paths.length === 0) {
    // Ultimate fallback: return normal route
    return calculateRoute(origin, destination, costing, config);
  }

  return ghPathToRoute(response.paths[0], origin, destination, profile);
}

// ============================================================================
// ROUTE WITH WAYPOINTS
// ============================================================================

/**
 * Calculate route through specific waypoints
 */
export async function calculateRouteWithWaypoints(
  origin: Location,
  destination: Location,
  waypoints: [number, number][],
  costing: 'auto' | 'bicycle' | 'pedestrian' = 'auto',
  config: Partial<GraphHopperConfig> = {}
): Promise<Route> {
  const cfg = { ...DEFAULT_GRAPHHOPPER_CONFIG, ...config };
  
  const profileMap: Record<string, string> = {
    auto: 'car',
    bicycle: 'bike',
    pedestrian: 'foot',
  };
  const profile = profileMap[costing] || cfg.profile;

  // Build points array: origin, waypoints, destination
  const points: [number, number][] = [
    [origin.lon, origin.lat],
    ...waypoints.map(wp => [wp[1], wp[0]] as [number, number]), // Convert [lat, lon] to [lon, lat]
    [destination.lon, destination.lat],
  ];

  const request: GHRequest = {
    points,
    profile,
    points_encoded: false,
    instructions: true,
    calc_points: true,
  };

  const response = await callGraphHopper(request, cfg.endpoint);
  
  if (!response.paths || response.paths.length === 0) {
    throw new Error('No route found');
  }

  return ghPathToRoute(response.paths[0], origin, destination, profile);
}

/**
 * Calculate avoidance route through specific waypoints
 * This combines waypoint routing with camera avoidance using GraphHopper's custom model
 */
export async function calculateAvoidanceRouteWithWaypoints(
  origin: Location,
  destination: Location,
  waypoints: [number, number][],
  camerasToAvoid: ALPRCamera[],
  costing: 'auto' | 'bicycle' | 'pedestrian' = 'auto',
  config: Partial<GraphHopperConfig> = {},
  zoneOptions: ZoneGenerationOptions = {}
): Promise<Route> {
  const cfg = { ...DEFAULT_GRAPHHOPPER_CONFIG, ...config };
  
  const profileMap: Record<string, string> = {
    auto: 'car',
    bicycle: 'bike',
    pedestrian: 'foot',
  };
  const profile = profileMap[costing] || cfg.profile;

  // Build points array: origin, waypoints, destination
  const points: [number, number][] = [
    [origin.lon, origin.lat],
    ...waypoints.map(wp => [wp[1], wp[0]] as [number, number]), // Convert [lat, lon] to [lon, lat]
    [destination.lon, destination.lat],
  ];

  // If no cameras to avoid, return normal waypoint route
  if (camerasToAvoid.length === 0) {
    return calculateRouteWithWaypoints(origin, destination, waypoints, costing, config);
  }

  debug(`Creating avoidance zones for ${camerasToAvoid.length} cameras with ${waypoints.length} waypoints`);
  if (zoneOptions.useDirectionalZones) {
    debug('Directional zones enabled for waypoint route');
  }

  // Generate camera avoidance zones using the conditional function
  // This supports both circular and directional (cone) zones
  const blockResult = generateCameraZones(camerasToAvoid, cfg.cameraBlockRadius, zoneOptions);
  const penaltyResult = generateCameraZones(camerasToAvoid, cfg.cameraPenaltyRadius, zoneOptions);

  // Build camera avoidance zones as GeoJSON Feature with MultiPolygon geometry
  const blockZones: GHAreaFeature = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: blockResult.zones.map(z => [z]),
    },
  };

  const penaltyZones: GHAreaFeature = {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: penaltyResult.zones.map(z => [z]),
    },
  };

  // Build custom model that blocks all camera zones
  const request: GHRequest = {
    points,
    profile,
    custom_model: {
      areas: {
        block_zones: blockZones,
        penalty_zones: penaltyZones,
      },
      priority: [
        // Camera avoidance (highest priority)
        { if: 'in_block_zones', multiply_by: GRAPHHOPPER_AVOIDANCE.blockPriority },
        { if: 'in_penalty_zones', multiply_by: GRAPHHOPPER_AVOIDANCE.penaltyPriority },
        // Road class penalties (avoid parking lots, tracks)
        ...buildRoadClassPenalties(),
      ],
      distance_influence: GRAPHHOPPER_AVOIDANCE.distanceInfluence,
    },
    points_encoded: false,
    instructions: true,
    calc_points: true,
    'ch.disable': true,
  };

  try {
    const response = await callGraphHopper(request, cfg.endpoint);

    if (response.paths && response.paths.length > 0) {
      debug('Avoidance route with waypoints found');
      return ghPathToRoute(response.paths[0], origin, destination, profile);
    }
  } catch (error) {
    debug('Avoidance route with waypoints failed:', error);
  }

  // Fallback: try normal waypoint route
  debug('Falling back to normal waypoint route');
  return calculateRouteWithWaypoints(origin, destination, waypoints, costing, config);
}

