import { Link } from "react-router-dom"
import { Search, Map } from "lucide-react"
import { USAAnimation } from "./USAAnimation"
import { useEffect, useState, useRef } from "react"

function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasStarted, startOnView])

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      // Ease out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [hasStarted, end, duration])

  return { count, ref }
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const { count, ref } = useCountUp(value, 2000)
  // Render final value invisibly to reserve space, preventing CLS
  return (
    <span ref={ref} className="tabular-nums inline-block relative">
      {/* Invisible spacer with final value to prevent layout shift */}
      <span aria-hidden="true" className="invisible">
        {value.toLocaleString()}{suffix}
      </span>
      {/* Animated value overlaid in same position */}
      <span className="absolute left-0 top-0">
        {count.toLocaleString()}{suffix}
      </span>
    </span>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] 3xl:min-h-[85vh] flex items-start border-b border-dark-600 pt-1 md:pt-6 lg:pt-8">
      {/* Subtle scan line overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.015]">
        <div className="scan-line absolute inset-0" />
      </div>

      <div className="w-full px-4 lg:px-8 3xl:px-16 4xl:px-24">
        <div className="grid lg:grid-cols-[1fr_1.6fr] 3xl:grid-cols-[1fr_1.8fr] 4xl:grid-cols-[1fr_2fr] gap-6 3xl:gap-10 4xl:gap-16 items-center mt-2 md:mt-8 lg:mt-12">
          {/* Left side - Text */}
          <div className="space-y-6 3xl:space-y-8 4xl:space-y-10 lg:pl-8 3xl:pl-12 4xl:pl-16">
            <h1 className="text-4xl md:text-6xl lg:text-7xl 3xl:text-8xl 4xl:text-9xl font-bold text-balance leading-tight text-dark-100">
              <span className="text-red-600">
                <AnimatedNumber value={90000} suffix="+" />
                {" "}cameras.
              </span>
              <br />
              <AnimatedNumber value={20} /> billion scans per month. <span className="text-red-600">Zero warrants.</span>
            </h1>

            <p className="text-xl md:text-2xl 3xl:text-3xl 4xl:text-4xl text-dark-300 text-balance leading-relaxed">
              Your daily commute is being tracked. See how many cameras are on your route—then find a way around them.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 3xl:gap-6 pt-4 3xl:pt-6 4xl:pt-8">
              <Link
                to="/map"
                className="inline-flex items-center justify-center gap-2 3xl:gap-3 px-6 py-3 3xl:px-8 3xl:py-4 4xl:px-10 4xl:py-5 rounded-lg 3xl:rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold 3xl:text-lg 4xl:text-xl transition-colors"
              >
                <Search className="w-5 h-5 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7" />
                Check Your Route
              </Link>
              <Link
                to="/map?mode=explore"
                className="inline-flex items-center justify-center gap-2 3xl:gap-3 px-6 py-3 3xl:px-8 3xl:py-4 4xl:px-10 4xl:py-5 rounded-lg 3xl:rounded-xl border border-red-600/50 hover:border-red-600 hover:bg-red-600/10 text-dark-100 font-semibold 3xl:text-lg 4xl:text-xl transition-colors"
              >
                <Map className="w-5 h-5 3xl:w-6 3xl:h-6 4xl:w-7 4xl:h-7" />
                Explore Camera Map
              </Link>
            </div>
          </div>

          {/* Right side - USA Animation */}
          <div
            className="relative w-full rounded-lg 3xl:rounded-xl overflow-hidden aspect-video"
            style={{
              // contain: strict prevents the map from causing layout shifts
              contain: 'strict',
            }}
          >
            <USAAnimation />
          </div>
        </div>
      </div>
    </section>
  )
}
