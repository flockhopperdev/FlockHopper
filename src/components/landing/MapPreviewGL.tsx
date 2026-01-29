import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import Map, { Source, Layer, NavigationControl, type MapRef, Popup } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import { Link } from 'react-router-dom'
import { useLandingStore, useCameraStore } from '@/store'
import { Camera, Map as MapIcon, Loader2 } from 'lucide-react'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { ALPRCamera } from '@/types'

// 10 miles in meters for the circle radius
const RADIUS_METERS = 10 * 1609.34

// Default center (continental US center)
const DEFAULT_CENTER: [number, number] = [-98.5795, 39.8283] // [lon, lat] for MapLibre
const DEFAULT_ZOOM = 3.5
const SEARCH_ZOOM = 9.5 // Zoom level that fits the 10-mile radius circle in viewport

// Dark map style using CARTO tiles
const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: 'carto-tiles',
      type: 'raster',
      source: 'carto',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
}

// Generate circle polygon for the 10-mile radius
function generateCirclePolygon(
  centerLon: number,
  centerLat: number,
  radiusMeters: number,
  points: number = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const earthRadius = 6371000 // meters
  const coordinates: [number, number][] = []

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI
    const latOffset = (radiusMeters / earthRadius) * (180 / Math.PI) * Math.cos(angle)
    const lonOffset = (radiusMeters / earthRadius) * (180 / Math.PI) * Math.sin(angle) / Math.cos((centerLat * Math.PI) / 180)
    coordinates.push([centerLon + lonOffset, centerLat + latOffset])
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
  }
}

// Convert cameras to GeoJSON - always include all data, control visibility via paint
function camerasToGeoJSON(
  cameras: ALPRCamera[],
  centerLon: number,
  centerLat: number
): GeoJSON.FeatureCollection {
  // Limit to 1000 cameras (WebGL handles this easily)
  const limitedCameras = cameras.slice(0, 1000)

  return {
    type: 'FeatureCollection',
    features: limitedCameras.map((camera) => {
      // Calculate distance from center for staggered animation
      const dx = camera.lon - centerLon
      const dy = camera.lat - centerLat
      const distance = Math.sqrt(dx * dx + dy * dy)
      // Normalize distance to 0-1 range for animation (max ~0.15 degrees at 10 miles)
      const normalizedDistance = Math.min(distance / 0.2, 1)

      return {
        type: 'Feature' as const,
        id: camera.osmId,
        geometry: {
          type: 'Point' as const,
          coordinates: [camera.lon, camera.lat],
        },
        properties: {
          osmId: camera.osmId,
          operator: camera.operator || '',
          brand: camera.brand || '',
          normalizedDistance,
          label: camera.operator || camera.brand || 'ALPR Camera',
        },
      }
    }),
  }
}

// Empty GeoJSON for initial state
const EMPTY_GEOJSON: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }

interface HoveredCamera {
  longitude: number
  latitude: number
  label: string
}

