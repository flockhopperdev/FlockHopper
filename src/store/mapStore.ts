import { create } from 'zustand';
import type { MapState, MapBounds } from '../types';

interface FlyToCommand {
  center: [number, number];
  zoom?: number;
  timestamp: number;
}

interface MapStoreState extends MapState {
  // Map interaction state
  isInteracting: boolean;
  selectedCameraId: number | null;
  showCameraLayer: boolean;
  showRouteLayer: boolean;
  
  // FlyTo command for map to consume
  flyToCommand: FlyToCommand | null;
  
  // Actions
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setBounds: (bounds: MapBounds | null) => void;
  setIsInteracting: (isInteracting: boolean) => void;
  setSelectedCamera: (osmId: number | null) => void;
  toggleCameraLayer: () => void;
  toggleRouteLayer: () => void;
  flyTo: (center: [number, number], zoom?: number) => void;
  clearFlyToCommand: () => void;
  fitBounds: (bounds: MapBounds) => void;
}

// Default center: Geographic center of the contiguous US
const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795];
const DEFAULT_ZOOM = 4;

export const useMapStore = create<MapStoreState>((set) => ({
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  bounds: null,
  isInteracting: false,
  selectedCameraId: null,
  showCameraLayer: true,
  showRouteLayer: true,
  flyToCommand: null,

  setCenter: (center: [number, number]) => {
    set({ center });
  },

  setZoom: (zoom: number) => {
    set({ zoom });
  },

  setBounds: (bounds: MapBounds | null) => {
    set({ bounds });
  },

  setIsInteracting: (isInteracting: boolean) => {
    set({ isInteracting });
  },

  setSelectedCamera: (osmId: number | null) => {
    set({ selectedCameraId: osmId });
  },

  toggleCameraLayer: () => {
    set((state) => ({ showCameraLayer: !state.showCameraLayer }));
  },

  toggleRouteLayer: () => {
    set((state) => ({ showRouteLayer: !state.showRouteLayer }));
  },

  flyTo: (center: [number, number], zoom?: number) => {
    set({ 
      flyToCommand: { center, zoom, timestamp: Date.now() },
      center,
      ...(zoom !== undefined && { zoom }),
    });
  },

  clearFlyToCommand: () => {
    set({ flyToCommand: null });
  },

  fitBounds: (bounds: MapBounds) => {
    set({ bounds });
  },
}));

