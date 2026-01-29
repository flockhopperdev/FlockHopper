import type { ALPRCamera, CameraOnRoute } from '../types';

const EARTH_RADIUS_METERS = 6371000;

// ============================================================================
// ANGLE UTILITIES
// ============================================================================

/**
 * Normalize an angle to the range [0, 360)
 */
export function normalizeAngle(degrees: number): number {
  const mod = degrees % 360;
  return mod < 0 ? mod + 360 : mod;
}

// ============================================================================
// GEOMETRY UTILITIES
// ============================================================================

/**
 * Project a point at a given distance and bearing from a start point.
 * Alias for destinationPoint for clearer API naming.
 * @param coords - [lat, lon] of origin point
 * @param distanceMeters - distance to project
 * @param bearingDegrees - bearing in degrees (0=North, 90=East)
 * @returns [lat, lon] of projected point
 */
export function offsetPoint(
  coords: [number, number],
  distanceMeters: number,
  bearingDegrees: number
): [number, number] {
  return destinationPoint(coords[0], coords[1], distanceMeters, bearingDegrees);
}

/**
 * Generate a directional cone (wedge-shaped) polygon for camera avoidance zones.
 * The cone opens in the direction the camera is facing, with a small back-buffer
 * behind the camera to block roads at the camera position itself.
 *
 * @param center - [lon, lat] of camera location (GeoJSON format)
 * @param directionDegrees - camera facing direction (0=North, 90=East, etc.)
 * @param fovDegrees - field of view angle (total cone width)
 * @param rangeMeters - how far the cone extends in front
 * @param backBufferMeters - small buffer behind camera (default 15m)
 * @param arcSegments - number of segments for the front arc (default 5)
 * @returns GeoJSON-compatible coordinate array [[lon, lat], ...]
 */
export function generateDirectionalCone(
  center: [number, number],
  directionDegrees: number,
  fovDegrees: number,
  rangeMeters: number,
  backBufferMeters: number = 15,
  arcSegments: number = 5
): number[][] {
  const [lon, lat] = center;
  const coords: number[][] = [];

  // Normalize direction
  const direction = normalizeAngle(directionDegrees);
  const halfFov = fovDegrees / 2;

  // Calculate the starting and ending angles of the cone
  const leftAngle = normalizeAngle(direction - halfFov);
  const rightAngle = normalizeAngle(direction + halfFov);

  // Start with the back buffer point (behind the camera)
  const backBearing = normalizeAngle(direction + 180);
  const backPoint = destinationPoint(lat, lon, backBufferMeters, backBearing);
  coords.push([backPoint[1], backPoint[0]]); // Convert [lat, lon] to [lon, lat]

  // Add left edge of cone (from camera position)
  const leftPoint = destinationPoint(lat, lon, rangeMeters, leftAngle);
  coords.push([leftPoint[1], leftPoint[0]]);

  // Add arc points along the front of the cone
  for (let i = 1; i < arcSegments; i++) {
    const t = i / arcSegments;
    // Interpolate angle from left to right
    let angle: number;
    if (rightAngle >= leftAngle) {
      angle = leftAngle + t * (rightAngle - leftAngle);
    } else {
      // Handle wrap-around (e.g., left=350, right=10)
      const span = (360 - leftAngle) + rightAngle;
      angle = normalizeAngle(leftAngle + t * span);
    }
    const arcPoint = destinationPoint(lat, lon, rangeMeters, angle);
    coords.push([arcPoint[1], arcPoint[0]]);
  }

  // Add right edge of cone
  const rightPoint = destinationPoint(lat, lon, rangeMeters, rightAngle);
  coords.push([rightPoint[1], rightPoint[0]]);

  // Close the polygon by returning to back buffer point
  coords.push([backPoint[1], backPoint[0]]);

  return coords;
}

/**
 * Create circular polygon around a point
 * Used for camera avoidance zones in GraphHopper routing
 * @returns GeoJSON coordinates: [[lon, lat], ...]
 */
export function createCircle(
  lat: number,
  lon: number,
  radiusMeters: number,
  segments: number = 8
): number[][] {
  const coords: number[][] = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const dLat = (radiusMeters / EARTH_RADIUS_METERS) * Math.cos(angle);
    const dLon = (radiusMeters / (EARTH_RADIUS_METERS * Math.cos(toRadians(lat)))) * Math.sin(angle);

    coords.push([
      lon + dLon * (180 / Math.PI),
      lat + dLat * (180 / Math.PI),
    ]);
  }

  return coords;
}

