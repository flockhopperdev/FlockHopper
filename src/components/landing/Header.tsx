import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, X, Map, Route, HelpCircle, Megaphone, Camera, Heart, Volume2, VolumeX, Loader2 } from "lucide-react"
import { useAudioStore } from "@/store/audioStore"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { isPlaying, isLoading, toggleAudio, cleanup } = useAudioStore()

  // Cleanup audio on unmount (navigation away from landing page)
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleAnchorClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[1100] bg-dark-900/80 backdrop-blur-md border-b border-dark-600">
        <div className="w-full pl-0 pr-4 md:pl-2 md:pr-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img 
                src="/FlockHopper-3.png" 
                alt="FlockHopper Logo" 
                className="h-10 w-auto object-contain transition-all duration-300 group-hover:scale-110"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/map?mode=explore" className="text-sm text-dark-300 hover:text-dark-100 transition-colors">
                Explore Map
              </Link>
              <Link to="/map" className="text-sm text-dark-300 hover:text-dark-100 transition-colors">
                Check Route
              </Link>
              <a
                href="#how-it-works"
                className="text-sm text-dark-300 hover:text-dark-100 transition-colors"
              >
                How It Works
              </a>
              <a href="#take-action" className="text-sm text-dark-300 hover:text-dark-100 transition-colors">
                Take Action
              </a>
              <a
                href="https://deflock.me/report"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-dark-300 hover:text-dark-100 transition-colors"
              >
                Report a Camera
              </a>
            </nav>

            {/* CTA Button (Desktop) & Mobile Menu Button */}
            <div className="flex items-center gap-3">
              {/* Audio Toggle */}
              <button
                onClick={toggleAudio}
                disabled={isLoading}
                className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full text-sm text-dark-300 hover:text-dark-100 transition-colors disabled:opacity-50"
                aria-label={isPlaying ? "Mute ambient music" : "Play ambient music"}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                ) : isPlaying ? (
                  <Volume2 className="w-4 h-4 text-red-500" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <span className="hidden md:inline text-xs">Sound</span>
                <div className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${isPlaying ? 'bg-red-600 justify-end' : 'bg-dark-600 justify-start'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isLoading ? 'animate-pulse' : ''}`} />
                </div>
              </button>

              {/* Desktop CTA */}
              <Button asChild size="sm" className="hidden md:inline-flex bg-red-600 hover:bg-red-700 text-white font-semibold">
                <Link to="/support">Support this project</Link>
              </Button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-dark-700/50 border border-dark-600 text-dark-200 hover:text-dark-100 hover:bg-dark-700 transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[1050] md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-dark-900/90 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <div
          className={`absolute top-16 left-0 right-0 bg-dark-800 border-b border-dark-600 shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <nav className="flex flex-col p-4 space-y-1">
            <Link
              to="/map?mode=explore"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-dark-200 hover:text-dark-100 hover:bg-dark-700/50 transition-colors"
            >
              <Map className="w-5 h-5 text-red-500" />
              <span className="font-medium">Explore Map</span>
            </Link>
            
            <Link
              to="/map"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-dark-200 hover:text-dark-100 hover:bg-dark-700/50 transition-colors"
            >
              <Route className="w-5 h-5 text-red-500" />
              <span className="font-medium">Check Route</span>
            </Link>
            
            <a
              href="#how-it-works"
              onClick={handleAnchorClick}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-dark-200 hover:text-dark-100 hover:bg-dark-700/50 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium">How It Works</span>
            </a>
            
            <a
              href="#take-action"
              onClick={handleAnchorClick}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-dark-200 hover:text-dark-100 hover:bg-dark-700/50 transition-colors"
            >
              <Megaphone className="w-5 h-5 text-red-500" />
              <span className="font-medium">Take Action</span>
            </a>
            
            <a
              href="https://deflock.me/report"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-dark-200 hover:text-dark-100 hover:bg-dark-700/50 transition-colors"
            >
              <Camera className="w-5 h-5 text-red-500" />
              <span className="font-medium">Report a Camera</span>
            </a>

            {/* Divider */}
            <div className="h-px bg-dark-600 my-2" />

            {/* Support CTA in Mobile Menu */}
            <Link
              to="/support"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/10 border border-red-600/30 text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="font-semibold">Support this project</span>
            </Link>
          </nav>
        </div>
      </div>
    </>
  )
}
