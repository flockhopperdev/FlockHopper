import { Link } from "react-router-dom"
import { Github, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-600">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
          {/* Left: Branding + Copyright */}
          <div className="flex items-center gap-3 text-dark-400">
            <img 
              src="/FlockHopper-3.png" 
              alt="FlockHopper" 
              className="h-6 w-auto opacity-70"
            />
            <span>
              © {new Date().getFullYear()} — Open source under{" "}
              <a 
                href="https://opensource.org/licenses/MIT"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-300 hover:text-dark-100 transition-colors"
              >
                MIT License
              </a>
            </span>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-6">
            <Link 
              to="/privacy" 
              className="text-dark-400 hover:text-dark-100 transition-colors"
            >
              Privacy
            </Link>
            <Link 
              to="/terms" 
              className="text-dark-400 hover:text-dark-100 transition-colors"
            >
              Terms
            </Link>
            <a
              href="mailto:flockhopperdev@proton.me"
              className="text-dark-400 hover:text-dark-100 transition-colors"
            >
              flockhopperdev@proton.me
            </a>
            <a
              href="https://github.com/flockhopperdev/FlockHopper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-400 hover:text-dark-100 transition-colors inline-flex items-center gap-1.5"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <Link 
              to="/support" 
              className="text-dark-400 hover:text-red-500 transition-colors inline-flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Support</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
