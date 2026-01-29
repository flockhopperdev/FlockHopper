import { useRef, useCallback, useEffect, useState, useMemo, memo, useImperativeHandle, forwardRef } from 'react';
import Map, { 
  Source, 
  Layer, 
  Popup,
  NavigationControl,
  type MapRef,
  type ViewStateChangeEvent,
  type MapLayerMouseEvent
} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { useMapStore, useCameraStore, useRouteStore, useCustomRouteStore } from '../../store';
import { WaypointLayer } from './WaypointLayer';
import { reverseGeocode } from '../../services/geocodingService';
import { DIRECTIONAL_ZONE, CAMERA_DETECTION, ZONE_SAFETY_MULTIPLIERS } from '../../services/routingConfig';
import type { ALPRCamera, Location } from '../../types';

// Expose map ready state to parent components
export interface MapLibreViewHandle {
  isMarkersReady: boolean;
  forceRemount: () => void;
}

// Helper to create a direction cone polygon from a point and direction
// Uses the same parameters as the routing algorithm for consistency
function createDirectionCone(
  lon: number,
  lat: number,
  direction: number,
  // Use routing config values so visualization matches what routing avoids
  lengthMeters: number = CAMERA_DETECTION.routeBufferMeters * ZONE_SAFETY_MULTIPLIERS.block,
  spreadDegrees: number = DIRECTIONAL_ZONE.cameraFovDegrees
): GeoJSON.Feature<GeoJSON.Polygon> {
  const earthRadius = 6371000; // meters
  const latRad = (lat * Math.PI) / 180;
  
  // Convert meters to degrees (approximate)
  const lengthDeg = (lengthMeters / earthRadius) * (180 / Math.PI);
  
  // Calculate the three points of the cone
  const points: [number, number][] = [[lon, lat]]; // Start at camera
  
  // Left edge of cone
  const leftAngle = ((direction - spreadDegrees / 2) * Math.PI) / 180;
  const leftLon = lon + lengthDeg * Math.sin(leftAngle) / Math.cos(latRad);
  const leftLat = lat + lengthDeg * Math.cos(leftAngle);
  points.push([leftLon, leftLat]);
  
  // Create arc for the front of the cone
  const steps = 8;
  for (let i = 1; i < steps; i++) {
    const angle = ((direction - spreadDegrees / 2 + (spreadDegrees * i) / steps) * Math.PI) / 180;
    const arcLon = lon + lengthDeg * Math.sin(angle) / Math.cos(latRad);
    const arcLat = lat + lengthDeg * Math.cos(angle);
    points.push([arcLon, arcLat]);
  }
  
  // Right edge of cone
  const rightAngle = ((direction + spreadDegrees / 2) * Math.PI) / 180;
  const rightLon = lon + lengthDeg * Math.sin(rightAngle) / Math.cos(latRad);
  const rightLat = lat + lengthDeg * Math.cos(rightAngle);
  points.push([rightLon, rightLat]);
  
  // Close the polygon
  points.push([lon, lat]);
  
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [points],
    },
  };
}

// Map style - using OpenStreetMap raster tiles (same as DeFlock)
const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

// Convert cameras to GeoJSON - optimized with pre-allocated array
function camerasToGeoJSON(cameras: ALPRCamera[]): GeoJSON.FeatureCollection {
  // Pre-allocate array for better performance with large camera sets
  const features = new Array(cameras.length);
  for (let i = 0; i < cameras.length; i++) {
    const camera = cameras[i];
    features[i] = {
      type: 'Feature' as const,
      id: camera.osmId,
      geometry: {
        type: 'Point' as const,
        coordinates: [camera.lon, camera.lat],
      },
      properties: {
        osmId: camera.osmId,
        osmType: camera.osmType,
        operator: camera.operator || '',
        brand: camera.brand || '',
        direction: camera.direction ?? null,
        directionCardinal: camera.directionCardinal || '',
        surveillanceZone: camera.surveillanceZone || '',
        mountType: camera.mountType || '',
        ref: camera.ref || '',
        startDate: camera.startDate || '',
        lat: camera.lat,
        lon: camera.lon,
      },
    };
  }
  return { type: 'FeatureCollection', features };
}

// Cluster layer style - smaller, tighter clusters
const clusterLayer: maplibregl.LayerSpecification = {
  id: 'clusters',
  type: 'circle',
  source: 'cameras',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#ef4444', // Red for small clusters
      5,
      '#dc2626', // Darker red for medium
      20,
      '#b91c1c', // Even darker for large
      50,
      '#991b1b', // Darkest for huge
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      14,  // Base size - smaller
      5,
      16,  // 5+ points
      20,
      20,  // 20+ points
      50,
      26,  // 50+ points
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fca5a5',
    'circle-stroke-opacity': 0.5,
  },
};

// Cluster count label
const clusterCountLayer: maplibregl.LayerSpecification = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'cameras',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
    'text-size': 13,
    'text-allow-overlap': true,
  },
  paint: {
    'text-color': '#ffffff',
  },
};

// Unclustered camera point - solid core
const unclusteredPointLayer: maplibregl.LayerSpecification = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'cameras',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#dc2626',
    'circle-radius': 6,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fca5a5',
    'circle-opacity': 1,
  },
};

