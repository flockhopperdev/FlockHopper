import { useMapStore, useCameraStore } from '../../store';

export function CameraStats() {
  const { bounds } = useMapStore();
  const { getCamerasInBounds, cameras, isLoading } = useCameraStore();
  
  // Get cameras in actual map bounds
  const viewCameraCount = bounds 
    ? getCamerasInBounds(bounds.north, bounds.south, bounds.east, bounds.west).length
    : 0;

  // Only show on desktop - mobile shows camera count in header
  return (
    <div className="hidden lg:block absolute top-4 right-4 z-40">
      <div className="bg-dark-900/95 backdrop-blur-md rounded-2xl border border-dark-700/50 shadow-xl shadow-black/20 px-5 py-4 min-w-[180px]">
        <div className="flex items-center gap-4">
          {/* Recording indicator / Loading spinner */}
          <div className="relative">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-dark-600 border-t-accent-danger rounded-full animate-spin"></div>
            ) : (
              <div className="w-3.5 h-3.5 rounded-full bg-accent-danger rec-indicator shadow-[0_0_12px_rgba(239,68,68,0.6)]"></div>
            )}
          </div>
          
          {/* Camera count - fixed width to prevent jumping */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-display font-medium text-dark-300">
                  Loading...
                </span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-bold text-white tabular-nums min-w-[60px]">
                  {viewCameraCount.toLocaleString()}
                </span>
                <span className="text-sm text-dark-200">
                  in view
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Total cameras badge */}
        <div className="mt-3 pt-3 border-t border-dark-700/50 flex items-center justify-between">
          <span className="text-xs text-dark-200">Total US</span>
          <span className="text-sm font-medium text-dark-100 tabular-nums">
            {isLoading ? (
              <span className="text-dark-400">—</span>
            ) : (
              cameras.length.toLocaleString()
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
