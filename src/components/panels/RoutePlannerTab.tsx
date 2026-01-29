import { useState } from 'react';
import { useRouteStore, useCameraStore, useCustomRouteStore } from '../../store';
import { AddressSearch } from '../inputs/AddressSearch';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { downloadGPX } from '../../services/gpxService';
import { formatDistance, formatDuration } from '../../utils/geo';
import { formatPercent } from '../../utils/formatting';

export function RoutePlannerTab() {
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    origin,
    destination,
    setOrigin,
    setDestination,
    calculateRoutes,
    clearRoutes,
    swapLocations,
    normalRoute,
    avoidanceRoute,
    comparison,
    isCalculating,
    error,
    activeRoute,
    setActiveRoute,
    avoidanceConfig,
    setAvoidanceWeight,
    setMaxDetour,
    pickingLocation,
    startPickingLocation,
    cancelPickingLocation,
  } = useRouteStore();

  const { cameras } = useCameraStore();
  const { enterCustomMode } = useCustomRouteStore();

  const handleCalculate = () => {
    calculateRoutes(cameras);
  };

  const handleExportGPX = () => {
    const route = activeRoute === 'avoidance' ? avoidanceRoute : normalRoute;
    if (route) {
      const filename = `flockhopper-${activeRoute}-route-${Date.now()}.gpx`;
      downloadGPX(route, filename);
    }
  };

  const canCalculate = origin && destination && !isCalculating;
  const hasRoutes = normalRoute && avoidanceRoute && comparison;
  
  const normalCameraCount = comparison?.normalCameras.length ?? 0;
  const avoidanceCameraCount = comparison?.avoidanceCameras.length ?? 0;
  const cameraReduction = normalCameraCount > 0 
    ? Math.round(((normalCameraCount - avoidanceCameraCount) / normalCameraCount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Intro */}
      {!hasRoutes && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-success/10 border border-accent-success/20 rounded-full mb-4">
            <svg className="w-4 h-4 text-accent-success" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            <span className="text-xs font-medium text-accent-success uppercase tracking-wider">
              Privacy Route
            </span>
          </div>
          <h2 className="text-xl font-display font-bold text-white mb-2">
            Find a camera-avoiding route
          </h2>
          <p className="text-sm text-dark-400 max-w-xs mx-auto">
            We'll calculate both normal and avoidance routes so you can compare.
          </p>
        </div>
      )}

      {/* Route Inputs */}
      <div className="space-y-3">
        <AddressSearch
          value={origin}
          onChange={setOrigin}
          placeholder="Starting point..."
          label="From"
          icon="origin"
          onPickFromMap={() => {
            if (pickingLocation === 'origin') {
              cancelPickingLocation();
            } else {
              startPickingLocation('origin');
            }
          }}
          isPickingFromMap={pickingLocation === 'origin'}
        />

        <div className="flex justify-center">
          <button
            onClick={swapLocations}
            disabled={!origin && !destination}
            className="p-2.5 text-dark-400 hover:text-white hover:bg-dark-700 rounded-xl transition-all disabled:opacity-30"
            title="Swap locations"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z" />
            </svg>
          </button>
        </div>

        <AddressSearch
          value={destination}
          onChange={setDestination}
          placeholder="Destination..."
          label="To"
          icon="destination"
          onPickFromMap={() => {
            if (pickingLocation === 'destination') {
              cancelPickingLocation();
            } else {
              startPickingLocation('destination');
            }
          }}
          isPickingFromMap={pickingLocation === 'destination'}
        />
      </div>

      {/* Settings Toggle */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="w-full flex items-center justify-between px-4 py-3 bg-dark-800 hover:bg-dark-700 rounded-xl transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-dark-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
          <span className="text-sm text-dark-300 font-medium">Avoidance Settings</span>
        </div>
        <svg 
          className={`w-5 h-5 text-dark-500 transition-transform ${showSettings ? 'rotate-180' : ''}`} 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
        </svg>
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-dark-800 rounded-xl border border-dark-600 p-4 space-y-4 animate-fade-in">
          {/* Avoidance Weight */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-dark-400 font-medium">Avoidance Strength</label>
              <span className="text-xs text-accent-primary font-semibold">
                {Math.round(avoidanceConfig.avoidanceWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={avoidanceConfig.avoidanceWeight}
              onChange={(e) => setAvoidanceWeight(parseFloat(e.target.value))}
              className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-accent-primary"
            />
            <div className="flex justify-between text-[10px] text-dark-500 mt-1">
              <span>Minimal</span>
              <span>Maximum</span>
            </div>
          </div>

          {/* Max Detour */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-dark-400 font-medium">Max Extra Distance</label>
              <span className="text-xs text-accent-primary font-semibold">
                +{avoidanceConfig.maxDetourPercent}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={avoidanceConfig.maxDetourPercent}
              onChange={(e) => setMaxDetour(parseInt(e.target.value))}
              className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-accent-primary"
            />
            <div className="flex justify-between text-[10px] text-dark-500 mt-1">
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={!canCalculate}
        className="w-full py-4 bg-gradient-to-r from-accent-success to-emerald-600 hover:from-emerald-600 hover:to-accent-success disabled:from-dark-600 disabled:to-dark-600 disabled:cursor-not-allowed text-white font-display font-bold text-lg rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-accent-success/20 disabled:shadow-none"
      >
        {isCalculating ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Finding routes...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.71 11.29l-9-9a.996.996 0 00-1.41 0l-9 9a.996.996 0 000 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a.996.996 0 000-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z" />
            </svg>
            <span>Calculate Routes</span>
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="p-4 bg-accent-danger/10 border border-accent-danger/30 rounded-xl text-sm text-accent-danger flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Route Comparison */}
      {hasRoutes && (
        <div className="space-y-4 animate-fade-in">
          {/* Route Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Normal Route */}
            <button
              onClick={() => setActiveRoute('normal')}
              className={`relative p-4 rounded-xl border transition-all ${
                activeRoute === 'normal'
                  ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500/30'
                  : 'bg-dark-800 border-dark-600 hover:border-dark-500'
              }`}
            >
              {activeRoute === 'normal' && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-1 rounded-full bg-orange-500" style={{backgroundImage: 'repeating-linear-gradient(90deg, #f97316 0, #f97316 3px, transparent 3px, transparent 5px)'}}></div>
                <span className="text-[10px] font-semibold text-dark-300 uppercase tracking-wider">
                  Direct
                </span>
              </div>
              <div className="text-left">
                <p className="text-lg font-display font-bold text-white">
                  {formatDistance(normalRoute.distanceMeters)}
                </p>
                <p className="text-xs text-dark-400">
                  {formatDuration(normalRoute.durationSeconds)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-dark-600">
                <div className="w-2 h-2 rounded-full bg-accent-danger"></div>
                <span className="text-sm font-bold text-accent-danger">
                  {normalCameraCount}
                </span>
                <span className="text-xs text-dark-500">cameras</span>
              </div>
            </button>

            {/* Avoidance Route */}
            <button
              onClick={() => setActiveRoute('avoidance')}
              className={`relative p-4 rounded-xl border transition-all ${
                activeRoute === 'avoidance'
                  ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/30'
                  : 'bg-dark-800 border-dark-600 hover:border-dark-500'
              }`}
            >
              {activeRoute === 'avoidance' && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-1 rounded-full bg-blue-500"></div>
                <span className="text-[10px] font-semibold text-dark-300 uppercase tracking-wider">
                  Privacy
                </span>
              </div>
              <div className="text-left">
                <p className="text-lg font-display font-bold text-white">
                  {formatDistance(avoidanceRoute.distanceMeters)}
                </p>
                <p className="text-xs text-dark-400">
                  {formatDuration(avoidanceRoute.durationSeconds)}
                  {comparison.durationIncreasePercent > 0 && (
                    <span className="text-accent-warning ml-1">
                      (+{formatPercent(comparison.durationIncreasePercent)})
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-dark-600">
                <svg className="w-4 h-4 text-accent-success" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <span className="text-sm font-bold text-accent-success">
                  {avoidanceCameraCount}
                </span>
                <span className="text-xs text-dark-500">cameras</span>
              </div>
            </button>
          </div>

          {/* Summary Banner */}
          {cameraReduction > 0 && (
            <div className="bg-gradient-to-r from-accent-success/10 to-accent-success/5 border border-accent-success/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-success/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-success" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    <span className="text-accent-success">{cameraReduction}% fewer</span> cameras
                  </p>
                  <p className="text-xs text-dark-400">
                    +{formatDistance(comparison.distanceIncrease)} extra distance
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExportGPX}
            className="w-full py-3 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            Export {activeRoute === 'avoidance' ? 'Privacy' : 'Direct'} Route (GPX)
          </button>

          {/* Customize Route Button */}
          <button
            onClick={() => enterCustomMode(activeRoute === 'avoidance' ? avoidanceRoute! : normalRoute!)}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            Customize This Route
          </button>

          {/* Clear */}
          <button
            onClick={clearRoutes}
            className="w-full py-2.5 text-dark-400 hover:text-dark-200 text-sm font-medium transition-colors"
          >
            Start over
          </button>
        </div>
      )}

      {/* Create Custom Route - shown in empty state */}
      {!hasRoutes && !isCalculating && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-dark-900 px-3 text-dark-500">or</span>
          </div>
        </div>
      )}
      
      {!hasRoutes && !isCalculating && (
        <button
          onClick={() => enterCustomMode()}
          className="w-full py-3 bg-dark-800 hover:bg-dark-700 border border-dark-600 border-dashed text-dark-300 hover:text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
          Create Custom Route
        </button>
      )}

      {/* How it works */}
      {!hasRoutes && !isCalculating && (
        <div className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/50">
          <h4 className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-3">
            How avoidance works
          </h4>
          <ol className="space-y-2.5">
            {[
              'We calculate the direct route first',
              'Identify all ALPR cameras on that route',
              'Find alternative paths that avoid camera clusters',
              'Return the best privacy-preserving route',
            ].map((step, idx) => (
              <li key={idx} className="flex gap-3 text-xs text-dark-400">
                <span className="w-5 h-5 rounded-full bg-dark-700 flex items-center justify-center text-[10px] font-bold text-accent-success flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

