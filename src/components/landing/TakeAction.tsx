import { Link } from "react-router-dom"
import { useState } from "react"
import {
  Users,
  Share2,
  Mail,
  FileText,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Route,
} from "lucide-react"

type CivicAction = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  cta: string
  href?: string
  onClick?: () => void
}

export function TakeAction() {
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle")

  const pageUrl =
    typeof window !== "undefined" ? window.location.href : "https://example.com"

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: pageUrl,
        })
        return
      }
      await navigator.clipboard.writeText(pageUrl)
      setShareStatus("copied")
      window.setTimeout(() => setShareStatus("idle"), 2000)
    } catch {
      setShareStatus("failed")
      window.setTimeout(() => setShareStatus("idle"), 2000)
    }
  }

  const civicActions: CivicAction[] = [
    {
      icon: Share2,
      title: "Spread the word",
      description: "Most people don't know they're being tracked. Share this with your community—neighbors, group chats, social media.",
      cta: shareStatus === "copied" ? "Copied!" : "Copy link",
      onClick: handleShare,
    },
    {
      icon: Users,
      title: "Attend a council meeting",
      description: "Camera contracts are approved at city council. Show up, speak during public comment, and ask hard questions.",
      cta: "Get Deflock's guide",
      href: "https://deflock.me/council",
    },
    {
      icon: Mail,
      title: "Contact your representatives",
      description: "Demand oversight and accountability. Tell your elected officials you want limits on warrantless surveillance.",
      cta: "Find your rep",
      href: "https://www.house.gov/representatives/find-your-representative",
    },
    {
      icon: FileText,
      title: "File a FOIA request",
      description: "Request camera policies, data retention rules, and access logs from your city. Know what they're hiding.",
      cta: "Learn how",
      href: "https://www.muckrock.com/",
    },
  ]

  return (
    <section id="take-action" className="py-16 md:py-24 border-b border-dark-600">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-dark-100 mb-4">
              <span className="text-red-600">Do something</span> about it
            </h2>
            <p className="text-lg text-dark-300 max-w-2xl mx-auto">
              Pick one action and take it this week.
            </p>
          </div>

          {/* Primary CTA - Route Checker */}
          <div className="mb-12">
            <Link
              to="/map"
              className="group block p-6 md:p-8 rounded-2xl bg-dark-800/60 border border-dark-700 hover:border-red-600/50 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center shrink-0">
                  <Route className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-dark-100 group-hover:text-white transition-colors mb-1">
                    Plan your route
                  </h3>
                  <p className="text-dark-400">
                    See how many cameras track your commute—then find a way around them.
                  </p>
                </div>
                <ArrowRight className="hidden md:block w-5 h-5 text-dark-500 group-hover:text-red-500 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </Link>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-6">
            <p className="text-center text-dark-500 text-sm uppercase tracking-wider font-medium">
              Other ways to help
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {civicActions.map((action) => {
                const Icon = action.icon
                const isShare = action.title === "Spread the word"

                const cardContent = (
                  <div className="group h-full p-5 rounded-xl bg-dark-800/50 border border-dark-700 hover:border-red-600/30 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-dark-700 border border-dark-600 group-hover:border-red-600/30 group-hover:bg-red-600/10 flex items-center justify-center shrink-0 transition-all">
                        {isShare && shareStatus === "copied" ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Icon className="w-5 h-5 text-dark-400 group-hover:text-red-500 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-dark-100 group-hover:text-white transition-colors">
                            {action.title}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 group-hover:text-red-400 shrink-0 transition-colors">
                            {action.cta}
                            {action.href ? (
                              <ExternalLink className="w-3 h-3" />
                            ) : isShare && shareStatus !== "copied" ? (
                              <Copy className="w-3 h-3" />
                            ) : null}
                          </span>
                        </div>
                        <p className="text-sm text-dark-400 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )

                if (action.href) {
                  return (
                    <a
                      key={action.title}
                      href={action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {cardContent}
                    </a>
                  )
                }

                return (
                  <button
                    key={action.title}
                    type="button"
                    onClick={action.onClick}
                    className="block w-full text-left"
                  >
                    {cardContent}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