export function MapPreviewGL() {
  const { searchResult, isSearching } = useLandingStore()
  const { loadPhase } = useCameraStore()
  const mapRef = useRef<MapRef>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isFlying, setIsFlying] = useState(false)
  const [revealProgress, setRevealProgress] = useState(0) // 0-1 for animation
  const [hoveredCamera, setHoveredCamera] = useState<HoveredCamera | null>(null)
  const [isMapActive, setIsMapActive] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const currentSearchRef = useRef<string | null>(null)

  // Generate radius circle GeoJSON - always have data ready
  const radiusCircleData = useMemo((): GeoJSON.FeatureCollection => {
    if (!searchResult) return EMPTY_GEOJSON
    return {
      type: 'FeatureCollection',
      features: [generateCirclePolygon(searchResult.lon, searchResult.lat, RADIUS_METERS)],
    }
  }, [searchResult])

  // Generate camera GeoJSON - always have data ready, control visibility via opacity
  const cameraData = useMemo((): GeoJSON.FeatureCollection => {
    if (!searchResult || searchResult.cameras.length === 0) return EMPTY_GEOJSON
    return camerasToGeoJSON(searchResult.cameras, searchResult.lon, searchResult.lat)
  }, [searchResult])

  // Handle map load
  const handleMapLoad = useCallback(() => {
    setMapLoaded(true)
  }, [])

  // Track if we've started reveal for this search
  const hasRevealedRef = useRef<string | null>(null)

  // FlyTo when search result location changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    const map = mapRef.current.getMap()
    const newZip = searchResult?.zipCode ?? null

    // Skip if same search location
    if (newZip === currentSearchRef.current) return
    currentSearchRef.current = newZip

    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = undefined
    }

    // Reset reveal tracking for new search
    hasRevealedRef.current = null

    if (searchResult) {
      // Reset reveal progress for new search
      setRevealProgress(0)
      setIsFlying(true)

      // Listen for fly animation to complete
      const handleMoveEnd = () => {
        map.off('moveend', handleMoveEnd)
        setIsFlying(false)
      }

      map.on('moveend', handleMoveEnd)

      // Start flying
      map.flyTo({
        center: [searchResult.lon, searchResult.lat],
        zoom: SEARCH_ZOOM,
        duration: 1500,
        essential: true,
      })

      return () => {
        map.off('moveend', handleMoveEnd)
      }
    } else {
      // Reset to default view
      setRevealProgress(0)
      map.flyTo({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        duration: 1000,
        essential: true,
      })
    }
  }, [searchResult?.zipCode, searchResult?.lat, searchResult?.lon, mapLoaded])

  // Start reveal animation when cameras become available and flying is complete
  useEffect(() => {
    // Don't start reveal if still flying or no search result
    if (isFlying || !searchResult) return

    // Don't re-reveal if already revealed for this search
    if (hasRevealedRef.current === searchResult.zipCode) return

    // Don't reveal if no cameras yet (still loading)
    if (searchResult.cameras.length === 0) return

    // Mark as revealed and start animation
    hasRevealedRef.current = searchResult.zipCode

    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    const startTime = performance.now()
    const duration = 800 // ms for full reveal

    const animate = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      setRevealProgress(eased)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isFlying, searchResult])

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Calculate layer opacities based on reveal progress
  const showElements = searchResult && !isFlying
  const radiusOpacity = showElements ? Math.min(revealProgress * 2, 1) : 0 // Fade in first half
  const cameraOpacity = showElements ? Math.max(0, (revealProgress - 0.2) * 1.25) : 0 // Start at 20%, full at 100%

  // Handle camera hover
  const handleMouseMove = useCallback((event: maplibregl.MapLayerMouseEvent) => {
    if (event.features && event.features.length > 0) {
      const feature = event.features[0]
      setHoveredCamera({
        longitude: (feature.geometry as GeoJSON.Point).coordinates[0],
        latitude: (feature.geometry as GeoJSON.Point).coordinates[1],
        label: feature.properties?.label || 'ALPR Camera',
      })
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredCamera(null)
  }, [])

  // Deactivate map when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mapContainerRef.current && !mapContainerRef.current.contains(e.target as Node)) {
        setIsMapActive(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleMapClick = useCallback(() => {
    setIsMapActive(true)
  }, [])

  // Compute staggered opacity expression for ripple effect
  const cameraPointOpacity = useMemo(() => {
    if (cameraOpacity <= 0) return 0
    // Ripple: cameras closer to center appear first
    return [
      'interpolate',
      ['linear'],
      ['get', 'normalizedDistance'],
      0, cameraOpacity, // Center cameras at full current opacity
      0.5, cameraOpacity * 0.7, // Mid-distance at 70%
      1, cameraOpacity * 0.4, // Edge cameras at 40%
    ] as maplibregl.ExpressionSpecification
  }, [cameraOpacity])

  const cameraGlowOpacity = useMemo(() => {
    if (cameraOpacity <= 0) return 0
    return [
      'interpolate',
      ['linear'],
      ['get', 'normalizedDistance'],
      0, cameraOpacity * 0.5,
      0.5, cameraOpacity * 0.35,
      1, cameraOpacity * 0.2,
    ] as maplibregl.ExpressionSpecification
  }, [cameraOpacity])

  return (
    <div className="max-w-5xl mx-auto">
      <div
        ref={mapContainerRef}
        className={`relative w-full h-[360px] sm:h-[440px] lg:h-[500px] rounded-lg border bg-dark-800 overflow-hidden transition-colors duration-200 ${
          isMapActive ? 'border-red-600/50 ring-1 ring-red-600/20' : 'border-dark-600'
        }`}
        onClick={handleMapClick}
      >
        {/* Click to interact hint */}
        {!isMapActive && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[10] pointer-events-none">
            <div className="px-3 py-1.5 rounded-full bg-dark-800/90 border border-dark-600 text-xs text-dark-300 backdrop-blur-sm">
              Click map to enable scroll zoom
            </div>
          </div>
        )}

        {/* MapLibre GL Map */}
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: DEFAULT_CENTER[0],
            latitude: DEFAULT_CENTER[1],
            zoom: DEFAULT_ZOOM,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAP_STYLE}
          onLoad={handleMapLoad}
          scrollZoom={isMapActive}
          interactiveLayerIds={cameraOpacity > 0.5 ? ['camera-points'] : []}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          cursor={hoveredCamera ? 'pointer' : 'grab'}
          attributionControl={{ compact: true, customAttribution: '' }}
        >
          {/* Radius circle - always rendered, opacity controlled */}
          <Source id="radius-circle" type="geojson" data={radiusCircleData}>
            <Layer
              id="radius-circle-fill"
              type="fill"
              paint={{
                'fill-color': '#dc2626',
                'fill-opacity': radiusOpacity * 0.08,
              }}
            />
            <Layer
              id="radius-circle-stroke"
              type="line"
              paint={{
                'line-color': '#dc2626',
                'line-width': 2,
                'line-dasharray': [4, 2],
                'line-opacity': radiusOpacity,
              }}
            />
          </Source>

          {/* Camera markers - always rendered, opacity controlled for animation */}
          <Source id="cameras" type="geojson" data={cameraData}>
            {/* Outer glow layer */}
            <Layer
              id="camera-glow"
              type="circle"
              paint={{
                'circle-color': '#ef4444',
                'circle-radius': 14,
                'circle-opacity': cameraGlowOpacity,
                'circle-blur': 0.6,
              }}
            />
            {/* Core point layer */}
            <Layer
              id="camera-points"
              type="circle"
              paint={{
                'circle-color': '#dc2626',
                'circle-radius': 5,
                'circle-stroke-width': 1.5,
                'circle-stroke-color': '#fca5a5',
                'circle-opacity': cameraPointOpacity,
              }}
            />
          </Source>

          {/* Hover popup */}
          {hoveredCamera && (
            <Popup
              longitude={hoveredCamera.longitude}
              latitude={hoveredCamera.latitude}
              closeButton={false}
              closeOnClick={false}
              anchor="bottom"
              offset={12}
              className="camera-popup"
            >
              <div className="text-xs font-medium px-1 text-dark-800">
                {hoveredCamera.label}
              </div>
            </Popup>
          )}

          <NavigationControl position="top-right" showCompass={false} />
        </Map>

        {/* Loading overlay while searching */}
        {isSearching && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-dark-900/40 backdrop-blur-[2px] z-[5]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              <p className="text-sm text-dark-300">
                {loadPhase === 'fetching' ? 'Loading camera data...' :
                 loadPhase === 'hydrating' ? 'Processing cameras...' :
                 'Finding cameras...'}
              </p>
            </div>
          </div>
        )}

        {/* Overlay when no search */}
        {!searchResult && !isSearching && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-dark-900/60 backdrop-blur-sm">
            <div className="text-center space-y-4 px-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-dark-800 border border-red-600/30 flex items-center justify-center">
                <Camera className="w-8 h-8 text-red-600/60" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-dark-200">Enter your zip code above</p>
                <p className="text-sm text-dark-400">
                  See all ALPR cameras within 10 miles of your location
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Explore Full Map button */}
        <div className="absolute top-4 left-4 z-[10]">
          <Link
            to="/map?mode=explore"
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white font-medium text-sm flex items-center gap-2 shadow-lg"
          >
            <MapIcon className="w-4 h-4" />
            Explore Full Map
          </Link>
        </div>

        {/* Legend */}
        {searchResult && (
          <div className="absolute bottom-4 left-4 z-[10] px-3 py-2 rounded-lg bg-dark-900/90 border border-dark-600 backdrop-blur-sm">
            <div className="flex items-center gap-4 text-xs text-dark-300">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <span>ALPR Camera</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 border-t-2 border-dashed border-red-600" />
                <span>10-mile radius</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