// Outer glow for unclustered points - "infected" spreading look
const unclusteredGlowLayer: maplibregl.LayerSpecification = {
  id: 'unclustered-glow',
  type: 'circle',
  source: 'cameras',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#ef4444',
    'circle-radius': 18,
    'circle-opacity': 0.3,
    'circle-blur': 0.6,
  },
};

// Direction cone layer style - only show when zoomed past clusters
const directionConeLayer: maplibregl.LayerSpecification = {
  id: 'direction-cones',
  type: 'fill',
  source: 'direction-cones',
  minzoom: 12, // Only show when zoomed in past cluster level
  paint: {
    'fill-color': '#ef4444',
    'fill-opacity': 0.35,
  },
};

// Direction cone outline - only show when zoomed past clusters
const directionConeOutlineLayer: maplibregl.LayerSpecification = {
  id: 'direction-cones-outline',
  type: 'line',
  source: 'direction-cones',
  minzoom: 12, // Only show when zoomed in past cluster level
  paint: {
    'line-color': '#dc2626',
    'line-width': 2,
    'line-opacity': 0.7,
  },
};

interface PopupInfo {
  longitude: number;
  latitude: number;
  camera: ALPRCamera;
}

// Watchdog retry delays (ms) - progressively longer backoffs
const WATCHDOG_DELAYS = [50, 150, 500, 1000];
const MAX_WATCHDOG_RETRIES = WATCHDOG_DELAYS.length;

interface MapLibreViewProps {
  onMarkersReady?: (ready: boolean) => void;
  mapKey?: number;
}

