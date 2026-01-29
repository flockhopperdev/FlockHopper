import { ExternalLink } from "lucide-react"

export function CommunityResources() {
  const resources = [
    {
      name: "DeFlock.me",
      description: "Crowdsourced camera map",
      href: "https://deflock.me",
    },
    {
      name: "Have I Been Flocked?",
      description: "Check if you've been scanned",
      href: "https://haveibeenflocked.com",
    },
    {
      name: "Eyes On Flock",
      description: "Transparency data analysis",
      href: "https://eyesonflock.com",
    },
    {
      name: "ALPR Watch",
      description: "Meeting alerts",
      href: "https://alpr.watch",
    },
  ]

  return (
    <section id="community-resources" className="py-12 md:py-16 border-b border-dark-600">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Compact header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-dark-100">
                Community resources
              </h2>
              <p className="text-sm text-dark-400 mt-1">
                Independent projects fighting mass surveillance
              </p>
            </div>
          </div>

          {/* Horizontal link bar */}
          <div className="flex flex-wrap gap-3">
            {resources.map((resource) => (
              <a
                key={resource.name}
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dark-700 hover:border-red-600/40 bg-dark-800/30 hover:bg-dark-800 transition-all duration-200"
              >
                <span className="font-medium text-dark-200 group-hover:text-white text-sm transition-colors">
                  {resource.name}
                </span>
                <span className="text-dark-500 text-xs hidden sm:inline">
                  {resource.description}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-dark-500 group-hover:text-red-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
