import type { CameraOnRoute } from './camera.js';

export interface Location {
  lat: number;
  lon: number;
  name?: string;
  address?: string;
}

export interface Route {
  id: string;
  origin: Location;
  destination: Location;
  waypoints?: Location[];
  geometry: [number, number][];
  encodedPolyline: string;
  distanceMeters: number;
  durationSeconds: number;
  maneuvers?: Maneuver[];
  costing: 'auto' | 'bicycle' | 'pedestrian';
  timestamp: Date;
}

export interface Maneuver {
  instruction: string;
  type: number;
  streetNames?: string[];
  length: number;
  time: number;
  beginShapeIndex: number;
  endShapeIndex: number;
}

export interface RouteAnalysis {
  route: Route;
  exposure: {
    totalCameras: number;
    facingCameras: number;
    byOperator: Record<string, number>;
    byBrand: Record<string, number>;
  };
  cameras: CameraOnRoute[];
}

export interface AvoidanceRoute {
  normalRoute: Route;
  avoidanceRoute: Route;
  comparison: RouteComparison;
  config: AvoidanceConfig;
}

export interface RouteComparison {
  distanceIncrease: number;
  distanceIncreasePercent: number;
  durationIncrease: number;
  durationIncreasePercent: number;
  camerasAvoided: number;
  remainingCameras: number;
  normalCameras: CameraOnRoute[];
  avoidanceCameras: CameraOnRoute[];
}

export interface AvoidanceConfig {
  avoidanceLevel: 'minimal' | 'moderate' | 'maximum';
  avoidanceRadiusMeters: number;
  maxDetourPercent: number;
  mustAvoidCameraIds: number[];
}

// ============================================================================
// GRAPHHOPPER TYPES
// ============================================================================

export interface GraphHopperRequest {
  points: [number, number][];  // [[lon, lat], ...]
  profile: string;
  custom_model?: {
    areas?: Record<string, GeoJSON.MultiPolygon>;
    priority?: Array<{ if: string; multiply_by: number }>;
    distance_influence?: number;
  };
  points_encoded?: boolean;
  instructions?: boolean;
  calc_points?: boolean;
  algorithm?: string;
  'ch.disable'?: boolean;
}

export interface GraphHopperResponse {
  paths?: GraphHopperPath[];
  message?: string;
}

export interface GraphHopperPath {
  distance: number;      // meters
  time: number;          // milliseconds
  points: {
    coordinates: [number, number][];  // [lon, lat] pairs
  };
  instructions?: GraphHopperInstruction[];
}

export interface GraphHopperInstruction {
  text: string;
  distance: number;
    time: number;
  interval: [number, number];
  street_name?: string;
}

export interface GraphHopperConfig {
  endpoint: string;
  profile: 'car' | 'bike' | 'foot';
  cameraBlockRadius: number;
  cameraPenaltyRadius: number;
  maxDetourFactor: number;
  fallbackToMinimize: boolean;
}

export interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

export interface GPXMetadata {
  name: string;
  description: string;
  author?: string;
}

/**
 * Configuration for camera-aware routing algorithm
 */
export interface CameraAvoidanceConfig {
  // 0 = no avoidance (shortest path), 1 = maximum avoidance
  avoidanceWeight: number;

  // Maximum acceptable route length increase (percent)
  maxDetourPercent: number;

  // Distance in meters for camera detection and avoidance (used for blocking, penalties, and route detection)
  cameraDistanceMeters: number;

  // Transport mode
  costing: 'auto' | 'bicycle' | 'pedestrian';

  // Max iterations for waypoint avoidance
  maxIterations: number;

  // Enable iterative waypoint fallback (tries harder but slower)
  useIterativeWaypoints: boolean;

  // Buffer in degrees for bounding box camera filtering
  bboxBufferDegrees: number;

  // ============================================================================
  // DIRECTIONAL ZONE OPTIONS (all optional, defaults to circular zones)
  // ============================================================================

  /**
   * Enable directional cone zones for cameras that have direction data.
   * When true, cameras with valid direction (0-360) get wedge-shaped zones.
   * Cameras without direction data fall back to circular zones.
   * Default: false (use circular zones for all cameras)
   */
  useDirectionalZones?: boolean;

  /**
   * Total field of view for camera cone (degrees).
   * Only used when useDirectionalZones is true.
   * Default: 120
   */
  cameraFovDegrees?: number;

  /**
   * Back buffer distance behind camera (meters).
   * Only used when useDirectionalZones is true.
   * Default: 15
   */
  backBufferMeters?: number;
}

/**
 * Statistics about zone types used in routing
 */
export interface ZoneStats {
  /** Number of cameras with directional (cone-shaped) zones */
  directionalZones: number;
  /** Number of cameras with circular zones (fallback) */
  circularZones: number;
}

/**
 * Score breakdown for a route
 */
export interface RouteScoreInfo {
  distanceMeters: number;
  durationSeconds: number;
  cameraCount: number;
  totalCameraPenalty: number;
  compositeScore: number;
  exposureRating: 'low' | 'medium' | 'high' | 'extreme';
}

/**
 * Result from camera-aware routing
 */
export interface CameraAwareRouteResult {
  route: Route;
  camerasOnRoute: CameraOnRoute[];
  score: RouteScoreInfo;
  strategy: string; // e.g., 'normal', 'iterative (5 waypoints)', 'aggressive-polygon'
  attempts: number;
  /** Zone type statistics (only present when avoidance routing was attempted) */
  zoneStats?: ZoneStats;
}

/**
 * Full comparison result from routing
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