// ============================================================================
// SPATIAL GRID INDEX - Fast camera lookups by geographic area
// ============================================================================

/**
 * Simple spatial grid for fast camera lookups.
 * Divides the US into a grid of cells for O(1) lookups instead of O(n) filtering.
 * Grid size of 0.5 degrees ≈ 55km at equator, ~35km at US latitudes
 */
const GRID_SIZE = 0.5; // degrees

export interface SpatialGrid {
  cells: Map<string, ALPRCamera[]>;
  gridSize: number;
}

let cachedSpatialGrid: SpatialGrid | null = null;

function getCellKey(lat: number, lon: number): string {
  const gridLat = Math.floor(lat / GRID_SIZE);
  const gridLon = Math.floor(lon / GRID_SIZE);
  return `${gridLat},${gridLon}`;
}

/**
 * Build a spatial grid from cameras for fast lookups
 */
export function buildSpatialGrid(cameras: ALPRCamera[]): SpatialGrid {
  if (cachedSpatialGrid && cachedSpatialGrid.cells.size > 0) {
    return cachedSpatialGrid;
  }

  const cells = new Map<string, ALPRCamera[]>();
  
  for (const camera of cameras) {
    const key = getCellKey(camera.lat, camera.lon);
    const existing = cells.get(key);
    if (existing) {
      existing.push(camera);
    } else {
      cells.set(key, [camera]);
    }
  }

  cachedSpatialGrid = { cells, gridSize: GRID_SIZE };
  return cachedSpatialGrid;
}

/**
 * Get cameras in a bounding box using spatial grid (much faster than linear scan)
 */
export function getCamerasInBoundsFromGrid(
  grid: SpatialGrid,
  north: number,
  south: number,
  east: number,
  west: number
): ALPRCamera[] {
  const result: ALPRCamera[] = [];
  
  // Calculate grid cells that overlap with bounds
  const minGridLat = Math.floor(south / GRID_SIZE);
  const maxGridLat = Math.floor(north / GRID_SIZE);
  const minGridLon = Math.floor(west / GRID_SIZE);
  const maxGridLon = Math.floor(east / GRID_SIZE);
  
  for (let gridLat = minGridLat; gridLat <= maxGridLat; gridLat++) {
    for (let gridLon = minGridLon; gridLon <= maxGridLon; gridLon++) {
      const key = `${gridLat},${gridLon}`;
      const cellCameras = grid.cells.get(key);
      if (cellCameras) {
        // Filter cameras within cell to those actually in bounds
        for (const camera of cellCameras) {
          if (camera.lat >= south && camera.lat <= north && 
              camera.lon >= west && camera.lon <= east) {
            result.push(camera);
          }
        }
      }
    }
  }
  
  return result;
}

/**
 * Clear cached spatial grid (for testing or when data changes)
 */
export function clearSpatialGridCache(): void {
  cachedSpatialGrid = null;
}

/**
 * Calculate the Haversine distance between two points in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculate bearing from point 1 to point 2 in degrees (0-360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = toRadians(lon2 - lon1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let bearing = toDegrees(Math.atan2(y, x));
  bearing = (bearing + 360) % 360;

  return bearing;
}

/**
 * Find the nearest point on a line segment to a given point
 */
export function nearestPointOnSegment(
  point: [number, number],
  segmentStart: [number, number],
  segmentEnd: [number, number]
): { distance: number; point: [number, number] } {
  const [px, py] = point;
  const [x1, y1] = segmentStart;
  const [x2, y2] = segmentEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    // Segment is a point
    const dist = haversineDistance(px, py, x1, y1);
    return { distance: dist, point: [x1, y1] };
  }

  // Calculate projection
  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy))
  );

  const nearestLat = x1 + t * dx;
  const nearestLon = y1 + t * dy;
  const distance = haversineDistance(px, py, nearestLat, nearestLon);

  return { distance, point: [nearestLat, nearestLon] };
}

/**
 * Find cameras that are within a buffer distance of the route
 * 
 * @param cameras - All cameras to check
 * @param routePoints - The route geometry
 * @param bufferMeters - Distance threshold for considering a camera "on route"
 * @param directionalOnly - If true, only include cameras that are facing the route.
 *                          This should match whether directional zones are being used
 *                          for avoidance, so the count reflects actual exposure.
 */
