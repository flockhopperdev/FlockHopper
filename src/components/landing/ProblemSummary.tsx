import { ShieldAlert, Eye, Scale } from "lucide-react"

export function ProblemSummary() {
  return (
    <section className="py-16 md:py-24 bg-dark-900 border-b border-dark-800">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-dark-100">
              What's the <span className="text-red-500">problem?</span>
            </h2>
          </div>

          {/* Content - Clean vertical stack */}
          <div className="space-y-10">
            
            {/* Mass Surveillance */}
            <div className="group">
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-red-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl md:text-2xl font-bold text-dark-100">
                    Mass Surveillance of Americans
                  </h3>
                  <p className="text-dark-300 leading-relaxed text-lg">
                    A private company logs the movements of Americans living their everyday lives. License plates, locations, timestamps—all stored in a searchable database accessible to law enforcement without a warrant, without suspicion, without your knowledge.
                  </p>
                </div>
              </div>
            </div>

            {/* Documented Abuse */}
            <div className="group">
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-red-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl md:text-2xl font-bold text-dark-100">
                    Documented Abuse
                  </h3>
                  <p className="text-dark-300 leading-relaxed text-lg">
                    The system is being abused. It has been used to stalk ex-partners, track protesters with no crime alleged, help ICE locate immigrants, and pursue women across state lines for abortions. Security vulnerabilities have exposed sensitive data to the public internet.
                  </p>
                </div>
              </div>
            </div>

            {/* Unchecked Power */}
            <div className="group">
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Scale className="w-6 h-6 text-red-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl md:text-2xl font-bold text-dark-100">
                    Unchecked Power
                  </h3>
                  <p className="text-dark-300 leading-relaxed text-lg">
                    No federal regulation. No independent oversight. No warrant required. And after all that—there's little evidence these cameras actually reduce crime. We're surrendering our civil liberties for a system that can't prove it works.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

