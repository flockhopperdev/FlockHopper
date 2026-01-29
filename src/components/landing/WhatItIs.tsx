import { Camera, Network, Clock, Database } from "lucide-react"

export function WhatItIs() {
  const supportingItems = [
    {
      icon: Network,
      title: "Nationwide Network",
      description: "75% of Flock's law enforcement customers share data with each other. A scan in your neighborhood can be searched by agencies thousands of miles away."
    },
    {
      icon: Database,
      title: "What Gets Captured",
      description: "License plate, make, model, color, bumper stickers, dents, exact location, and timestamp. Every detail uploaded to a centralized cloud database."
    },
    {
      icon: Clock,
      title: "30-Day Retention",
      description: "All scans are stored for 30 days by default—creating a rolling record of where every car in the network has been."
    }
  ]

  return (
    <section className="py-16 md:py-24 border-b border-dark-600 bg-dark-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-12 md:space-y-16">
          {/* Header */}
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-dark-100">
              What is <span className="text-red-600">Flock Safety?</span>
            </h2>
            <p className="text-lg md:text-xl text-dark-300 leading-relaxed max-w-2xl mx-auto">
              A private surveillance company operating 90,000+ cameras nationwide, scanning 20 billion license plates per month.
            </p>
          </div>

          {/* Hero Card - ALPR explanation */}
          <div className="p-8 md:p-10 rounded-2xl bg-gradient-to-br from-red-950/40 to-dark-800 border border-red-900/30">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-500 shrink-0">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-bold text-dark-100">
                  Automated License Plate Readers (ALPRs)
                </h3>
                <p className="text-dark-300 leading-relaxed text-lg">
                  Solar-powered cameras mounted on poles, streetlights, and police vehicles. Every passing car is photographed and its plate scanned—whether you're a suspect or not.
                </p>
              </div>
            </div>
          </div>

          {/* Supporting items - equal grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {supportingItems.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={index}
                  className="group p-6 rounded-2xl bg-dark-800/50 border border-dark-700 hover:border-red-600/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-dark-800 border border-dark-700 group-hover:border-red-600/30 group-hover:bg-red-600/10 flex items-center justify-center text-dark-400 group-hover:text-red-500 transition-colors mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-dark-100 group-hover:text-white transition-colors mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-dark-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
