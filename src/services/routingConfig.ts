/**
 * Centralized Routing Configuration
 *
 * All camera detection, avoidance, and routing parameters in one place.
 * Values are derived from base constants for consistency.
 */

// ============================================================================
// DEBUG SETTINGS
// ============================================================================

/** Enable verbose logging for routing operations */
export const ROUTING_DEBUG = import.meta.env.DEV;

// ============================================================================
// BASE CONSTANTS - Change these to tune the entire system
// ============================================================================

/** Base detection radius - how close a camera must be to "see" a vehicle */
const BASE_DETECTION_RADIUS_METERS = 75;

/** Multiplier for block zones (roads to nearly-block in routing) */
const BLOCK_ZONE_MULTIPLIER = 1.6; // 75 * 1.6 = 120m

/** Multiplier for penalty zones (roads to discourage but allow) */
const PENALTY_ZONE_MULTIPLIER = 2.7; // 75 * 2.7 ≈ 200m

/**
 * Multipliers for avoidance zones relative to the user's detection radius.
 * These ensure routes stay well outside the detection radius.
 * 
 * The user's slider sets how close a camera must be to be "counted" (detection).
 * Avoidance zones must be LARGER to give GraphHopper room to find alternative routes.
 * 
 * Example: User sets 75m detection
 * - Block zones: 75 × 1.6 = 120m (roads nearly blocked)
 * - Penalty zones: 75 × 2.5 = 187m (roads heavily penalized)
 * - Routes stay 120m+ away, well outside 75m detection radius
 */
export const ZONE_SAFETY_MULTIPLIERS = {
  /** Block zones are 1.6× the detection radius - routes nearly blocked here */
  block: 1.6,
  /** Penalty zones are 2.5× the detection radius - graduated penalty */
  penalty: 2.5,
} as const;

/** Bounding box buffer for spatial filtering (~55km at US latitudes) */
const BBOX_BUFFER_DEGREES = 0.5;

// ============================================================================
// DIRECTIONAL ZONE SETTINGS (only used when feature is enabled)
// ============================================================================

export const DIRECTIONAL_ZONE = {
  /** 
   * Total field of view for camera cone (degrees)
   * Realistic ALPR cameras have ~60-80° FOV (30-40° each side)
   * 120° was too wide and caused excessive route detours
   */
  cameraFovDegrees: 70,

  /** How far the directional cone extends in front of the camera (meters) - legacy, not used */
  detectionRangeMeters: 120,

  /** Small buffer behind camera to block roads at camera position (meters) */
  backBufferMeters: 15,

  /** Number of arc segments for the front curve of the cone */
  arcSegments: 8,
} as const;

// ============================================================================
// CAMERA DETECTION CONFIG
// ============================================================================

export const CAMERA_DETECTION = {
  /** Distance in meters for a camera to be considered "on route" */
  routeBufferMeters: BASE_DETECTION_RADIUS_METERS,

  /** Bounding box buffer for filtering cameras to route area */
  bboxBufferDegrees: BBOX_BUFFER_DEGREES,
} as const;

// ============================================================================
// GRAPHHOPPER AVOIDANCE CONFIG
// ============================================================================

export const GRAPHHOPPER_AVOIDANCE = {
  /** Roads within this radius are nearly-blocked (priority=0.0001) */
  blockRadiusMeters: Math.round(BASE_DETECTION_RADIUS_METERS * BLOCK_ZONE_MULTIPLIER),

  /** Roads within this radius receive heavy penalty */
  penaltyRadiusMeters: Math.round(BASE_DETECTION_RADIUS_METERS * PENALTY_ZONE_MULTIPLIER),

  /** Priority multiplier for block zones (lower = more blocked, 0.0001 = 10,000x penalty) */
  blockPriority: 0.0001,

  /** Priority multiplier for penalty zones */
  penaltyPriority: 0.01,

  /** Distance influence - higher values prefer avoiding obstacles over shortest path */
  distanceInfluence: 150,
} as const;

// ============================================================================
// GRADUATED PENALTY CONFIG (fallback when blocking fails)
// ============================================================================

export const GRADUATED_PENALTIES = {
  zones: [
    { radiusMeters: Math.round(BASE_DETECTION_RADIUS_METERS * 1.33), priority: 0.001 },  // ~100m, very heavy
    { radiusMeters: Math.round(BASE_DETECTION_RADIUS_METERS * 2.0), priority: 0.05 },   // ~150m, heavy
    { radiusMeters: Math.round(BASE_DETECTION_RADIUS_METERS * 3.33), priority: 0.3 },   // ~250m, moderate
  ],
  distanceInfluence: 150,
} as const;

// ============================================================================
// ITERATIVE WAYPOINT CONFIG
// ============================================================================

export const WAYPOINT_AVOIDANCE = {
  /** Offset distances to try when placing avoidance waypoints (meters) */
  offsetDistances: [300, 500, 800],

  /** Max iterations for waypoint placement */
  maxIterations: 15,

  /** Auto-enable waypoint fallback for this many remaining cameras or fewer */
  autoEnableThreshold: 3,

  /** Reduced iterations when auto-enabled (faster) */
  autoModeIterations: 5,
} as const;

// ============================================================================
// ROUTE SCORING CONFIG
// ============================================================================

export const ROUTE_SCORING = {
  /** Max distance for proximity penalty calculation */
  proximityMaxMeters: 150,

  /** Penalty multiplier per camera based on proximity */
  penaltyPerCamera: 800,

  /** Exposure rating thresholds */
  exposureThresholds: {
    low: 0,      // 0 cameras
    medium: 2,   // 1-2 cameras
    high: 5,     // 3-5 cameras
    // extreme: 6+ cameras
  },
} as const;

// ============================================================================
// ROUTE LIMITS
// ============================================================================

export const ROUTE_LIMITS = {
  /** Maximum straight-line distance between origin and destination (meters) */
  maxDistanceMeters: 482803, // ~300 miles

  /** Human-readable version for error messages */
  maxDistanceDisplay: '300 miles',
} as const;

// ============================================================================
// DETOUR LIMITS
// ============================================================================

export const DETOUR_LIMITS = {
  /** Maximum allowed route length increase as percentage (100 = double the distance) */
  maxDetourPercent: 100,

  /** GraphHopper max detour factor (2.5 = 150% longer routes accepted) */
  maxDetourFactor: 2.5,
} as const;

// ============================================================================
// ROAD CLASS PENALTIES
// ============================================================================

/**
 * Penalties for undesirable road types.
 * These prevent routing through parking lots, driveways, and unpaved roads
 * when better alternatives exist.
 *
 * GraphHopper road_class values:
 * motorway, trunk, primary, secondary, tertiary, residential, service, track, etc.
 */
export const ROAD_CLASS_PENALTIES = {
  /** Service roads (parking lots, driveways, alleys) - heavily discouraged */
  service: 0.1,

  /** Unpaved tracks - heavily discouraged */
  track: 0.1,

  /** Unclassified minor roads - lightly discouraged */
  unclassified: 0.7,
} as const;
