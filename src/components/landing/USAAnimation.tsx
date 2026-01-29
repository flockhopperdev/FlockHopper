import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'

// Continental US bounds with padding
const US_BOUNDS: [[number, number], [number, number]] = [
  [-125, 24], // Southwest
  [-66, 50],  // Northeast
]

const BACKGROUND_COLOR = '#0a0a0f'

// Detect if device is mobile/low-power for optimization decisions
function isMobileOrLowPower(): boolean {
  if (typeof window === 'undefined') return true

  const isSmallScreen = window.innerWidth < 1024
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const hasLowCores = (navigator.hardwareConcurrency || 2) < 6
  const hasLowMemory = (navigator as any).deviceMemory !== undefined && (navigator as any).deviceMemory < 6

  return isSmallScreen || isTouchDevice || hasLowCores || hasLowMemory
}

// Detect if user prefers reduced motion
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function USAAnimation() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const animationStartRef = useRef<number | null>(null)
  const isVisibleRef = useRef<boolean>(true)
  const animationIdRef = useRef<number | null>(null)
  const animateRef = useRef<(() => void) | null>(null)
  const hiddenAtRef = useRef<number | null>(null)
  const totalHiddenTimeRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const isMobile = isMobileOrLowPower()
    const reducedMotion = prefersReducedMotion()

    // Frame rate: 30fps on mobile, 45fps on desktop (smoother but not wasteful)
    const targetFps = isMobile ? 30 : 45
    const frameInterval = 1000 / targetFps

    // Adjust padding based on screen size for optimal fit
    const screenWidth = window.innerWidth
    const boundsPadding = screenWidth >= 2560 ? 20 : screenWidth >= 1920 ? 15 : 5

    // Use type assertion for antialias (valid option but not in types)
    const mapOptions = {
      container: mapContainerRef.current,
      bounds: US_BOUNDS,
      fitBoundsOptions: { padding: boundsPadding },
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': BACKGROUND_COLOR },
          },
        ],
      },
      interactive: false,
      attributionControl: false,
      preserveDrawingBuffer: false,
      fadeDuration: 0,
      antialias: !isMobile, // Disable antialiasing on mobile to reduce GPU load
    } as maplibregl.MapOptions
    const map = new maplibregl.Map(mapOptions)

    mapRef.current = map

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        const m = mapRef.current
        if (!m) return
        m.resize()
        const currentWidth = window.innerWidth
        const dynamicPadding = currentWidth >= 2560 ? 20 : currentWidth >= 1920 ? 15 : 5
        m.fitBounds(US_BOUNDS, { padding: dynamicPadding, duration: 0 })
      }, 100)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(mapContainerRef.current)

    const orientationHandler = () => setTimeout(handleResize, 100)
    window.addEventListener('orientationchange', orientationHandler)
    handleResize()

    map.on('load', () => {
      handleResize()

      map.addSource('mask', {
        type: 'geojson',
        data: '/usa-animation/conus_mask.geojson',
      })

      map.addLayer({
        id: 'mask',
        type: 'fill',
        source: 'mask',
        paint: { 'fill-color': BACKGROUND_COLOR, 'fill-opacity': 0.9 },
      })

      map.addSource('states', {
        type: 'geojson',
        data: '/usa-animation/us-states.geojson',
      })

      map.addLayer({
        id: 'state-borders',
        type: 'line',
        source: 'states',
        paint: { 'line-color': '#2a2a38', 'line-width': 0.5, 'line-opacity': 0.55 },
      })

      map.addSource('us-border', {
        type: 'geojson',
        data: '/usa-animation/us-border-new.geojson',
      })

      map.addLayer({
        id: 'us-border',
        type: 'line',
        source: 'us-border',
        paint: { 'line-color': '#2a2a38', 'line-width': 0.8, 'line-opacity': 0.6 },
      })

      const ATLANTA: [number, number] = [-84.388, 33.749]
      const getDist = (coords: number[]) => {
        const dx = coords[0] - ATLANTA[0]
        const dy = coords[1] - ATLANTA[1]
        return Math.sqrt(dx * dx + dy * dy)
      }

      fetch('/usa-animation/roads.geojson')
        .then((res) => res.json())
        .then((data) => {
          // On mobile, filter to only interstate roads for performance
          if (isMobile) {
            data.features = data.features.filter(
              (f: any) => f.properties.class === 'interstate' || f.properties.class === 'highway'
            )
          }

          let maxDist = 0
          data.features.forEach((f: any) => {
            const coords =
              f.geometry.type === 'MultiLineString'
                ? f.geometry.coordinates[0][0]
                : f.geometry.coordinates[0]
            const d = getDist(coords)
            f.properties.dist_atl = d
            if (d > maxDist) maxDist = d
          })

          map.addSource('roads', { type: 'geojson', data })
          setupLayers(maxDist)
        })

      const setupLayers = (maxRoadDist: number) => {
        // On mobile: only interstate + highway, no local roads
        // On desktop: all road classes
        const roadClasses = isMobile
          ? ['interstate', 'highway'] as const
          : ['interstate', 'highway', 'local'] as const

        // Scale road widths based on screen size
        const screenW = window.innerWidth
        const widthScale = screenW >= 2560 ? 1.8 : screenW >= 1920 ? 1.4 : 1
        const classWidth = {
          interstate: [1.5 * widthScale, 8 * widthScale],
          highway: [1 * widthScale, 6 * widthScale],
          local: [0.6 * widthScale, 4 * widthScale]
        }
        const classOpacity = { interstate: 0.95, highway: 0.8, local: 0.6 }

        roadClasses.forEach((cls) => {
          const baseFilter = ['==', ['get', 'class'], cls]

          map.addLayer({
            id: `${cls}-glow`,
            type: 'line',
            source: 'roads',
            filter: baseFilter as any,
            paint: {
              'line-color': '#b92020',
              'line-width': classWidth[cls][1],
              'line-blur': isMobile ? 8 : 12,
              'line-opacity': 0,
            },
          })

          map.addLayer({
            id: `${cls}-core`,
            type: 'line',
            source: 'roads',
            filter: baseFilter as any,
            paint: {
              'line-color': '#ff3333',
              'line-width': isMobile ? classWidth[cls][0] * 1.3 : classWidth[cls][0],
              'line-opacity': 0,
            },
          })
        })

        // If user prefers reduced motion, show static fully-revealed state
        if (reducedMotion) {
          roadClasses.forEach((cls) => {
            map.setPaintProperty(`${cls}-core`, 'line-opacity', classOpacity[cls] * 0.8)
            map.setPaintProperty(`${cls}-glow`, 'line-opacity', isMobile ? 0.3 : 0.4)
          })
          return // No animation
        }

        const animate = () => {
          if (!mapRef.current) return

          // Stop animation when not visible
          if (!isVisibleRef.current) {
            if (hiddenAtRef.current === null) {
              hiddenAtRef.current = performance.now()
            }
            animationIdRef.current = null
            return
          }

          const now = performance.now()

          // Throttle frame rate
          if (now - lastFrameTimeRef.current < frameInterval) {
            animationIdRef.current = requestAnimationFrame(animate)
            return
          }
          lastFrameTimeRef.current = now

          if (animationStartRef.current === null) {
            animationStartRef.current = now
          }

          const elapsed = now - animationStartRef.current - totalHiddenTimeRef.current

          // Slower pulse on mobile (less frequent GPU updates)
          const pulsePeriodMs = isMobile ? 3000 : 3000
          const tPulse = (elapsed / pulsePeriodMs) % 1
          const sine = Math.sin(tPulse * 2 * Math.PI)
          const pulse = 0.5 + 0.5 * sine

          const glowOpacityBase = isMobile ? (0.25 + pulse * 0.4) : (0.35 + pulse * 0.6)
          const coreOpacityBase = isMobile ? (0.55 + pulse * 0.35) : (0.5 + pulse * 0.7)

          // Expansion animation
          const initialRadius = 0.03
          const animDuration = isMobile ? 8000 : 8000 // Slower on mobile
          const linearProgress = Math.min(elapsed / animDuration, 1.0)
          const exponentialProgress = Math.pow(linearProgress, 2.5)
          const growthRange = (1 - initialRadius) * exponentialProgress
          const currentProgress = initialRadius + growthRange

          const maxDistRoads = maxRoadDist * currentProgress

          roadClasses.forEach((cls) => {
            const fadeSize = isMobile ? 8 : 8
            const visibilityExpr: any = [
              'interpolate',
              ['linear'],
              ['get', 'dist_atl'],
              Math.max(0, maxDistRoads - fadeSize),
              1,
              maxDistRoads,
              0,
            ]

            const baseOpacity = classOpacity[cls]

            map.setPaintProperty(`${cls}-core`, 'line-opacity', [
              '*',
              baseOpacity * coreOpacityBase,
              visibilityExpr,
            ])

            const pulseOpacityGlow = (cls === 'interstate' ? 0.7 : 0.5) * glowOpacityBase
            map.setPaintProperty(`${cls}-glow`, 'line-opacity', [
              '*',
              pulseOpacityGlow,
              visibilityExpr,
            ])
          })

          animationIdRef.current = requestAnimationFrame(animate)
        }

        animateRef.current = animate
        animationIdRef.current = requestAnimationFrame(animate)
      }
    })

    // Pause animation when scrolled out of view
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        const wasVisible = isVisibleRef.current
        const isNowVisible = entries[0]?.isIntersecting ?? false
        isVisibleRef.current = isNowVisible

        if (!wasVisible && isNowVisible) {
          if (hiddenAtRef.current !== null) {
            totalHiddenTimeRef.current += performance.now() - hiddenAtRef.current
            hiddenAtRef.current = null
          }
          if (animationIdRef.current === null && animateRef.current) {
            animationIdRef.current = requestAnimationFrame(animateRef.current)
          }
        }
      },
      { threshold: 0 }
    )
    visibilityObserver.observe(mapContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      window.removeEventListener('orientationchange', orientationHandler)
      if (resizeTimeout) clearTimeout(resizeTimeout)
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      animationStartRef.current = null
      animateRef.current = null
      hiddenAtRef.current = null
      totalHiddenTimeRef.current = 0
    }
  }, [])

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ contain: 'strict', willChange: 'auto' }}
    />
  )
}