export function findCamerasOnRoute(
  cameras: ALPRCamera[],
  routePoints: [number, number][],
  bufferMeters: number = 50,
  directionalOnly: boolean = false
): CameraOnRoute[] {
  const results: CameraOnRoute[] = [];

  for (const camera of cameras) {
    let minDistance = Infinity;
    let nearestPoint: [number, number] = [0, 0];

    // Find nearest point on route
    for (let i = 0; i < routePoints.length - 1; i++) {
      const { distance, point } = nearestPointOnSegment(
        [camera.lat, camera.lon],
        routePoints[i],
        routePoints[i + 1]
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    }

    // Check if within buffer
    if (minDistance <= bufferMeters) {
      const facingRoute = isCameraFacingRoute(camera, nearestPoint);

      // When directionalOnly is true, skip cameras that are not facing the route
      // (i.e., cameras the route passes "behind")
      if (directionalOnly && !facingRoute) {
        continue;
      }

      results.push({
        camera,
        distanceFromRoute: minDistance,
        nearestRoutePoint: nearestPoint,
        isFacingRoute: facingRoute,
      });
    }
  }

  return results.sort((a, b) => a.distanceFromRoute - b.distanceFromRoute);
}

/**
 * Check if a camera is facing toward the route
 * Returns true if no direction data (assume worst case)
 */
function isCameraFacingRoute(
  camera: ALPRCamera,
  nearestPoint: [number, number]
): boolean {
  // No direction data = assume it could be facing the route
  if (!camera.direction) return true;

  // Calculate bearing from camera to nearest point on route
  const cameraToRoute = calculateBearing(
    camera.lat,
    camera.lon,
    nearestPoint[0],
    nearestPoint[1]
  );

  // Check if camera direction is within 90 degrees of facing the route
  const angleDiff = Math.abs(camera.direction - cameraToRoute);
  const normalizedDiff = angleDiff > 180 ? 360 - angleDiff : angleDiff;

  return normalizedDiff < 90;
}

/**
 * Parse cardinal direction to degrees
 * Handles semicolon-separated multiple directions (e.g., "185;70") by using the first value
 */
export function parseDirection(direction: string): number | undefined {
  const cardinalMap: Record<string, number> = {
    N: 0,
    NNE: 22.5,
    NE: 45,
    ENE: 67.5,
    E: 90,
    ESE: 112.5,
    SE: 135,
    SSE: 157.5,
    S: 180,
    SSW: 202.5,
    SW: 225,
    WSW: 247.5,
    W: 270,
    WNW: 292.5,
    NW: 315,
    NNW: 337.5,
  };

  // Handle semicolon-separated multiple directions (use first one)
  const firstDirection = direction.split(';')[0].trim();
  const upper = firstDirection.toUpperCase();

  // Try cardinal direction first
  if (cardinalMap[upper] !== undefined) {
    return cardinalMap[upper];
  }

  // Try parsing as number
  const num = parseFloat(firstDirection);
  if (!isNaN(num) && num >= 0 && num < 360) {
    return num;
  }

  return undefined;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate a point at a given distance and bearing from a start point
 */
export function destinationPoint(
  lat: number,
  lon: number,
  distanceMeters: number,
  bearingDegrees: number
): [number, number] {
  const d = distanceMeters / EARTH_RADIUS_METERS;
  const brng = toRadians(bearingDegrees);
  const lat1 = toRadians(lat);
  const lon1 = toRadians(lon);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );

  return [toDegrees(lat2), toDegrees(lon2)];
}

/**
 * Calculate an offset waypoint perpendicular to the route at a camera location
 * This can be used to force routing around a camera
 */
export function calculateAvoidanceWaypoint(
  cameraLat: number,
  cameraLon: number,
  routePointBefore: [number, number],
  routePointAfter: [number, number],
  offsetMeters: number = 200
): [number, number] {
  // Calculate the bearing of the route at this point
  const routeBearing = calculateBearing(
    routePointBefore[0],
    routePointBefore[1],
    routePointAfter[0],
    routePointAfter[1]
  );

  // Calculate perpendicular bearing (90 degrees offset)
  // We'll try right side first, could also try left
  const perpendicularBearing = (routeBearing + 90) % 360;

  // Calculate the offset point
  return destinationPoint(cameraLat, cameraLon, offsetMeters, perpendicularBearing);
}

/**
 * Format meters to human-readable distance
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
}

/**
 * Format seconds to human-readable duration
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

