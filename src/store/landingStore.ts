import { create } from 'zustand';
import type { ALPRCamera } from '../types';

interface ZipSearchResult {
  lat: number;
  lon: number;
  zipCode: string;
  cityName: string;
  cameraCount: number;
  cameras: ALPRCamera[];
}

interface LandingStore {
  // Zip search state
  searchResult: ZipSearchResult | null;
  isSearching: boolean;
  searchError: string | null;
  
  // Actions
  setSearchResult: (result: ZipSearchResult | null) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSearchError: (error: string | null) => void;
  clearSearch: () => void;
}

export const useLandingStore = create<LandingStore>((set) => ({
  searchResult: null,
  isSearching: false,
  searchError: null,
  
  setSearchResult: (result) => set({ searchResult: result, searchError: null }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setSearchError: (error) => set({ searchError: error }),
  clearSearch: () => set({ searchResult: null, searchError: null }),
}));

