import { ExternalLink } from "lucide-react"
import { useRef, useState, useEffect, useCallback } from "react"

interface CityInfo {
  city: string
  state: string
  shortReason: string
  source: string
}

const cities: CityInfo[] = [
  {
    city: "Santa Cruz",
    state: "CA",
    shortReason: "4,000+ federal accesses",
    source: "https://www.kqed.org/news/12069705/santa-cruz-the-first-in-california-to-terminate-its-contract-with-flock-safety"
  },
  {
    city: "Flagstaff",
    state: "AZ",
    shortReason: "Unanimous vote",
    source: "https://www.azfamily.com/2025/12/20/flagstaff-cancels-controversial-contract-flock-safety-cameras/"
  },
  {
    city: "Sedona",
    state: "AZ",
    shortReason: "Privacy concerns",
    source: "https://www.azfamily.com/2025/12/20/flagstaff-cancels-controversial-contract-flock-safety-cameras/"
  },
  {
    city: "Cambridge",
    state: "MA",
    shortReason: "Breach of trust",
    source: "https://www.cambridgema.gov/news/2025/12/statementontheflocksafetyalprcontracttermination"
  },
  {
    city: "Eugene",
    state: "OR",
    shortReason: "Data concerns",
    source: "https://www.koin.com/news/oregon/eugene-cancels-contract-with-flock-cameras-over-privacy-data-concerns/"
  },
  {
    city: "Austin",
    state: "TX",
    shortReason: "Community pressure",
    source: "https://www.eff.org/deeplinks/2025/06/victory-austin-organizers-cancel-citys-flock-alpr-contract"
  },
  {
    city: "Oak Park",
    state: "IL",
    shortReason: "ICE access fears",
    source: "https://www.oakpark.com/2025/08/28/state-says-flock-safety-broke-the-law/"
  },
  {
    city: "Evanston",
    state: "IL",
    shortReason: "Law violation",
    source: "https://evanstonnow.com/evanston-cancels-flock-camera-contract/"
  },
  {
    city: "Staunton",
    state: "VA",
    shortReason: "CEO misconduct",
    source: "https://www.ci.staunton.va.us/Home/Components/News/News/2564/71"
  },
  {
    city: "Mountlake Terrace",
    state: "WA",
    shortReason: "Weaponization concerns",
    source: "https://www.heraldnet.com/news/mountlake-terrace-cancels-flock-safety-contract/"
  },
  {
    city: "Scarsdale",
    state: "NY",
    shortReason: "Resident petition",
    source: "https://www.nbcnews.com/tech/tech-news/flock-police-cameras-scan-billions-month-sparking-protests-rcna230037"
  },
  {
    city: "Walla Walla",
    state: "WA",
    shortReason: "Stalker access risk",
    source: "https://www.applevalleynewsnow.com/news/walla-walla-police-end-flock-safety-camera-program-over-public-safety-concerns/article_c03b10cf-c594-42eb-a1d8-e78b00500f4c.html"
  },
  {
    city: "Ferndale",
    state: "MI",
    shortReason: "Ethical concerns",
    source: "https://elpasoheraldpost.com/2025/12/23/el-paso-police-use-controversial-traffic-cameras-other-cities-are-cancelling-for-privacy-concerns/"
  },
  {
    city: "Denver",
    state: "CO",
    shortReason: "Council rejected",
    source: "https://denverite.com/2025/05/05/denver-rejects-flock-camera-license-plate-readers/"
  },
]

function CityChip({ city, source, onClickCapture }: { city: CityInfo; source: string; onClickCapture?: (e: React.MouseEvent) => void }) {
  return (
    <a
      href={source}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-3 px-5 py-3 rounded-full bg-dark-800 border border-dark-700 hover:border-red-600/40 hover:bg-dark-800/80 transition-all duration-200 whitespace-nowrap select-none"
      draggable={false}
      onClickCapture={onClickCapture}
    >
      <span className="font-semibold text-dark-100 group-hover:text-white transition-colors">
        {city.city}, {city.state}
      </span>
      <span className="text-sm text-dark-500 group-hover:text-dark-400 transition-colors">
        {city.shortReason}
      </span>
      <ExternalLink className="w-3.5 h-3.5 text-dark-600 group-hover:text-red-500 transition-colors" />
    </a>
  )
}

