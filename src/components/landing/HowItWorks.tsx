import { MapPin, Sliders, Download, Smartphone, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const steps = [
  {
    number: "1",
    icon: MapPin,
    title: "Check Your Route",
    description: "Enter your starting point and destination. See exactly how many cameras are tracking your commute—then let FlockHopper generate an alternative private route that avoids them.",
  },
  {
    number: "2",
    icon: Sliders,
    title: "Customize If Needed",
    description: "Add waypoints to make multiple stops or avoid areas. Your route updates in real-time as you adjust.",
  },
  {
    number: "3",
    icon: Download,
    title: "Export GPX File",
    description: "Click 'Export GPX' to create a standard GPS file. The file can be opened in most GPS apps on your phone.",
  },
  {
    number: "4",
    icon: Smartphone,
    title: "Navigate Privately",
    description: "Open the GPX file in OsmAnd or Organic Maps for turn-by-turn directions.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 border-b border-dark-600 bg-dark-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-dark-100">
              How <span className="text-red-600">FlockHopper</span> Works
            </h2>
            <p className="text-lg text-dark-300 max-w-2xl mx-auto">
              Take back your privacy. Plan a route around ALPR cameras.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-dark-100">{step.title}</h3>
                    <p className="text-dark-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-full shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all"
            >
              <Link to="/map">
                Plan Your Route <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </section>
  )
}
