import { create } from 'zustand';
import type { ALPRCamera, CameraFilters } from '../types';
import { 
  loadBundledCameras, 
  retryLoadCameras,
  getUniqueOperators, 
  getUniqueBrands 
} from '../services/cameraDataService';
import { 
  buildSpatialGrid, 
  getCamerasInBoundsFromGrid, 
  type SpatialGrid 
} from '../utils/geo';

// Explicit loading phase for better observability
export type CameraLoadPhase = 'idle' | 'fetching' | 'hydrating' | 'ready' | 'error';

interface CameraState {
  cameras: ALPRCamera[];
  filteredCameras: ALPRCamera[];
  spatialGrid: SpatialGrid | null;
  isLoading: boolean;
  isInitialized: boolean;
  isPreloading: boolean;
  error: string | null;
  filters: CameraFilters;
  availableOperators: string[];
  availableBrands: string[];

  // Explicit loading phase for UI progress
  loadPhase: CameraLoadPhase;
  
  // Data version - increments on every filter/data change for map sync
  dataVersion: number;

  // Internal promise tracking (not exposed to components)
  _initPromise: Promise<void> | null;

  // Actions
  preloadCameras: () => void;
  initializeCameras: () => Promise<void>;
  ensureCamerasLoaded: () => Promise<void>;
  retryCameraLoad: () => Promise<void>;
  setFilters: (filters: Partial<CameraFilters>) => void;
  clearFilters: () => void;
  getCameraById: (osmId: number) => ALPRCamera | undefined;
  getCamerasInBounds: (north: number, south: number, east: number, west: number) => ALPRCamera[];
}