function DraggableTicker({
  cities,
  direction = "left",
  speed = 0.5
}: {
  cities: CityInfo[]
  direction?: "left" | "right"
  speed?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const dragStartOffsetRef = useRef(0)
  const dragDistanceRef = useRef(0)
  const shouldPreventClick = useRef(false)

  // Duplicate for seamless loop
  const duplicatedCities = [...cities, ...cities, ...cities]

  // Auto-scroll animation
  useEffect(() => {
    let animationId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      if (!isDraggingRef.current && containerRef.current) {
        const delta = currentTime - lastTime
        const movement = (direction === "left" ? -1 : 1) * speed * (delta / 16)

        setOffset(prev => {
          const halfWidth = containerRef.current!.scrollWidth / 3
          let newOffset = prev + movement

          // Loop seamlessly
          if (direction === "left" && newOffset < -halfWidth) {
            newOffset += halfWidth
          } else if (direction === "right" && newOffset > 0) {
            newOffset -= halfWidth
          }

          return newOffset
        })
      }
      lastTime = currentTime
      animationId = requestAnimationFrame(animate)
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!prefersReducedMotion) {
      animationId = requestAnimationFrame(animate)
    }

    return () => cancelAnimationFrame(animationId)
  }, [direction, speed])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true
    startXRef.current = e.clientX
    dragStartOffsetRef.current = offset
    dragDistanceRef.current = 0
    shouldPreventClick.current = false
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [offset])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return

    const delta = e.clientX - startXRef.current
    dragDistanceRef.current = delta

    if (Math.abs(delta) > 5) {
      shouldPreventClick.current = true
    }

    setOffset(dragStartOffsetRef.current + delta)
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = false
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }, [])

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    if (shouldPreventClick.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex gap-4 cursor-grab active:cursor-grabbing"
      style={{
        transform: `translateX(${offset}px)`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {duplicatedCities.map((city, index) => (
        <CityChip
          key={`${direction}-${index}`}
          city={city}
          source={city.source}
          onClickCapture={handleLinkClick}
        />
      ))}
    </div>
  )
}

export function CitiesFightingBack() {
  return (
    <section className="py-16 md:py-24 border-b border-dark-600 bg-dark-800/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6 mb-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-dark-100">
              Cities Are <span className="text-red-600">Fighting Back</span>
            </h2>
            <p className="text-lg md:text-xl text-dark-300 leading-relaxed max-w-2xl mx-auto">
              Resistance is possible. Communities across the country are rejecting mass surveillance.
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal scrolling ticker - draggable */}
      <div className="relative touch-pan-y overflow-x-clip">
        {/* Gradient masks for edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-[#1a1a24] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-[#1a1a24] to-transparent z-10 pointer-events-none" />

        {/* First row - scrolling left */}
        <div className="mb-4">
          <DraggableTicker cities={cities} direction="left" speed={0.5} />
        </div>

        {/* Second row - scrolling right (reversed order) */}
        <DraggableTicker cities={[...cities].reverse()} direction="right" speed={0.4} />
      </div>

      {/* The Tide Is Turning - typography focused, no box */}
      <div className="container mx-auto px-4 mt-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-dark-500 text-sm uppercase tracking-widest mb-4">
            The momentum is building
          </p>
          <p className="text-2xl md:text-3xl text-dark-200 leading-relaxed font-light">
            From small towns to major cities, <span className="text-dark-100 font-medium">every canceled contract</span> proves that communities can push back against warrantless surveillance.
          </p>
        </div>
      </div>
    </section>
  )
}
