import { StrictMode, Suspense, lazy, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from './components/common';
import { useCameraStore } from './store/cameraStore';
import './index.css';

// Polyfill for Safari (doesn't support requestIdleCallback)
if (typeof window !== 'undefined' && !window.requestIdleCallback) {
  window.requestIdleCallback = (callback: IdleRequestCallback): number => {
    const start = Date.now();
    return window.setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, 1) as unknown as number;
  };
  window.cancelIdleCallback = (id: number) => clearTimeout(id);
}

// Lazy load pages for code splitting - reduces initial bundle size significantly
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const MapPage = lazy(() => import('./pages/MapPage').then(m => ({ default: m.MapPage })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse').then(m => ({ default: m.TermsOfUse })));
const SupportProject = lazy(() => import('./pages/SupportProject').then(m => ({ default: m.SupportProject })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Enhanced loading fallback - consistent with map loading screen
function PageLoader() {
  return (
    <div className="h-screen w-screen flex flex-col bg-dark-900 overflow-hidden">
      {/* Header skeleton for consistency */}
      <header className="h-14 lg:h-16 bg-dark-900/95 backdrop-blur-md border-b border-dark-600 flex items-center z-50 shrink-0">
        <div className="w-full px-3 lg:px-6">
          <div className="flex items-center justify-between h-14 lg:h-16">
            <div className="h-8 lg:h-10 w-32 bg-dark-700 rounded animate-pulse" />
            <div className="h-8 w-24 bg-dark-700 rounded animate-pulse" />
          </div>
        </div>
      </header>
      
      {/* Main loading content */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Logo */}
          <img 
            src="/FlockHopper-3.png" 
            alt="FlockHopper" 
            className="h-16 lg:h-20 w-auto object-contain"
          />
          
          {/* Loading spinner */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-dark-700 border-t-accent-danger rounded-full animate-spin" />
            <span className="text-dark-400 text-sm font-display">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PreloadManager - Handles background preloading of resources
 * 
 * Strategy:
 * 1. On landing page, start preloading camera data in the background after initial paint
 * 2. This uses requestIdleCallback to avoid blocking user interactions
 * 3. When user navigates to /map, data is already cached and loads instantly
 */
function PreloadManager() {
  const preloadCameras = useCameraStore((state) => state.preloadCameras);
  const isInitialized = useCameraStore((state) => state.isInitialized);

  useEffect(() => {
    // Start preload immediately on any page if cameras not yet loaded
    // This ensures cameras are ready as fast as possible for zip search
    if (!isInitialized) {
      // Use requestIdleCallback for non-blocking start, but with short timeout
      // so it starts quickly even if browser is busy
      const idleId = requestIdleCallback(() => {
        preloadCameras();
      }, { timeout: 100 }); // Start within 100ms max

      return () => cancelIdleCallback(idleId);
    }
  }, [isInitialized, preloadCameras]);

  // Add resource hints for the camera data file
  useEffect(() => {
    // Add prefetch link for camera data if not already present
    if (!document.querySelector('link[href="/cameras-us.json"]')) {
      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = '/cameras-us.json';
      prefetchLink.as = 'fetch';
      prefetchLink.crossOrigin = 'anonymous';
      document.head.appendChild(prefetchLink);
    }
  }, []);

  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          {/* Background preloader - loads camera data while user browses landing page */}
          <PreloadManager />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/support" element={<SupportProject />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />
              {/* Catch-all 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);
