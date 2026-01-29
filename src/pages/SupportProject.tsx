import { Link } from "react-router-dom"
import { useState } from "react"
import { ArrowLeft, Copy, Check, Share2, Bitcoin, Shield } from "lucide-react"
import { Seo } from "@/components/common"

const BTC_ADDRESS = "bc1qcer9w2fn9swtazt0legr9tacazy0f5xl7qgp9m"
const XMR_ADDRESS = "82rWkJ9mJnA8mM8gNfY4MGKbKLvxzSZEeap4RCUdbfec7trYNyEvrPY4Mv7F3YZVtd3cQfwtJu2V5PEvnLS3pbfqSyQTtr7"

// Monero icon component since lucide doesn't have one
function MoneroIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="currentColor">
      <path d="M127.998 0C57.318 0 0 57.317 0 127.999c0 14.127 2.29 27.716 6.518 40.43H44.8V60.733l83.2 83.2 83.198-83.2v107.695h38.282c4.228-12.714 6.52-26.303 6.52-40.43C256 57.317 198.68 0 127.998 0z"/>
      <path d="M108.867 163.062l-36.31-36.311v67.765H18.623c22.47 36.863 63.051 61.485 109.375 61.485s86.905-24.622 109.374-61.485h-53.933v-67.765l-36.31 36.31-19.131 19.132-19.131-19.131z"/>
    </svg>
  )
}

function CryptoAddress({
  name,
  address,
  icon: Icon,
  qrUrl,
  accentColor,
}: {
  name: string
  address: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  qrUrl: string
  accentColor: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement("textarea")
      textArea.value = address
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-xl border border-dark-700/70 bg-dark-800/50 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
        </div>
        <span className="font-semibold text-dark-100">{name}</span>
      </div>

      {/* QR Code */}
      <div className="flex justify-center py-2">
        <div className="bg-white p-2.5 rounded-lg">
          <img
            src={qrUrl}
            alt={`${name} QR Code`}
            className="w-32 h-32"
            loading="lazy"
          />
        </div>
      </div>

      {/* Address with copy button */}
      <div className="flex items-stretch gap-2">
        <div className="flex-1 bg-dark-900 rounded-lg px-3 py-2.5 border border-dark-700 overflow-hidden">
          <code className="text-xs text-dark-300 break-all font-mono leading-relaxed">
            {address}
          </code>
        </div>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 w-10 rounded-lg border border-dark-600 hover:border-dark-500 bg-dark-900 hover:bg-dark-800 transition-all flex items-center justify-center"
          title="Copy address"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-dark-400" />
          )}
        </button>
      </div>
      {copied && (
        <p className="text-xs text-green-500 animate-fade-in text-center">
          Copied to clipboard
        </p>
      )}
    </div>
  )
}

export function SupportProject() {
  const pageUrl =
    typeof window !== "undefined" ? window.location.href : "https://flockhopper.com/support"

  const btcQrUrl = "/btc-qr.png"
  const xmrQrUrl = "/xmr-qr.png"

  return (
    <>
      <Seo
        title="Support FlockHopper | Keep Privacy Routing Online"
        description="Support FlockHopper with a donation to keep the ALPR camera map and privacy-focused routing online."
        path="/support"
      />
      <div className="min-h-screen bg-dark-900 text-dark-100">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Header */}
          <h1 className="text-3xl font-bold mb-8">Support FlockHopper</h1>

        {/* What This Project Does */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-dark-100 mb-3">What This Project Does</h2>
          <p className="text-dark-300 leading-relaxed">
            FlockHopper builds on <a href="https://deflock.me" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 underline">DeFlock.me</a>'s open-source ALPR camera data and adds a routing tool that helps you find paths that avoid surveillance cameras. It's for anyone who believes mass surveillance shouldn't be the default.
          </p>
        </section>

        {/* Why Donations Help */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-dark-100 mb-3">Why Donations Help</h2>
          <p className="text-dark-300 leading-relaxed">
            Running the routing server and keeping the site online costs money. Donations cover these costs and let me keep working on new features. Any excess funds go toward spreading awareness or future development—like a mobile app with real-time routing.
          </p>
        </section>

        {/* Where the Money Goes */}
        <section className="rounded-xl border border-dark-700/70 bg-dark-800 p-5 mb-8">
          <h2 className="text-lg font-semibold text-dark-100 mb-4">Where the Money Goes</h2>
          <ul className="space-y-3 text-dark-300">
            <li className="flex items-center justify-between">
              <span>Server & hosting</span>
              <span className="font-mono text-dark-200">$50/month</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Domain</span>
              <span className="font-mono text-dark-200">$15/year</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Development tools</span>
              <span className="font-mono text-dark-200">~$40/month</span>
            </li>
            <li className="flex items-center justify-between border-t border-dark-700 pt-3 mt-3">
              <span>Development time</span>
              <span className="text-dark-400 text-sm">volunteer</span>
            </li>
          </ul>
        </section>

        {/* Donate */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-dark-100">Donate</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <CryptoAddress
              name="Monero (XMR)"
              address={XMR_ADDRESS}
              icon={MoneroIcon}
              qrUrl={xmrQrUrl}
              accentColor="#ff6600"
            />
            <CryptoAddress
              name="Bitcoin (BTC)"
              address={BTC_ADDRESS}
              icon={Bitcoin}
              qrUrl={btcQrUrl}
              accentColor="#f7931a"
            />
          </div>
        </section>

        {/* Transparency */}
        <section className="rounded-xl border border-dark-700/50 bg-dark-800/30 p-5 mb-8">
          <h2 className="text-lg font-semibold text-dark-100 mb-4">Transparency</h2>
          <ul className="space-y-2 text-dark-400 text-sm">
            <li className="flex items-center justify-between">
              <span>Total received</span>
              <span className="font-mono text-dark-300">0 XMR, 0 BTC</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Total spent</span>
              <span className="font-mono text-dark-300">$115</span>
            </li>
            <li className="flex items-center justify-between border-t border-dark-700/50 pt-2 mt-2">
              <span>Last updated</span>
              <span className="text-dark-300">January 2026</span>
            </li>
          </ul>
          <p className="text-dark-500 text-xs mt-4">
            This is an independent project, not a registered nonprofit. Donations are not tax-deductible.
          </p>
        </section>

        {/* Share */}
        <section className="rounded-xl border border-dark-700/70 bg-dark-800 p-5">
          <h2 className="text-lg font-semibold text-dark-100 mb-2">Share This Tool</h2>
          <p className="text-dark-400 text-sm mb-4">
            Can't donate? Sharing helps just as much.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  if (navigator.share) {
                    await navigator.share({
                      title: "FlockHopper",
                      text: "A privacy tool that maps ALPR cameras and helps you find alternative routes.",
                      url: pageUrl.replace("/support", ""),
                    })
                    return
                  }
                  await navigator.clipboard.writeText(pageUrl.replace("/support", ""))
                } catch {
                  // no-op
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-600/30 hover:bg-red-600/10 hover:border-red-600 bg-transparent text-dark-100 px-4 py-2.5 transition-colors text-sm"
            >
              <Share2 className="w-4 h-4 text-red-500" />
              Share FlockHopper
            </button>
            <Link
              to="/map?mode=explore"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-dark-600 hover:border-dark-500 bg-transparent text-dark-100 px-4 py-2.5 transition-colors text-sm"
            >
              Explore the map
            </Link>
          </div>
        </section>
        </div>
      </div>
    </>
  )
}
