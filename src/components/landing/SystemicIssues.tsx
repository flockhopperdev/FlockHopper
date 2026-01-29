interface SourceLink {
  name: string
  url: string
}

interface IssueItemProps {
  number: string
  title: string
  description: React.ReactNode
  sources?: SourceLink[]
}

function IssueItem({ number, title, description, sources }: IssueItemProps) {
  return (
    <div className="grid md:grid-cols-[80px_1fr] gap-4 md:gap-8 py-8 md:py-10 border-b border-dark-700/50 last:border-b-0">
      {/* Number */}
      <div className="text-5xl md:text-6xl font-bold text-red-600/30 leading-none">
        {number}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h3 className="text-xl md:text-2xl font-bold text-dark-100 uppercase tracking-wide">
          {title}
        </h3>
        <div className="text-dark-300 leading-relaxed text-base md:text-lg max-w-2xl">
          {description}
        </div>
        {sources && sources.length > 0 && (
          <div className="text-sm text-dark-500 pt-2">
            {sources.map((source, index) => (
              <span key={index}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500/70 hover:text-red-400 underline underline-offset-2 transition-colors"
                >
                  {source.name}
                </a>
                {index < sources.length - 1 && <span className="text-dark-600 mx-2">·</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function SystemicIssues() {
  const issues = [
    {
      number: "01",
      title: "No meaningful consent",
      description: (
        <>
          Your HOA or a local business can install a camera that feeds into a <strong className="text-white">nationwide law enforcement database</strong>. You don't get notice, opt-out, or any say in who searches your movements. Flock's business model relies on this—more cameras, more data, more value.
        </>
      )
    },
    {
      number: "02",
      title: "It only expands",
      description: (
        <>
          There's no natural stopping point. More cameras get added. Retention periods get extended. More agencies get access. Flock has grown from <strong className="text-white">0 to 90,000+ cameras</strong> in under a decade—and their business model depends on that number going up.
        </>
      )
    },
    {
      number: "03",
      title: "The capabilities will evolve",
      description: (
        <>
          License plates are just the start. The same cameras can support <strong className="text-white">facial recognition, vehicle occupant detection, travel pattern prediction</strong>—all added via software, not new hardware. <strong className="text-white">Flock already partnered with Ring</strong> to integrate doorbell cameras. Connect enough systems and the network doesn't just track where you've been. It learns your patterns—<strong className="text-white">where you work, where your kids go to school, when you're not home</strong>.
        </>
      )
    },
    {
      number: "04",
      title: "We've seen where this leads",
      description: (
        <>
          China deployed the same tools—license plate readers, facial recognition, centralized databases—for "public safety." Today the system screens all <strong className="text-white">23 million Xinjiang residents</strong>, flags anyone with overseas ties for immediate arrest, and has enabled the detention of <strong className="text-white">over one million Uyghurs</strong>. The cameras weren't rebuilt for repression. They were repurposed.
        </>
      ),
      sources: [
        { name: "Axios", url: "https://www.axios.com/2022/06/14/report-hikvision-cameras-xinjiang-police-uyghurs" },
        { name: "Bulletin of the Atomic Scientists", url: "https://thebulletin.org/2022/10/chinas-high-tech-surveillance-drives-oppression-of-uyghurs/" }
      ]
    }
  ]

  return (
    <section className="py-16 md:py-24 border-b border-dark-600 bg-dark-800/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 md:space-y-6 mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-dark-100">
              It's not just bad apples. <span className="text-red-600">The system itself is the problem.</span>
            </h2>
          </div>

          {/* Issues - Typography-driven numbered format */}
          <div className="divide-y-0">
            {issues.map((issue) => (
              <IssueItem key={issue.number} {...issue} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
