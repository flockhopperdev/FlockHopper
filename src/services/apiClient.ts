import type {
  Location,
  Route,
  CameraOnRoute,
  CameraAvoidanceConfig,
  CameraRoutingResult,
} from '../types';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3001';

interface ApiErrorResponse {
  ok: false;
  error: string;
  detail?: string;
}

interface RouteApiResponse {
  ok: true;
  result: CameraRoutingResult;
}

interface CustomRouteApiResponse {
  ok: true;
  result: {
    route: Route;
    camerasOnRoute: CameraOnRoute[];
  };
}

/**
 * Hydrate date strings from JSON into Date objects
 */
function hydrateRoute(route: Route): Route {
  return {
    ...route,
    timestamp: new Date(route.timestamp),
  };
}

function hydrateResult(result: CameraRoutingResult): CameraRoutingResult {
  return {
    ...result,
    normalRoute: {
      ...result.normalRoute,
      route: hydrateRoute(result.normalRoute.route),
    },
    avoidanceRoute: {
      ...result.avoidanceRoute,
      route: hydrateRoute(result.avoidanceRoute.route),
    },
  };
}

async function apiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_ENDPOINT}/api/v1${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!data.ok) {
    const err = data as ApiErrorResponse;
    throw new Error(err.detail || err.error || 'API request failed');
  }

  return data as T;
}

/**
 * Calculate standard route (normal + avoidance) via server API
 */
export async function calculateRoute(
  origin: Location,
  destination: Location,
  config: Partial<CameraAvoidanceConfig> = {}
): Promise<CameraRoutingResult> {
  const response = await apiPost<RouteApiResponse>('/route', {
    origin: { lat: origin.lat, lon: origin.lon },
    destination: { lat: destination.lat, lon: destination.lon },
    format: 'full',
    ...config,
  });

  return hydrateResult(response.result);
}

/**
 * Calculate custom route with waypoints via server API
 */
export async function calculateCustomRoute(
  origin: Location,
  destination: Location,
  waypoints: Location[],
  config: Partial<CameraAvoidanceConfig> = {}
): Promise<{ route: Route; camerasOnRoute: CameraOnRoute[] }> {
  const response = await apiPost<CustomRouteApiResponse>('/route/custom', {
    origin: { lat: origin.lat, lon: origin.lon },
    destination: { lat: destination.lat, lon: destination.lon },
    waypoints: waypoints.map(wp => ({ lat: wp.lat, lon: wp.lon, name: wp.name })),
    ...config,
  });

  return {
    route: hydrateRoute(response.result.route),
    camerasOnRoute: response.result.camerasOnRoute,
  };
}
