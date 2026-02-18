import { create } from 'zustand';
import type {
  Location,
  Route,
  RouteComparison,
  CameraOnRoute,
  CameraAvoidanceConfig,
} from '../types';
import { calculateRoute } from '../services/apiClient';

// Location picking mode - which field is waiting for a map click
export type LocationPickingMode = 'origin' | 'destination' | null;

const DEFAULT_AVOIDANCE_CONFIG: CameraAvoidanceConfig = {
  avoidanceWeight: 0.7,
  maxDetourPercent: 100,
  cameraDistanceMeters: 75,
  costing: 'auto',
  maxIterations: 15,
  useIterativeWaypoints: false,
  bboxBufferDegrees: 0.5,
  useDirectionalZones: true,
};

interface RouteState {
  origin: Location | null;
  destination: Location | null;
  normalRoute: Route | null;
  avoidanceRoute: Route | null;
  comparison: RouteComparison | null;
  normalRouteCameras: CameraOnRoute[];
  avoidanceRouteCameras: CameraOnRoute[];
  isCalculating: boolean;
  error: string | null;
  activeRoute: 'normal' | 'avoidance';

  // Camera-aware routing config
  avoidanceConfig: CameraAvoidanceConfig;

  // Location picking mode - for "choose on map" feature
  pickingLocation: LocationPickingMode;

  // Actions
  setOrigin: (location: Location | null) => void;
  setDestination: (location: Location | null) => void;
  calculateRoutes: () => Promise<void>;
  clearRoutes: () => void;
  setActiveRoute: (type: 'normal' | 'avoidance') => void;
  swapLocations: () => void;
  setAvoidanceWeight: (weight: number) => void;
  setMaxDetour: (percent: number) => void;
  setCameraDistance: (meters: number) => void;
  setUseDirectionalZones: (enabled: boolean) => void;

  // Location picking actions
  startPickingLocation: (mode: 'origin' | 'destination') => void;
  cancelPickingLocation: () => void;
  setPickedLocation: (location: Location) => void;
}

