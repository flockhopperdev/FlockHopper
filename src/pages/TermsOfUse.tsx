import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Seo } from "@/components/common"

export function TermsOfUse() {
  return (
    <>
      <Seo
        title="Terms of Use | FlockHopper"
        description="Review the terms that govern use of the FlockHopper privacy-focused routing and camera map."
        path="/terms"
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

          <h1 className="text-3xl font-bold mb-8">Terms of Use</h1>

        <div className="space-y-8 text-dark-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Acceptance of Terms</h2>
            <p>
              By accessing or using FlockHopper, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use this site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Purpose of This Tool</h2>
            <p>
              FlockHopper is an <strong className="text-dark-100">educational resource and privacy awareness tool</strong> designed to:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 ml-2">
              <li>Inform the public about the scope of automated surveillance networks</li>
              <li>Promote transparency in law enforcement technology</li>
              <li>Support informed civic discourse on surveillance policy</li>
              <li>Advocate for Fourth Amendment protections and civil liberties</li>
            </ul>
            <p className="mt-4">
              This tool visualizes publicly available data about surveillance camera locations. Understanding where surveillance exists is a matter of public interest and supports democratic accountability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Lawful Use Only</h2>
            <p>
              <strong className="text-dark-100">This tool is not intended to facilitate illegal activity.</strong> You agree that you will:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 ml-2">
              <li>Use this tool only for lawful purposes</li>
              <li>Comply with all applicable local, state, and federal laws</li>
              <li>Not use this tool to evade law enforcement during the commission of any crime</li>
              <li>Not use this tool to plan, facilitate, or conceal any illegal activity</li>
            </ul>
            <p className="mt-4">
              We are privacy advocates, not advocates for lawlessness. The right to privacy and the obligation to follow the law are not mutually exclusive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">No Warranty — "As Is"</h2>
            <p>
              This tool is provided <strong className="text-dark-100">"as is" without warranty of any kind</strong>, express or implied. We do not guarantee that:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 ml-2">
              <li>Camera location data is accurate, complete, or current</li>
              <li>Routes calculated will avoid all surveillance cameras</li>
              <li>The service will be uninterrupted or error-free</li>
              <li>Any particular result will be achieved by using this tool</li>
            </ul>
            <p className="mt-4">
              Camera networks change constantly. New cameras are installed, old ones are removed, and our data may be incomplete or outdated. Do not rely on this tool for any purpose where accuracy is critical.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, the creators and contributors of FlockHopper shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 ml-2">
              <li>Your use of or inability to use this tool</li>
              <li>Any inaccuracies in camera location data</li>
              <li>Any routes suggested by this tool</li>
              <li>Any actions you take based on information from this tool</li>
              <li>Any third-party conduct or content</li>
            </ul>
            <p className="mt-4">
              You assume all risk associated with your use of this tool.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless the creators and contributors of FlockHopper from any claims, damages, or expenses (including legal fees) arising from your use of this tool or your violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Intellectual Property</h2>
            <p className="mb-3">
              FlockHopper is open source software released under the <strong className="text-dark-100">MIT License</strong>. You are free to use, modify, and distribute the code in accordance with that license.
            </p>
            <p className="mb-3">
              <strong className="text-dark-100">Third-party attributions:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 underline">OpenStreetMap contributors</a> (ODbL)</li>
              <li>Camera data from <a href="https://deflock.me" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 underline">DeFlock.me</a> and community contributors</li>
              <li>Geocoding services provided by LocationIQ and Photon</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Trademark Notice</h2>
            <p>
              FlockHopper is <strong className="text-dark-100">not affiliated with, endorsed by, or connected to Flock Safety, Inc.</strong> or any law enforcement agency. "Flock Safety" and related marks are trademarks of Flock Safety, Inc. References to Flock Safety on this site are made solely for informational purposes to describe their publicly documented surveillance products and network.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the site after changes constitutes acceptance of the updated terms. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with applicable law, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-100 mb-3">Contact</h2>
            <p>
              For questions about these terms, please contact us through the project's GitHub repository or hosting provider.
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

