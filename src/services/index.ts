// Primary data service - uses bundled camera data (fast!)
export {
  loadBundledCameras,
  getCamerasInBounds,
  getUniqueOperators,
  getUniqueBrands,
  clearCameraCache,
} from './cameraDataService';

// Routing services - GraphHopper (primary)
export * from './graphHopperService';
export * from './cameraAwareRouting';

// Geocoding - Photon + LocationIQ based service (preferred)
export { smartSearch, reverseGeocode, toLocation, getResultTypeIcon } from './geocodingService';
export type { GeocodingResult } from './geocodingService';

// ZIP Code lookup - Local bundled data (instant, no API)
export { lookupZipCode, isValidZipCode, preloadZipCodes } from './zipCodeService';
export type { ZipCodeData } from './zipCodeService';

// Export utilities
export * from './gpxService';
