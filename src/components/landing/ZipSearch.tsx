import { useState, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search, Loader2, AlertCircle } from "lucide-react"
import { lookupZipCode } from "@/services/zipCodeService"
import { haversineDistance } from "@/utils/geo"
import { useLandingStore, useCameraStore } from "@/store"
import type { ALPRCamera } from "@/types"

// 10 miles in meters
const SEARCH_RADIUS_METERS = 10 * 1609.34
// Rough degree equivalent for bounding box pre-filter (10 miles ≈ 0.15 degrees)
const SEARCH_RADIUS_DEGREES = 0.18

/**
 * Find cameras within a radius using spatial grid pre-filtering.
 * First filters to a bounding box (O(1) with spatial grid), then
 * runs haversine only on ~1K cameras instead of 62K.
 */
function findCamerasInRadius(
  getCamerasInBounds: (n: number, s: number, e: number, w: number) => ALPRCamera[],
  centerLat: number,
  centerLon: number,
  radiusMeters: number
): ALPRCamera[] {
  // Pre-filter with bounding box (fast spatial grid lookup)
  const north = centerLat + SEARCH_RADIUS_DEGREES
  const south = centerLat - SEARCH_RADIUS_DEGREES
  const east = centerLon + SEARCH_RADIUS_DEGREES
  const west = centerLon - SEARCH_RADIUS_DEGREES

  const candidates = getCamerasInBounds(north, south, east, west)

  // Now filter with precise haversine (only ~1K cameras instead of 62K)
  return candidates.filter((camera) => {
    const distance = haversineDistance(centerLat, centerLon, camera.lat, camera.lon)
    return distance <= radiusMeters
  })
}

export function ZipSearch() {
  const [zipCode, setZipCode] = useState("")
  const { searchResult, isSearching, searchError, setSearchResult, setIsSearching, setSearchError, clearSearch } = useLandingStore()

  // Get camera store functions - spatial grid provides O(1) lookups
  const { getCamerasInBounds, ensureCamerasLoaded, isInitialized } = useCameraStore()

  // Debounce ref to prevent multiple rapid searches
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Track current search to prevent stale updates
  const currentSearchRef = useRef<string | null>(null)

  const performSearch = useCallback(async (zip: string) => {
    if (zip.length !== 5) {
      clearSearch()
      return
    }

    currentSearchRef.current = zip
    setIsSearching(true)
    setSearchError(null)

    try {
      // Step 1: Look up ZIP code from local data (instant!)
      const location = await lookupZipCode(zip)

      if (!location) {
        setSearchError("That ZIP code wasn't found. Please check and try again.")
        setIsSearching(false)
        return
      }

      // Check if search was superseded
      if (currentSearchRef.current !== zip) return

      // Step 2: Set location immediately so map can start flying
      // If cameras are already loaded, include them; otherwise start with empty
      if (isInitialized) {
        // Cameras ready - find them immediately
        const nearbyCameras = findCamerasInRadius(
          getCamerasInBounds,
          location.lat,
          location.lon,
          SEARCH_RADIUS_METERS
        )

        setSearchResult({
          lat: location.lat,
          lon: location.lon,
          zipCode: zip,
          cityName: `${location.city}, ${location.state}`,
          cameraCount: nearbyCameras.length,
          cameras: nearbyCameras,
        })
        setIsSearching(false)
      } else {
        // Cameras not ready - set location first so map flies, then load cameras
        setSearchResult({
          lat: location.lat,
          lon: location.lon,
          zipCode: zip,
          cityName: `${location.city}, ${location.state}`,
          cameraCount: 0, // Will update when cameras load
          cameras: [], // Empty for now
        })

        // Now wait for cameras to load
        await ensureCamerasLoaded()

        // Check if search was superseded while waiting
        if (currentSearchRef.current !== zip) return

        // Find cameras and update result
        const nearbyCameras = findCamerasInRadius(
          getCamerasInBounds,
          location.lat,
          location.lon,
          SEARCH_RADIUS_METERS
        )

        setSearchResult({
          lat: location.lat,
          lon: location.lon,
          zipCode: zip,
          cityName: `${location.city}, ${location.state}`,
          cameraCount: nearbyCameras.length,
          cameras: nearbyCameras,
        })
        setIsSearching(false)
      }
    } catch (error) {
      console.error("Zip search error:", error)
      if (currentSearchRef.current === zip) {
        setSearchError("Something went wrong. Please try again.")
        setIsSearching(false)
      }
    }
  }, [setSearchResult, setIsSearching, setSearchError, clearSearch, ensureCamerasLoaded, getCamerasInBounds, isInitialized])

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5)
    setZipCode(value)

    // Clear any pending search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Clear previous results if zip is incomplete
    if (value.length < 5) {
      currentSearchRef.current = null
      clearSearch()
      return
    }

    // Debounce the search slightly to avoid rapid lookups
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value)
    }, 100)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold text-balance text-dark-100">How many cameras are near you?</h2>
        <p className="text-dark-300">Enter your zip code to see how many cameras are tracking vehicles in your community.</p>
      </div>

      <div className="relative">
        {isSearching ? (
          <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 animate-spin" />
        ) : (
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
        )}
        <Input
          type="text"
          placeholder="Enter zip code"
          value={zipCode}
          onChange={handleZipChange}
          className="pl-12 h-14 text-lg bg-dark-800 border-dark-600 focus:border-red-600 focus-visible:ring-0 focus-visible:ring-transparent text-dark-100"
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </div>

      {/* Error state */}
      {searchError && (
        <div className="p-4 rounded-lg bg-dark-800 border border-red-600/40">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-dark-200">{searchError}</p>
          </div>
        </div>
      )}

      {/* Success state - show loading if cameras are still being fetched */}
      {searchResult && (
        <div className="p-6 rounded-lg bg-dark-800 border border-red-600/20 glow-red animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse-red" />
            {isSearching ? (
              <p className="text-lg text-dark-200">
                <span className="text-dark-400">Finding cameras near</span>{" "}
                <span className="text-dark-100">{searchResult.cityName}...</span>
              </p>
            ) : (
              <p className="text-lg">
                <span className="font-bold text-red-600">{searchResult.cameraCount.toLocaleString()} cameras</span>{" "}
                <span className="text-dark-100">are tracking vehicles within 10 miles of {searchResult.cityName}</span>
              </p>
            )}
          </div>
          {searchResult.cameraCount > 0 && !isSearching && (
            <p className="mt-2 text-sm text-dark-400 ml-6">
              Every trip you take past these cameras is recorded and searchable.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