export const MapLibreView = forwardRef<MapLibreViewHandle, MapLibreViewProps>(
  function MapLibreView({ onMarkersReady, mapKey }, ref) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [cursor, setCursor] = useState<string>('');
  const animationRef = useRef<number>();
  const lastFlyToRef = useRef<number>(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [markersReady, setMarkersReady] = useState(false);
  const sourceDataVersion = useRef(0);
  const geojsonDataRef = useRef<GeoJSON.FeatureCollection>({ type: 'FeatureCollection', features: [] });
  const latestDataVersionRef = useRef(0);
  const watchdogRetryCount = useRef(0);
  const [, forceUpdate] = useState(0);
  
  const { center, zoom, showCameraLayer, setCenter, setZoom, setBounds, flyToCommand, clearFlyToCommand } = useMapStore();
  const { filteredCameras, cameras, getCamerasInBounds, dataVersion } = useCameraStore();
  
  // Expose handle to parent
  useImperativeHandle(ref, () => ({
    isMarkersReady: markersReady,
    forceRemount: () => forceUpdate(n => n + 1),
  }), [markersReady]);
  const { origin, destination, normalRoute, avoidanceRoute, activeRoute, pickingLocation, setPickedLocation, cancelPickingLocation } = useRouteStore();
  const { 
    isCustomizing, 
    editMode, 
    waypoints, 
    customRoute, 
    addWaypoint,
    updateWaypoint,
  } = useCustomRouteStore();

  // Handle flyTo commands from store
  useEffect(() => {
    if (!mapRef.current || !flyToCommand) return;
    if (flyToCommand.timestamp <= lastFlyToRef.current) return;
    
    lastFlyToRef.current = flyToCommand.timestamp;
    
    const map = mapRef.current.getMap();
    map.flyTo({
      center: [flyToCommand.center[1], flyToCommand.center[0]], // [lon, lat]
      zoom: flyToCommand.zoom ?? zoom,
      duration: 1500,
      essential: true,
    });
    
    clearFlyToCommand();
  }, [flyToCommand, clearFlyToCommand, zoom]);

  // Update visible camera count based on viewport
  const updateVisibleCameras = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    const bounds = map.getBounds();
    
    // Get visible cameras for bounds update (count is now shown in MapPage header)
    getCamerasInBounds(
      bounds.getNorth(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getWest()
    );
  }, [getCamerasInBounds]);

  // Convert cameras to GeoJSON - memoized to prevent unnecessary recalculations
  const geojsonData = useMemo(
    () => camerasToGeoJSON(showCameraLayer ? filteredCameras : []),
    [showCameraLayer, filteredCameras]
  );
  
  // Keep refs updated with latest data for use in event handlers
  // This ensures the onLoad/idle handlers have access to the most recent data
  useEffect(() => {
    geojsonDataRef.current = geojsonData;
    latestDataVersionRef.current = dataVersion;
  }, [geojsonData, dataVersion]);
  
  // Notify parent when markers are ready
  useEffect(() => {
    onMarkersReady?.(markersReady);
  }, [markersReady, onMarkersReady]);

  // Generate direction cones for cameras with direction data
  const directionConesData = useMemo((): GeoJSON.FeatureCollection => {
    const camerasWithDirection = (showCameraLayer ? filteredCameras : []).filter(
      (c) => c.direction !== undefined && c.direction !== null
    );
    
    if (import.meta.env.DEV) {
      console.log(`Cameras with direction: ${camerasWithDirection.length} / ${filteredCameras.length}`);
    }
    
    return {
      type: 'FeatureCollection',
      features: camerasWithDirection.map((camera) => 
        createDirectionCone(camera.lon, camera.lat, camera.direction!)
      ),
    };
  }, [filteredCameras, showCameraLayer]);

  // Start pulse animation when map loads - video camera "REC" style
  const startPulseAnimation = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }

    let startTime: number | null = null;
    let isCancelled = false;
    const duration = 1800; // 1.8 seconds per pulse cycle - like a steady REC light
    
    const animate = (timestamp: number) => {
      // Check if animation was cancelled
      if (isCancelled) return;
      
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % duration;
      const progress = elapsed / duration;
      
      // Smooth sine wave for breathing glow effect - like a camcorder REC light
      // Goes from dim to bright and back smoothly
      const breathe = (Math.sin(progress * Math.PI * 2) + 1) / 2; // 0 to 1 to 0
      
      // Outer glow: constant size, pulsing opacity
      const outerOpacity = 0.15 + breathe * 0.35; // 0.15 to 0.5
      const outerRadius = 16 + breathe * 4; // slight size pulse 16-20
      
      // Inner glow: tighter, more intense
      const innerOpacity = 0.3 + breathe * 0.45; // 0.3 to 0.75
      const innerRadius = 10 + breathe * 2; // 10-12
      
      // Update paint properties directly on the map (no React re-render!)
      try {
        if (map.getLayer('pulse-ring-outer')) {
          map.setPaintProperty('pulse-ring-outer', 'circle-radius', outerRadius);
          map.setPaintProperty('pulse-ring-outer', 'circle-opacity', outerOpacity);
        }
        if (map.getLayer('pulse-ring-inner')) {
          map.setPaintProperty('pulse-ring-inner', 'circle-radius', innerRadius);
          map.setPaintProperty('pulse-ring-inner', 'circle-opacity', innerOpacity);
        }
      } catch {
        // Layer might not exist yet, ignore
      }
      
      if (!isCancelled) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Small delay to ensure layers are ready
    const timeoutId = setTimeout(() => {
      if (!isCancelled) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }, 100);
    
    // Return cleanup function for the timeout
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, []);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Update visible cameras when camera data changes
  useEffect(() => {
    if (cameras.length > 0) {
      updateVisibleCameras();
    }
  }, [cameras.length, updateVisibleCameras]);

  // Deterministic data pipeline with watchdog
  // Ensures data is applied when map style is ready, with retries and observability
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    const map = mapRef.current.getMap();
    const currentData = geojsonDataRef.current;
    const currentVersion = latestDataVersionRef.current;
    
    // Skip if no data to apply
    if (currentData.features.length === 0) {
      if (import.meta.env.DEV) {
        console.log('[MapLibre] No camera data to apply yet');
      }
      return;
    }
    
    let isCleanedUp = false;
    let watchdogTimeoutId: ReturnType<typeof setTimeout>;
    
    // Function to apply data to source with verification
    const applyDataToSource = (): boolean => {
      if (isCleanedUp) return false;
      
      // Check if style is loaded first
      if (!map.isStyleLoaded()) {
        if (import.meta.env.DEV) {
          console.log('[MapLibre] Waiting for style to load...');
        }
        return false;
      }
      
      const source = map.getSource('cameras') as maplibregl.GeoJSONSource | undefined;
      
      if (!source) {
        if (import.meta.env.DEV) {
          console.log('[MapLibre] Source not ready yet');
        }
        return false;
      }
      
      try {
        source.setData(currentData);
        sourceDataVersion.current = currentVersion;
        
        if (import.meta.env.DEV) {
          console.log(`[MapLibre] ✓ Source data applied: ${currentData.features.length} cameras (v${currentVersion})`);
        }
        
        // Verify layer exists after applying data
        const layer = map.getLayer('unclustered-point');
        if (layer) {
          setMarkersReady(true);
          watchdogRetryCount.current = 0;
          
          if (import.meta.env.DEV) {
            // Count rendered features after a brief delay for clustering
            setTimeout(() => {
              if (isCleanedUp) return;
              try {
                const features = map.querySourceFeatures('cameras');
                console.log(`[MapLibre] Rendered features count: ${features.length}`);
                if (features.length === 0 && currentData.features.length > 0) {
                  console.warn('[MapLibre] ⚠ Zero features rendered despite having camera data');
                }
              } catch { /* ignore query errors */ }
            }, 200);
          }
          return true;
        } else {
          if (import.meta.env.DEV) {
            console.log('[MapLibre] Layer not ready yet, will retry');
          }
          return false;
        }
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn('[MapLibre] Failed to apply source data:', e);
        }
        return false;
      }
    };
    
    // Watchdog: retry with exponential backoff
    const startWatchdog = (retryIndex: number) => {
      if (isCleanedUp || retryIndex >= MAX_WATCHDOG_RETRIES) {
        if (retryIndex >= MAX_WATCHDOG_RETRIES && import.meta.env.DEV) {
          console.warn(`[MapLibre] ⚠ Watchdog exhausted after ${MAX_WATCHDOG_RETRIES} retries`);
          watchdogRetryCount.current = MAX_WATCHDOG_RETRIES;
        }
        return;
      }
      
      watchdogTimeoutId = setTimeout(() => {
        if (isCleanedUp) return;
        
        if (!applyDataToSource()) {
          watchdogRetryCount.current = retryIndex + 1;
          if (import.meta.env.DEV) {
            console.log(`[MapLibre] Watchdog retry ${retryIndex + 1}/${MAX_WATCHDOG_RETRIES} in ${WATCHDOG_DELAYS[retryIndex]}ms`);
          }
          startWatchdog(retryIndex + 1);
        }
      }, WATCHDOG_DELAYS[retryIndex]);
    };
    
    // Handle style ready events
    const handleStyleData = () => {
      if (isCleanedUp) return;
      
      if (map.isStyleLoaded()) {
        if (import.meta.env.DEV) {
          console.log('[MapLibre] Style loaded, applying data...');
        }
        if (!applyDataToSource()) {
          startWatchdog(0);
        }
      }
    };
    
    // Try immediately
    if (applyDataToSource()) {
      return;
    }
    
    // Register for style events
    map.on('styledata', handleStyleData);
    
    // Also listen for source being added
    const handleSourceData = (e: maplibregl.MapSourceDataEvent) => {
      if (isCleanedUp) return;
      if (e.sourceId === 'cameras' && e.isSourceLoaded) {
        if (import.meta.env.DEV) {
          console.log('[MapLibre] Camera source loaded, verifying...');
        }
        applyDataToSource();
      }
    };
    map.on('sourcedata', handleSourceData);
    
    // Start watchdog as fallback
    startWatchdog(0);
    
    return () => {
      isCleanedUp = true;
      if (watchdogTimeoutId) clearTimeout(watchdogTimeoutId);
      map.off('styledata', handleStyleData);
      map.off('sourcedata', handleSourceData);
    };
  }, [mapLoaded, dataVersion, geojsonData]);

  // Handle map move - update center, zoom, and bounds
  const onMove = useCallback((evt: ViewStateChangeEvent) => {
    setCenter([evt.viewState.latitude, evt.viewState.longitude]);
    setZoom(evt.viewState.zoom);
    
    // Update bounds on every move for accurate camera count
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      const bounds = map.getBounds();
      setBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    }
    
    updateVisibleCameras();
  }, [setCenter, setZoom, setBounds, updateVisibleCameras]);

  // Handle map load
  const onLoad = useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      const bounds = map.getBounds();
      setBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
      
      if (import.meta.env.DEV) {
        console.log('[MapLibre] Map loaded, waiting for style...');
      }
      
      // Wait for style to be fully loaded before marking map as loaded
      // This ensures the deterministic pipeline has a ready map
      const checkStyleAndFinish = () => {
        if (map.isStyleLoaded()) {
          if (import.meta.env.DEV) {
            console.log('[MapLibre] Style loaded, map ready');
          }
          
          // Mark map as loaded - enables deterministic source updates
          setMapLoaded(true);
          
          // Start the pulse animation
          startPulseAnimation();
          
          // Initial visible camera count
          updateVisibleCameras();
        } else {
          // Wait for style to load
          map.once('styledata', checkStyleAndFinish);
        }
      };
      
      checkStyleAndFinish();
    }
  }, [setBounds, startPulseAnimation, updateVisibleCameras]);

  // Handle waypoint drag end
  const handleWaypointDragEnd = useCallback((index: number, location: Location) => {
    updateWaypoint(index, location);
  }, [updateWaypoint]);

  // Handle cluster click - zoom in, add waypoint in custom mode, or pick location
  const onClick = useCallback(async (event: MapLayerMouseEvent) => {
    if (!mapRef.current) return;

    // If in location picking mode (for route origin/destination), handle click
    if (pickingLocation) {
      const { lng, lat } = event.lngLat;
      
      // Create location with coordinates first
      let location: Location = {
        lat,
        lon: lng,
        name: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        address: 'Map location',
      };
      
      // Set the location immediately for responsiveness
      setPickedLocation(location);
      
      // Try to reverse geocode for a better name (async, won't block)
      try {
        const reverseResult = await reverseGeocode(lat, lng);
        if (reverseResult) {
          location = {
            lat,
            lon: lng,
            name: reverseResult.name || location.name,
            address: reverseResult.description || location.address,
          };
          // Update with better name - need to call setOrigin/setDestination directly
          // since pickingLocation is already cleared
          const { setOrigin, setDestination } = useRouteStore.getState();
          // Check what was the original picking mode by looking at current state
          // Actually, pickingLocation is cleared now, so we need to track it
          // For now, update both to trigger re-render with better name
          const state = useRouteStore.getState();
          if (state.origin?.lat === lat && state.origin?.lon === lng) {
            setOrigin(location);
          } else if (state.destination?.lat === lat && state.destination?.lon === lng) {
            setDestination(location);
          }
        }
      } catch (error) {
        // Location was already set with coordinates, just log in dev mode
        if (import.meta.env.DEV) {
          console.warn('[MapLibre] Reverse geocoding failed:', error);
        }
      }
      return;
    }

    // If in custom mode and WAYPOINT edit mode (not drag edit mode), add a waypoint on map click
    // In 'edit' mode, we only allow dragging existing markers - no new waypoints on click
    if (isCustomizing && editMode === 'waypoint') {
      const { lng, lat } = event.lngLat;
      
      // Check if we clicked on a feature (camera or cluster) - don't add waypoint in that case
      const feature = event.features?.[0];
      if (feature) {
        // Still allow cluster expansion
        const clusterId = feature.properties?.cluster_id;
        if (clusterId) {
          const map = mapRef.current.getMap();
          const source = map.getSource('cameras') as maplibregl.GeoJSONSource;
          source.getClusterExpansionZoom(clusterId).then((zoomLevel: number) => {
            const geometry = feature.geometry as GeoJSON.Point;
            map.easeTo({
              center: geometry.coordinates as [number, number],
              zoom: zoomLevel,
              duration: 500,
            });
          }).catch((error) => {
            if (import.meta.env.DEV) {
              console.warn('[MapLibre] Cluster expansion failed:', error);
            }
          });
          return;
        }
        // If it's a camera point, show the popup but also add waypoint
      }
      
      // Add waypoint at clicked location - the store will handle intelligent insertion
      addWaypoint({
        lat,
        lon: lng,
        name: `Waypoint ${waypoints.length + 1}`,
      });
      return;
    }
    
    // In edit mode when customizing, don't add waypoints - just allow normal map interaction
    if (isCustomizing && editMode === 'edit') {
      // Only handle cluster expansion, don't add waypoints
      const feature = event.features?.[0];
      if (feature?.properties?.cluster_id) {
        const clusterId = feature.properties.cluster_id;
        const map = mapRef.current.getMap();
        const source = map.getSource('cameras') as maplibregl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((zoomLevel: number) => {
          const geometry = feature.geometry as GeoJSON.Point;
          map.easeTo({
            center: geometry.coordinates as [number, number],
            zoom: zoomLevel,
            duration: 500,
          });
        }).catch((error) => {
          if (import.meta.env.DEV) {
            console.warn('[MapLibre] Cluster expansion failed:', error);
          }
        });
      }
      return;
    }

    const feature = event.features?.[0];
    if (!feature) return;

    const clusterId = feature.properties?.cluster_id;
    
    if (clusterId) {
      // It's a cluster - zoom into it
      const map = mapRef.current.getMap();
      const source = map.getSource('cameras') as maplibregl.GeoJSONSource;
      
      source.getClusterExpansionZoom(clusterId).then((zoomLevel: number) => {
        const geometry = feature.geometry as GeoJSON.Point;
        map.easeTo({
          center: geometry.coordinates as [number, number],
          zoom: zoomLevel,
          duration: 500,
        });
      }).catch((error) => {
        if (import.meta.env.DEV) {
          console.warn('[MapLibre] Cluster expansion failed:', error);
        }
      });
    } else {
      // It's an unclustered point - show popup
      const props = feature.properties;
      if (props) {
        const camera: ALPRCamera = {
          osmId: props.osmId,
          osmType: props.osmType as 'node' | 'way',
          lat: props.lat,
          lon: props.lon,
          operator: props.operator || undefined,
          brand: props.brand || undefined,
          direction: props.direction ?? undefined,
          directionCardinal: props.directionCardinal || undefined,
          surveillanceZone: props.surveillanceZone || undefined,
          mountType: props.mountType || undefined,
          ref: props.ref || undefined,
          startDate: props.startDate || undefined,
        };
        
        setPopupInfo({
          longitude: props.lon,
          latitude: props.lat,
          camera,
        });
      }
    }
  }, [isCustomizing, editMode, addWaypoint, waypoints.length, pickingLocation, setPickedLocation]);

  // Cursor handling - crosshair when adding waypoints or picking location
  const onMouseEnter = useCallback(() => {
    if (pickingLocation) return; // Keep crosshair when picking
    setCursor('pointer');
  }, [pickingLocation]);
  
  const onMouseLeave = useCallback(() => {
    if (pickingLocation) {
      setCursor('crosshair');
    } else if (isCustomizing && editMode === 'waypoint') {
      setCursor('crosshair');
    } else {
      setCursor('');
    }
  }, [isCustomizing, editMode, pickingLocation]);
  
  // Set crosshair cursor when in waypoint mode or picking mode
  useEffect(() => {
    if (pickingLocation) {
      setCursor('crosshair');
    } else if (isCustomizing && editMode === 'waypoint') {
      setCursor('crosshair');
    } else {
      setCursor('');
    }
  }, [isCustomizing, editMode, pickingLocation]);

  // Fit to route bounds when routes change
  useEffect(() => {
    if (!mapRef.current) return;
    
    const route = activeRoute === 'avoidance' ? avoidanceRoute : normalRoute;
    if (route && route.geometry.length > 0) {
      const coords = route.geometry.map(([lat, lon]) => [lon, lat] as [number, number]);
      const bounds = coords.reduce(
        (acc, coord) => ({
          minLng: Math.min(acc.minLng, coord[0]),
          maxLng: Math.max(acc.maxLng, coord[0]),
          minLat: Math.min(acc.minLat, coord[1]),
          maxLat: Math.max(acc.maxLat, coord[1]),
        }),
        { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
      );

      mapRef.current.fitBounds(
        [[bounds.minLng, bounds.minLat], [bounds.maxLng, bounds.maxLat]],
        { padding: 80, duration: 1000 }
      );
    }
  }, [normalRoute, avoidanceRoute, activeRoute]);

  // Build route GeoJSON - memoized since route changes are infrequent
  const routeGeoJSON = useMemo((): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature[] = [];
    
    // Add inactive route first (renders below)
    if (normalRoute && activeRoute === 'avoidance') {
      features.push({
        type: 'Feature',
        properties: { type: 'normal', active: false },
        geometry: {
          type: 'LineString',
          coordinates: normalRoute.geometry.map(([lat, lon]) => [lon, lat]),
        },
      });
    }
    if (avoidanceRoute && activeRoute === 'normal') {
      features.push({
        type: 'Feature',
        properties: { type: 'avoidance', active: false },
        geometry: {
          type: 'LineString',
          coordinates: avoidanceRoute.geometry.map(([lat, lon]) => [lon, lat]),
        },
      });
    }

    // Add active route on top
    if (activeRoute === 'normal' && normalRoute) {
      features.push({
        type: 'Feature',
        properties: { type: 'normal', active: true },
        geometry: {
          type: 'LineString',
          coordinates: normalRoute.geometry.map(([lat, lon]) => [lon, lat]),
        },
      });
    }
    if (activeRoute === 'avoidance' && avoidanceRoute) {
      features.push({
        type: 'Feature',
        properties: { type: 'avoidance', active: true },
        geometry: {
          type: 'LineString',
          coordinates: avoidanceRoute.geometry.map(([lat, lon]) => [lon, lat]),
        },
      });
    }

    // Add origin/destination markers
    // Show markers from route if available, otherwise from store origin/destination
    const route = activeRoute === 'avoidance' ? avoidanceRoute : normalRoute;
    const originLocation = route?.origin || origin;
    const destinationLocation = route?.destination || destination;
    
    if (originLocation) {
      features.push({
        type: 'Feature',
        properties: { markerType: 'origin', name: originLocation.name || 'Start' },
        geometry: {
          type: 'Point',
          coordinates: [originLocation.lon, originLocation.lat],
        },
      });
    }
    if (destinationLocation) {
      features.push({
        type: 'Feature',
        properties: { markerType: 'destination', name: destinationLocation.name || 'End' },
        geometry: {
          type: 'Point',
          coordinates: [destinationLocation.lon, destinationLocation.lat],
        },
      });
    }

    return { type: 'FeatureCollection', features };
  }, [normalRoute, avoidanceRoute, activeRoute, origin, destination]);

  // Memoize popup content to prevent re-renders
  const MemoizedCameraPopupContent = useMemo(() => memo(CameraPopupContent), []);

  // Hide normal routes when customizing to avoid confusion
  const hasRoutes = !isCustomizing && (normalRoute || avoidanceRoute);
  
  // Separate GeoJSON for location markers (shown even without routes)
  const locationMarkersGeoJSON = useMemo((): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature[] = [];
    
    // Only show standalone markers when there's no route yet
    if (!normalRoute && !avoidanceRoute) {
      if (origin) {
        features.push({
          type: 'Feature',
          properties: { markerType: 'origin', name: origin.name || 'Start' },
          geometry: {
            type: 'Point',
            coordinates: [origin.lon, origin.lat],
          },
        });
      }
      if (destination) {
        features.push({
          type: 'Feature',
          properties: { markerType: 'destination', name: destination.name || 'End' },
          geometry: {
            type: 'Point',
            coordinates: [destination.lon, destination.lat],
          },
        });
      }
    }
    
    return { type: 'FeatureCollection', features };
  }, [origin, destination, normalRoute, avoidanceRoute]);

  return (
    <Map
      key={mapKey} // Unique key forces remount when data version changes after errors
      ref={mapRef}
      initialViewState={{
        longitude: center[1],
        latitude: center[0],
        zoom: zoom,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE}
      onMove={onMove}
      onLoad={onLoad}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      cursor={cursor}
      interactiveLayerIds={['clusters', 'unclustered-point']}
      attributionControl={{}}
      // Removed reuseMaps to avoid stale reused instances
    >
      <NavigationControl position="bottom-right" showCompass={false} />

      {/* Direction cones for cameras with direction data */}
      <Source id="direction-cones" type="geojson" data={directionConesData}>
        <Layer {...directionConeLayer} />
        <Layer {...directionConeOutlineLayer} />
      </Source>

      {/* Camera markers with clustering */}
      <Source
        id="cameras"
        type="geojson"
        data={geojsonData}
        cluster={true}
        clusterMaxZoom={11}
        clusterRadius={35}
      >
        {/* Animated pulse ring - outer (animated via MapLibre API) */}
        <Layer
          id="pulse-ring-outer"
          type="circle"
          source="cameras"
          filter={['!', ['has', 'point_count']]}
          paint={{
            'circle-color': '#ef4444',
            'circle-radius': 12,
            'circle-opacity': 0.3,
            'circle-blur': 0.5,
          }}
        />
        {/* Animated pulse ring - inner (animated via MapLibre API) */}
        <Layer
          id="pulse-ring-inner"
          type="circle"
          source="cameras"
          filter={['!', ['has', 'point_count']]}
          paint={{
            'circle-color': '#ef4444',
            'circle-radius': 8,
            'circle-opacity': 0.4,
            'circle-blur': 0.3,
          }}
        />
        <Layer {...unclusteredGlowLayer} />
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...unclusteredPointLayer} />
      </Source>

      {/* Routes */}
      {hasRoutes && (
        <Source id="routes" type="geojson" data={routeGeoJSON}>
          {/* Privacy route outline */}
          <Layer
            id="route-outline-privacy"
            type="line"
            filter={['all', ['==', ['geometry-type'], 'LineString'], ['==', ['get', 'type'], 'avoidance']]}
            paint={{
              'line-color': '#000000',
              'line-width': 9,
              'line-opacity': 0.3,
            }}
            layout={{
              'line-cap': 'round',
              'line-join': 'round',
            }}
          />
          {/* Privacy route - solid blue (rendered first/underneath) */}
          <Layer
            id="route-line-privacy"
            type="line"
            filter={['all', ['==', ['geometry-type'], 'LineString'], ['==', ['get', 'type'], 'avoidance']]}
            paint={{
              'line-color': '#3b82f6', // Blue for privacy route
              'line-width': 6,
              'line-opacity': 0.95,
            }}
            layout={{
              'line-cap': 'round',
              'line-join': 'round',
            }}
          />
          {/* Direct route outline */}
          <Layer
            id="route-outline-direct"
            type="line"
            filter={['all', ['==', ['geometry-type'], 'LineString'], ['==', ['get', 'type'], 'normal']]}
            paint={{
              'line-color': '#000000',
              'line-width': 8,
              'line-opacity': 0.25,
            }}
            layout={{
              'line-cap': 'round',
              'line-join': 'round',
            }}
          />
          {/* Direct route - dashed orange (rendered on top so overlap is visible) */}
          <Layer
            id="route-line-direct"
            type="line"
            filter={['all', ['==', ['geometry-type'], 'LineString'], ['==', ['get', 'type'], 'normal']]}
            paint={{
              'line-color': '#f97316', // Bright orange for direct route
              'line-width': 5,
              'line-opacity': 0.95,
              'line-dasharray': [2, 1.5], // Dashed pattern to show overlap
            }}
            layout={{
              'line-cap': 'round',
              'line-join': 'round',
            }}
          />
          {/* Origin marker */}
          <Layer
            id="route-origin"
            type="circle"
            filter={['==', ['get', 'markerType'], 'origin']}
            paint={{
              'circle-radius': 10,
              'circle-color': '#22c55e',
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
            }}
          />
          {/* Destination marker */}
          <Layer
            id="route-destination"
            type="circle"
            filter={['==', ['get', 'markerType'], 'destination']}
            paint={{
              'circle-radius': 10,
              'circle-color': '#ef4444',
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
            }}
          />
        </Source>
      )}

      {/* Standalone location markers (shown before route is calculated) */}
      {(origin || destination) && !normalRoute && !avoidanceRoute && !isCustomizing && (
        <Source id="location-markers" type="geojson" data={locationMarkersGeoJSON}>
          {/* Origin marker */}
          <Layer
            id="location-origin"
            type="circle"
            filter={['==', ['get', 'markerType'], 'origin']}
            paint={{
              'circle-radius': 12,
              'circle-color': '#22c55e',
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
            }}
          />
          {/* Origin inner dot */}
          <Layer
            id="location-origin-inner"
            type="circle"
            filter={['==', ['get', 'markerType'], 'origin']}
            paint={{
              'circle-radius': 5,
              'circle-color': '#ffffff',
            }}
          />
          {/* Destination marker */}
          <Layer
            id="location-destination"
            type="circle"
            filter={['==', ['get', 'markerType'], 'destination']}
            paint={{
              'circle-radius': 12,
              'circle-color': '#ef4444',
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
            }}
          />
          {/* Destination inner dot */}
          <Layer
            id="location-destination-inner"
            type="circle"
            filter={['==', ['get', 'markerType'], 'destination']}
            paint={{
              'circle-radius': 5,
              'circle-color': '#ffffff',
            }}
          />
        </Source>
      )}

      {/* Custom Route Waypoints Layer */}
      {isCustomizing && (
        <WaypointLayer
          waypoints={waypoints}
          customRouteGeometry={customRoute?.geometry || null}
          isActive={true}
          onWaypointDragEnd={handleWaypointDragEnd}
        />
      )}

      {/* Popup */}
      {popupInfo && (
        <Popup
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          anchor="bottom"
          onClose={() => setPopupInfo(null)}
          closeOnClick={false}
          className="camera-popup-maplibre"
          maxWidth="280px"
        >
          <MemoizedCameraPopupContent camera={popupInfo.camera} />
        </Popup>
      )}

      {/* Camera count is now shown in the header on mobile and CameraStats on desktop */}
      
      {/* Location picking mode indicator */}
      {pickingLocation && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-dark-900/10" />

          {/* Banner - bottom on mobile, top on desktop */}
          <div className="absolute bottom-24 lg:bottom-auto lg:top-4 left-1/2 -translate-x-1/2 pointer-events-auto w-[calc(100%-2rem)] max-w-sm">
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl shadow-xl backdrop-blur-md border ${
              pickingLocation === 'origin'
                ? 'bg-accent-success/95 border-accent-success/40'
                : 'bg-accent-danger/95 border-accent-danger/40'
            }`}>
              {/* Icon */}
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                {pickingLocation === 'origin' ? (
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="8" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                )}
              </div>

              {/* Text */}
              <p className="text-white font-medium text-sm flex-1">
                Tap to set {pickingLocation === 'origin' ? 'start' : 'destination'}
              </p>

              {/* Cancel button */}
              <button
                onClick={() => cancelPickingLocation()}
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 transition-all"
                title="Cancel"
              >
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className={`w-10 h-10 rounded-full border-2 border-dashed animate-pulse ${
              pickingLocation === 'origin' ? 'border-accent-success' : 'border-accent-danger'
            }`} />
          </div>
        </div>
      )}
      
      {/* Custom mode indicator - desktop (positioned below search bar) */}
      {isCustomizing && (
        <div className="absolute top-[72px] left-4 z-50 hidden lg:block">
          <div className="bg-purple-600/90 backdrop-blur-sm rounded-xl border border-purple-400/30 shadow-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
              <div className="text-xs">
                <span className="text-white font-bold text-sm">Custom Route Mode</span>
                <span className="text-purple-200 ml-1.5">Click to add points · Drag to move</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom mode mobile bottom bar */}
      {isCustomizing && (
        <div className="absolute bottom-0 left-0 right-0 z-50 lg:hidden">
          <div className="bg-dark-900/95 backdrop-blur-md border-t border-dark-700/50 px-4 py-4 safe-area-inset-bottom">
            <div className="flex items-center justify-between gap-4">
              {/* Waypoint count */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-400">{waypoints.length}</span>
                </div>
                <span className="text-xs text-dark-400">
                  {waypoints.length === 0 ? 'Tap to add points' : 'waypoints'}
                </span>
              </div>
              
              {/* Instructions */}
              <div className="flex-1 text-center">
                <p className="text-xs text-purple-300">
                  Tap to add points · Drag to move
                </p>
              </div>
              
              {/* Mode toggle */}
              <button
                onClick={() => {
                  const { setEditMode: setMode } = useCustomRouteStore.getState();
                  setMode(editMode === 'waypoint' ? 'edit' : 'waypoint');
                }}
                className="p-2 bg-dark-800 rounded-lg border border-dark-600 touch-manipulation"
              >
                {editMode === 'waypoint' ? (
                  <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Map>
  );
});

// Popup content component - Dark theme
function CameraPopupContent({ camera }: { camera: ALPRCamera }) {
  const osmUrl = `https://www.openstreetmap.org/${camera.osmType}/${camera.osmId}`;

  return (
    <div className="min-w-[220px] p-4">
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-dark-600">
        <div className="w-10 h-10 rounded-xl bg-accent-danger/20 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-accent-danger"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
        </div>
        <div>
          <h3 className="font-display font-semibold text-white text-sm">ALPR Camera</h3>
          <p className="text-xs text-dark-400">ID: {camera.osmId}</p>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {camera.operator && (
          <div className="flex justify-between gap-4">
            <span className="text-dark-400">Operator</span>
            <span className="text-white font-medium truncate max-w-[120px]">{camera.operator}</span>
          </div>
        )}

        {camera.brand && (
          <div className="flex justify-between gap-4">
            <span className="text-dark-400">Brand</span>
            <span className="text-dark-200 truncate max-w-[120px]">{camera.brand}</span>
          </div>
        )}

        {camera.directionCardinal && (
          <div className="flex justify-between gap-4">
            <span className="text-dark-400">Direction</span>
            <span className="text-dark-200">{camera.directionCardinal}</span>
          </div>
        )}

        {camera.surveillanceZone && (
          <div className="flex justify-between gap-4">
            <span className="text-dark-400">Zone</span>
            <span className="text-dark-200 capitalize">{camera.surveillanceZone}</span>
          </div>
        )}

        {camera.mountType && (
          <div className="flex justify-between gap-4">
            <span className="text-dark-400">Mount</span>
            <span className="text-dark-200 capitalize">{camera.mountType.replace('_', ' ')}</span>
          </div>
        )}

        <div className="flex justify-between gap-4">
          <span className="text-dark-400">Coords</span>
          <span className="text-dark-300 font-mono text-[10px]">
            {camera.lat.toFixed(5)}, {camera.lon.toFixed(5)}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-3 border-t border-dark-600">
        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-3 py-2 text-[10px] text-center bg-dark-600 hover:bg-dark-500 text-dark-200 rounded-lg transition-colors font-medium"
        >
          View OSM
        </a>
      </div>
    </div>
  );
}

