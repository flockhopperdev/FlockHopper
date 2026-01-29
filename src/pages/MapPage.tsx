import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapLibreView, MapSearch, CameraStats, MapLoadingScreen, type MapLibreViewHandle } from '@/components/map';
import { RoutePanel } from '@/components/panels';
import { Seo } from '@/components/common';
import { useCameraStore, useMapStore } from '@/store';
import { Home, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MapPage() {
  const { 
    ensureCamerasLoaded, 
    retryCameraLoad, 
    isLoading, 
    isInitialized,
    cameras,
    error, 
    getCamerasInBounds,
    loadPhase,
    dataVersion,
  } = useCameraStore();
  const { bounds } = useMapStore();
  
  // Track map markers ready state
  const [markersReady, setMarkersReady] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [watchdogWarning, setWatchdogWarning] = useState(false);
  const mapRef = useRef<MapLibreViewHandle>(null);
  const watchdogTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Get cameras in view for mobile header display
  const viewCameraCount = bounds
    ? getCamerasInBounds(bounds.north, bounds.south, bounds.east, bounds.west).length
    : 0;

  // Load cameras on mount - immediately, not waiting for idle
  // Also resets UI state in case of stale state from previous navigation
  useEffect(() => {
    const mountTime = performance.now();
    if (import.meta.env.DEV) {
      console.log('[MapPage] Component mounted, starting camera load...');
    }

    // Reset UI state on mount (handles navigation back scenarios)
    setMarkersReady(false);
    setWatchdogWarning(false);

    ensureCamerasLoaded()
      .then(() => {
        if (import.meta.env.DEV) {
          console.log(`[MapPage] Camera load complete in ${(performance.now() - mountTime).toFixed(0)}ms`);
        }
      })
      .catch((err) => {
        console.error('Camera initialization failed:', err);
      });
  }, [ensureCamerasLoaded]);

  // Watchdog: if markers don't become ready within 5s after cameras load, show warning
  useEffect(() => {
    if (isInitialized && cameras.length > 0 && !markersReady) {
      watchdogTimeoutRef.current = setTimeout(() => {
        if (!markersReady) {
          setWatchdogWarning(true);
          if (import.meta.env.DEV) {
            console.warn('[MapPage] Watchdog: markers not ready after 5s');
          }
        }
      }, 5000);
      
      return () => {
        if (watchdogTimeoutRef.current) {
          clearTimeout(watchdogTimeoutRef.current);
        }
      };
    }
  }, [isInitialized, cameras.length, markersReady]);

  // Handle markers ready callback from MapLibreView
  const handleMarkersReady = useCallback((ready: boolean) => {
    if (import.meta.env.DEV) {
      console.log(`[MapPage] Markers ready: ${ready}`);
    }
    setMarkersReady(ready);
    if (ready) {
      setWatchdogWarning(false);
    }
  }, []);

  // Handle retry with map remount
  const handleRetryWithRemount = useCallback(async () => {
    if (import.meta.env.DEV) {
      console.log('[MapPage] Retry with remount requested');
    }
    setWatchdogWarning(false);
    setMarkersReady(false);
    
    try {
      await retryCameraLoad();
      // Force map remount with new key
      setMapKey(k => k + 1);
    } catch {
      // Error handling done in store
    }
  }, [retryCameraLoad]);

  // Map progress: idle -> loading -> hydrating -> ready (for cameras)
  // Then map also needs markers to be ready
  const cameraProgress = error ? 'error' : loadPhase;
  
  // Show map only when cameras are fully loaded
  const camerasReady = isInitialized && cameras.length > 0;
  
  // Full ready state: cameras loaded AND map markers rendered
  const isFullyReady = camerasReady && markersReady;

  const seo = (
    <Seo
      title="FlockHopper Map | Explore ALPR Cameras and Privacy Routes"
      description="Explore the national ALPR camera map and compare direct routes with privacy-optimized alternatives."
      path="/map"
    />
  );

  // Show loading screen until cameras are ready OR if there's an error
  // But we need to mount the map (hidden) so it can start loading
  if (!camerasReady || error) {
    return (
      <>
        {seo}
        <MapLoadingScreen
          cameraProgress={cameraProgress}
          cameraCount={cameras.length}
          error={error}
          onRetry={handleRetryWithRemount}
          watchdogWarning={watchdogWarning}
        />
      </>
    );
  }

  return (
    <>
      {seo}
      <div className="map-page h-screen w-screen flex flex-col bg-dark-900 overflow-hidden">
        {/* Header - Persistent on Map View */}
        <header className="h-14 lg:h-16 bg-dark-900/95 backdrop-blur-md border-b border-dark-600 flex items-center z-50 shrink-0">
          <div className="w-full px-3 lg:px-6">
            <div className="flex items-center justify-between h-14 lg:h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center group">
                <img 
                  src="/FlockHopper-3.png" 
                  alt="FlockHopper Logo" 
                  className="h-8 lg:h-10 w-auto object-contain transition-all duration-300 group-hover:scale-110"
                />
              </Link>

              {/* Mobile: Camera count in header */}
              <div className="lg:hidden flex items-center gap-2 bg-dark-800 rounded-full px-3 py-1.5">
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-dark-600 border-t-accent-danger rounded-full animate-spin"></div>
                    <span className="text-sm text-dark-300">Loading...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-accent-danger rec-indicator shadow-[0_0_6px_rgba(239,68,68,0.6)]"></div>
                    <span className="text-sm font-bold text-white tabular-nums">
                      {viewCameraCount.toLocaleString()}
                    </span>
                    <span className="text-xs text-dark-400">in view</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 lg:gap-4">
                {/* Mobile: Support icon */}
                <Link
                  to="/support"
                  aria-label="Support this project"
                  className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  <HeartHandshake className="w-4 h-4" />
                </Link>

                {/* Desktop: Back to home + Support CTA */}
              <Link 
                to="/" 
                className="hidden lg:flex items-center gap-2 text-sm text-dark-300 hover:text-dark-100 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
                <Button
                  asChild
                  size="sm"
                  className="hidden lg:inline-flex bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  <Link to="/support">Support this project</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Route Panel - Side panel on desktop, bottom sheet on mobile */}
          <RoutePanel />
          
          {/* Map - Takes full screen on mobile, remaining space on desktop */}
          <main className="flex-1 relative w-full lg:w-auto">
            <h1 className="sr-only">FlockHopper ALPR Camera Map</h1>
            <MapLibreView 
              ref={mapRef}
              mapKey={mapKey + dataVersion} 
              onMarkersReady={handleMarkersReady} 
            />
            
            {/* Show loading overlay while markers are initializing */}
            {!isFullyReady && (
              <div className="absolute inset-0 z-30 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 border-3 border-dark-600 border-t-accent-danger rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-dark-300">Preparing map...</p>
                  {watchdogWarning && (
                    <button 
                      onClick={handleRetryWithRemount}
                      className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Map Overlays */}
            <MapSearch />
            <CameraStats />
            
            {/* Map Legend */}
            <div className="absolute bottom-6 left-4 z-20 hidden lg:flex flex-col gap-2">
              <div className="bg-dark-900/95 backdrop-blur-md rounded-2xl border border-dark-700/50 px-5 py-3.5 shadow-xl shadow-black/20">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    <span className="text-dark-100">ALPR Camera</span>
                  </div>
                  <div className="w-px h-5 bg-dark-600"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-1 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.5)]" style={{backgroundImage: 'repeating-linear-gradient(90deg, #f97316 0, #f97316 4px, transparent 4px, transparent 7px)'}}></div>
                    <span className="text-dark-100">Direct Route</span>
                  </div>
                  <div className="w-px h-5 bg-dark-600"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-1 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]"></div>
                    <span className="text-dark-100">Privacy Route</span>
                  </div>
                </div>
              </div>
            </div>
            
          </main>
        </div>
      </div>
    </>
  );
}
