import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Seo } from "@/components/common"

export function PrivacyPolicy() {
  return (
    <>
      <Seo
        title="Privacy Policy | FlockHopper"
        description="Learn how FlockHopper handles data, route calculations, and third-party services with a privacy-first approach."
        path="/privacy"
      />
      <div className="min-h-screen bg-dark-900 text-dark-100">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-dark-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Our Commitment to Privacy</h2>
            <p>
              FlockHopper is a privacy awareness and civil liberties education tool. We believe strongly in practicing what we advocate—which is why we've designed this application to minimize data collection and be transparent about what data is processed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Data We Collect</h2>
            <p>
              <strong className="text-dark-100">We do not collect or store any personal information.</strong> We do not use cookies, analytics services, or tracking scripts. We do not have user accounts. We do not maintain logs of your route requests or searches.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">How Route Calculation Works</h2>
            <p className="mb-3">
              When you plan a route, the following data is transmitted:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-dark-200">Origin and destination coordinates</strong> — Sent to our routing server to calculate your route</li>
              <li><strong className="text-dark-200">Camera avoidance zones</strong> — Geographic areas around cameras are sent to the routing engine so it can calculate alternative paths</li>
            </ul>
            <p className="mt-3">
              Route calculations are performed by a <strong className="text-dark-100">GraphHopper routing server</strong>. This server processes your start and end coordinates to compute driving directions. We do not log or store these requests. The routing server is operated by this project and is not a third-party service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Third-Party Services</h2>
            <p className="mb-3">
              To provide address search and mapping functionality, this site makes requests to the following third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-dark-200">LocationIQ</strong> — Address search/geocoding (receives your search queries)</li>
              <li><strong className="text-dark-200">Photon (Komoot)</strong> — Fallback address search</li>
              <li><strong className="text-dark-200">OpenStreetMap</strong> — Map tiles and geographic data</li>
              <li><strong className="text-dark-200">Overpass API</strong> — OpenStreetMap data queries</li>
            </ul>
            <p className="mt-3">
              When you search for an address, your search query is sent to these geocoding services. Your IP address is visible to these services. We do not control their privacy practices. We recommend reviewing their respective privacy policies if this is a concern.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Local Storage</h2>
            <p>
              This site uses your browser's local storage to cache camera location data for performance. This data is stored only on your device, is not transmitted anywhere, and can be cleared at any time through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Camera Data</h2>
            <p>
              Camera location data displayed on this site is sourced from publicly available, crowdsourced databases including <a href="https://deflock.me" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 underline">DeFlock.me</a> and OpenStreetMap. This data is compiled from public records, FOIA requests, and community contributions. We do not independently verify the accuracy of this data. Camera locations may be incomplete, outdated, or inaccurate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Purpose & Use</h2>
            <p>
              FlockHopper is designed as an <strong className="text-dark-100">educational and awareness tool</strong> to help the public understand the scope and reach of automated license plate recognition (ALPR) surveillance networks. This tool is intended to promote transparency, inform public discourse on surveillance policy, and support civil liberties advocacy.
            </p>
            <p className="mt-3">
              This tool is <strong className="text-dark-100">not designed, intended, or promoted for use in evading law enforcement</strong> or facilitating any illegal activity. We do not encourage or condone any unlawful use of this information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Disclaimer</h2>
            <p>
              This site is provided for informational and educational purposes only. We make no guarantees about the accuracy, completeness, or reliability of camera location data or route calculations. Use of this site is at your own risk and discretion.
            </p>
            <p className="mt-3">
              FlockHopper is not affiliated with Flock Safety, Inc. or any law enforcement agency. References to Flock Safety are for informational purposes regarding their publicly documented surveillance network.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Contact</h2>
            <p>
              This project is open source and operated independently. For legal inquiries or content concerns, issues may be reported via the project's GitHub repository or hosting provider.
            </p>
          </section>

          <section className="text-dark-400 text-sm pt-8 border-t border-dark-700">
            <p>Last updated: January 2026</p>
          </section>
        </div>
        </div>
      </div>
    </>
  )
}