export const useRouteStore = create<RouteState>((set, get) => ({
  origin: null,
  destination: null,
  normalRoute: null,
  avoidanceRoute: null,
  comparison: null,
  normalRouteCameras: [],
  avoidanceRouteCameras: [],
  isCalculating: false,
  error: null,
  activeRoute: 'normal',
  avoidanceConfig: DEFAULT_AVOIDANCE_CONFIG,
  pickingLocation: null,

  setOrigin: (location: Location | null) => {
    set({
      origin: location,
      normalRoute: null,
      avoidanceRoute: null,
      comparison: null,
      error: null,
    });
  },

  setDestination: (location: Location | null) => {
    set({
      destination: location,
      normalRoute: null,
      avoidanceRoute: null,
      comparison: null,
      error: null,
    });
  },

  calculateRoutes: async () => {
    const { origin, destination, avoidanceConfig, isCalculating } = get();

    // Guard against concurrent calculations
    if (isCalculating) {
      return;
    }

    if (!origin || !destination) {
      set({ error: 'Please select both origin and destination' });
      return;
    }

    set({ isCalculating: true, error: null });

    try {
      console.log('=== Starting Camera-Aware Routing (via API) ===');
      console.log(`Avoidance weight: ${avoidanceConfig.avoidanceWeight}`);
      console.log(`Max detour: ${avoidanceConfig.maxDetourPercent}%`);

      const result = await calculateRoute(origin, destination, avoidanceConfig);

      console.log('\n=== Routing Complete ===');
      console.log(`Normal route: ${result.normalRoute.camerasOnRoute.length} cameras`);
      console.log(`Avoidance route: ${result.avoidanceRoute.camerasOnRoute.length} cameras`);
      console.log(`Strategy used: ${result.avoidanceRoute.strategy}`);
      console.log(`Camera reduction: ${result.improvement.camerasAvoided} (${result.improvement.cameraReductionPercent.toFixed(0)}%)`);
      console.log(`Distance increase: ${(result.improvement.distanceIncrease / 1609.34).toFixed(2)} mi (${result.improvement.distanceIncreasePercent.toFixed(1)}%)`);

      // Build comparison for UI compatibility
      const comparison: RouteComparison = {
        distanceIncrease: result.improvement.distanceIncrease,
        distanceIncreasePercent: result.improvement.distanceIncreasePercent,
        durationIncrease: result.improvement.durationIncrease,
        durationIncreasePercent: result.improvement.durationIncreasePercent,
        camerasAvoided: result.improvement.camerasAvoided,
        remainingCameras: result.avoidanceRoute.camerasOnRoute.length,
        normalCameras: result.normalRoute.camerasOnRoute,
        avoidanceCameras: result.avoidanceRoute.camerasOnRoute,
      };

      set({
        normalRoute: result.normalRoute.route,
        avoidanceRoute: result.avoidanceRoute.route,
        normalRouteCameras: result.normalRoute.camerasOnRoute,
        avoidanceRouteCameras: result.avoidanceRoute.camerasOnRoute,
        comparison,
        isCalculating: false,
        // Auto-select avoidance route if it has fewer cameras
        activeRoute: result.normalRoute.camerasOnRoute.length > result.avoidanceRoute.camerasOnRoute.length
          ? 'avoidance'
          : 'normal',
      });
    } catch (error) {
      console.error('Routing failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to calculate route',
        isCalculating: false,
      });
    }
  },

  clearRoutes: () => {
    set({
      normalRoute: null,
      avoidanceRoute: null,
      comparison: null,
      normalRouteCameras: [],
      avoidanceRouteCameras: [],
      error: null,
      activeRoute: 'normal',
    });
  },

  setActiveRoute: (type: 'normal' | 'avoidance') => {
    set({ activeRoute: type });
  },

  swapLocations: () => {
    const { origin, destination } = get();
    set({
      origin: destination,
      destination: origin,
      normalRoute: null,
      avoidanceRoute: null,
      comparison: null,
      error: null,
    });
  },

  setAvoidanceWeight: (weight: number) => {
    const { avoidanceConfig } = get();
    set({
      avoidanceConfig: {
        ...avoidanceConfig,
        avoidanceWeight: Math.max(0, Math.min(1, weight)),
      },
      error: null,
    });
  },

  setMaxDetour: (percent: number) => {
    const { avoidanceConfig } = get();
    set({
      avoidanceConfig: {
        ...avoidanceConfig,
        maxDetourPercent: Math.max(0, Math.min(200, percent)),
      },
      error: null,
    });
  },

  setCameraDistance: (meters: number) => {
    const { avoidanceConfig } = get();
    set({
      avoidanceConfig: {
        ...avoidanceConfig,
        cameraDistanceMeters: Math.max(10, Math.min(150, meters)),
      },
      error: null,
    });
  },

  setUseDirectionalZones: (enabled: boolean) => {
    const { avoidanceConfig } = get();
    set({
      avoidanceConfig: {
        ...avoidanceConfig,
        useDirectionalZones: enabled,
      },
      error: null,
    });
  },

  // Location picking actions
  startPickingLocation: (mode: 'origin' | 'destination') => {
    set({ pickingLocation: mode });
  },

  cancelPickingLocation: () => {
    set({ pickingLocation: null });
  },

  setPickedLocation: (location: Location) => {
    const { pickingLocation } = get();
    if (pickingLocation === 'origin') {
      set({
        origin: location,
        pickingLocation: null,
        normalRoute: null,
        avoidanceRoute: null,
        comparison: null,
        error: null,
      });
    } else if (pickingLocation === 'destination') {
      set({
        destination: location,
        pickingLocation: null,
        normalRoute: null,
        avoidanceRoute: null,
        comparison: null,
        error: null,
      });
    }
  },
}));