export const useCameraStore = create<CameraState>((set, get) => ({
  cameras: [],
  filteredCameras: [],
  spatialGrid: null,
  isLoading: false,
  isInitialized: false,
  isPreloading: false,
  error: null,
  filters: {
    operators: [],
    brands: [],
    showAll: true,
  },
  availableOperators: [],
  availableBrands: [],
  loadPhase: 'idle',
  dataVersion: 0,
  _initPromise: null,

  // Background preload - starts loading without blocking UI
  // Called from landing page after initial render completes
  preloadCameras: () => {
    const { isInitialized, _initPromise, isPreloading } = get();

    // Skip if already loaded or loading
    if (isInitialized || _initPromise || isPreloading) return;

    set({ isPreloading: true, loadPhase: 'fetching' });

    // Start loading immediately - the 300ms delay in PreloadManager
    // already gives the landing page time to render
    get().initializeCameras().catch(() => {
      // Errors are handled in initializeCameras, just stop preloading state
      set({ isPreloading: false, loadPhase: 'idle' });
    });
  },

  // Load camera data from bundled JSON (fast!)
  // This method now properly handles concurrent calls by returning the same promise
  initializeCameras: async () => {
    const { isInitialized, _initPromise } = get();

    // Already loaded - return immediately
    if (isInitialized) return;

    // Already loading - return the existing promise so callers can await it
    if (_initPromise) return _initPromise;

    // Start loading - create and store the promise
    const loadPromise = (async () => {
      if (import.meta.env.DEV) {
        console.log('[CameraStore] Starting camera initialization...');
      }
      
      set({ isLoading: true, error: null, loadPhase: 'fetching' });

      try {
        // Load from bundled JSON file (much faster than Overpass API!)
        if (import.meta.env.DEV) {
          console.log('[CameraStore] Fetching cameras-us.json...');
        }
        const cameras = await loadBundledCameras();
        
        if (import.meta.env.DEV) {
          console.log(`[CameraStore] Fetch complete: ${cameras.length} cameras. Now hydrating...`);
        }
        
        // Update phase to hydrating while building spatial grid
        set({ loadPhase: 'hydrating' });
        
        const operators = getUniqueOperators(cameras);
        const brands = getUniqueBrands(cameras);

        // Build spatial grid for fast geographic lookups
        const spatialGrid = buildSpatialGrid(cameras);

        if (import.meta.env.DEV) {
          console.log('[CameraStore] Hydration complete. Cameras ready.');
        }

        set((state) => ({
          cameras,
          filteredCameras: cameras,
          spatialGrid,
          availableOperators: operators,
          availableBrands: brands,
          isLoading: false,
          isInitialized: true,
          isPreloading: false,
          loadPhase: 'ready',
          dataVersion: state.dataVersion + 1,
        }));
      } catch (error) {
        console.error('[CameraStore] Failed to load cameras:', error);
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch cameras',
          isLoading: false,
          isPreloading: false,
          loadPhase: 'error',
          _initPromise: null, // Clear promise on error so retry can work
        });
        throw error; // Re-throw so callers know it failed
      }
    })();

    set({ _initPromise: loadPromise });
    return loadPromise;
  },

  // Ensure cameras are loaded - useful for components that need cameras to be ready
  // Returns immediately if already loaded, waits if loading, starts load if not started
  ensureCamerasLoaded: async () => {
    const startTime = performance.now();
    const state = get();

    // Already loaded - return immediately (also clear any stale error state)
    if (state.isInitialized && state.cameras.length > 0) {
      if (import.meta.env.DEV) {
        console.log(`[CameraStore] ensureCamerasLoaded: already loaded (${state.cameras.length} cameras) in ${(performance.now() - startTime).toFixed(0)}ms`);
      }
      // Clear stale error state from previous failed attempts (fixes navigation back)
      if (state.error) {
        set({ error: null, loadPhase: 'ready' });
      }
      return;
    }

    // Already loading - wait for it
    if (state._initPromise) return state._initPromise;

    // If preloading flag is set but promise not yet, wait briefly (race condition)
    if (state.isPreloading && !state._initPromise) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const updatedState = get();
      if (updatedState._initPromise) {
        return updatedState._initPromise;
      }
      if (updatedState.isInitialized && updatedState.cameras.length > 0) {
        return;
      }
    }

    if (import.meta.env.DEV) {
      console.log('[CameraStore] ensureCamerasLoaded: starting fresh initialization');
    }
    return get().initializeCameras();
  },

  // Retry loading cameras after a failure
  retryCameraLoad: async () => {
    if (import.meta.env.DEV) {
      console.log('[CameraStore] Retry requested...');
    }
    
    // Clear any existing promise to allow fresh retry
    set({ isLoading: true, error: null, _initPromise: null, isPreloading: false, loadPhase: 'fetching' });

    const retryPromise = (async () => {
      try {
        const cameras = await retryLoadCameras();
        
        set({ loadPhase: 'hydrating' });
        
        const operators = getUniqueOperators(cameras);
        const brands = getUniqueBrands(cameras);
        const spatialGrid = buildSpatialGrid(cameras);

        if (import.meta.env.DEV) {
          console.log(`[CameraStore] Retry successful: ${cameras.length} cameras`);
        }

        set((state) => ({
          cameras,
          filteredCameras: cameras,
          spatialGrid,
          availableOperators: operators,
          availableBrands: brands,
          isLoading: false,
          isInitialized: true,
          isPreloading: false,
          loadPhase: 'ready',
          dataVersion: state.dataVersion + 1,
        }));
      } catch (error) {
        console.error('[CameraStore] Retry failed:', error);
        set({
          error: error instanceof Error ? error.message : 'Failed to fetch cameras',
          isLoading: false,
          isPreloading: false,
          loadPhase: 'error',
          _initPromise: null,
        });
        throw error;
      }
    })();

    set({ _initPromise: retryPromise });
    return retryPromise;
  },

  setFilters: (newFilters: Partial<CameraFilters>) => {
    const { cameras, filters, dataVersion } = get();
    const updatedFilters = { ...filters, ...newFilters };

    // Apply filters
    let filtered = cameras;

    if (!updatedFilters.showAll) {
      if (updatedFilters.operators.length > 0) {
        filtered = filtered.filter(
          (c) => c.operator && updatedFilters.operators.includes(c.operator)
        );
      }

      if (updatedFilters.brands.length > 0) {
        filtered = filtered.filter(
          (c) => c.brand && updatedFilters.brands.includes(c.brand)
        );
      }
    }

    // Increment dataVersion so map source updates even if React diffing skips it
    // Clear any existing error when filters change
    set({
      filters: updatedFilters,
      filteredCameras: filtered,
      dataVersion: dataVersion + 1,
      error: null,
    });
  },

  clearFilters: () => {
    const { cameras } = get();
    set({
      filters: {
        operators: [],
        brands: [],
        showAll: true,
      },
      filteredCameras: cameras,
    });
  },

  getCameraById: (osmId: number) => {
    return get().cameras.find((c) => c.osmId === osmId);
  },

  // Get cameras within a bounding box using spatial grid (O(1) lookup vs O(n) scan)
  getCamerasInBounds: (north: number, south: number, east: number, west: number) => {
    const { spatialGrid, cameras } = get();
    
    // Use spatial grid for fast lookup if available
    if (spatialGrid) {
      return getCamerasInBoundsFromGrid(spatialGrid, north, south, east, west);
    }
    
    // Fallback to linear scan
    return cameras.filter(
      (c) => c.lat >= south && c.lat <= north && c.lon >= west && c.lon <= east
    );
  },
}));
