import { Ban, Eye, FileWarning, Siren, Users, ShieldAlert, AlertTriangle, Landmark, ExternalLink } from "lucide-react"

interface SourceLink {
  name: string
  url: string
}

interface AbuseCardProps {
  icon: React.ReactNode
  title: string
  description: React.ReactNode
  sources: SourceLink[]
  index: number
}

function AbuseCard({ icon, title, description, sources }: Omit<AbuseCardProps, 'index'>) {
  return (
    <div className="group relative flex flex-col h-full bg-dark-900 border border-dark-700 rounded-2xl hover:border-red-600/50 transition-colors overflow-hidden">
      <div className="p-6 md:p-8 flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 mb-4 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-dark-100 leading-tight group-hover:text-red-50 transition-colors">
            {title}
          </h3>
        </div>

        {/* Content */}
        <div className="flex-grow mb-6">
          <div className="text-dark-300 leading-relaxed text-sm md:text-base">
            {description}
          </div>
        </div>

        {/* Footer/Sources */}
        <div className="pt-4 mt-auto border-t border-dark-800">
          <div className="text-xs text-dark-500 flex flex-wrap gap-x-3 gap-y-1">
            <span className="font-semibold text-dark-400 uppercase tracking-wider">Source:</span>
            {sources.map((source, idx) => (
              <span key={idx} className="flex items-center">
                {idx > 0 && <span className="mr-3 text-dark-700">|</span>}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-red-500/70 hover:text-red-400 hover:underline decoration-red-900 underline-offset-4 transition-colors"
                >
                  {source.name}
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

const abuses = [
  {
    icon: <FileWarning className="w-6 h-6" />,
    title: "Tracking Abortion Seekers",
    description: (
      <>
        In May 2025, a Texas deputy searched <strong className="text-white">83,345 Flock cameras nationwide</strong> to find a woman who self-administered an abortion. The search reason: "had an abortion, search for female." Despite Flock's claims it was a "welfare check," court documents prove it was a criminal "death investigation"—and prosecutors were consulted about pressing charges.
      </>
    ),
    sources: [
      { name: "404 Media", url: "https://www.404media.co/a-texas-cop-searched-license-plate-cameras-nationwide-for-a-woman-who-got-an-abortion/" },
      { name: "EFF", url: "https://www.eff.org/deeplinks/2025/10/flock-safety-and-texas-sheriff-claimed-license-plate-search-was-missing-person-it" }
    ]
  },
  {
    icon: <Ban className="w-6 h-6" />,
    title: "Immigration Enforcement",
    description: (
      <>
        ICE and CBP access Flock's network—despite having <strong className="text-white">no formal contract</strong>. Local police perform searches on their behalf, logging reasons like "ICE" and "deportee." In Virginia alone, nearly <strong className="text-white">3,000 immigration-related searches</strong> were logged in 12 months.
      </>
    ),
    sources: [
      { name: "404 Media", url: "https://www.404media.co/ice-taps-into-nationwide-ai-enabled-camera-network-data-shows/" },
      { name: "UW Center for Human Rights", url: "https://jsis.washington.edu/humanrights/2025/10/21/leaving-the-door-wide-open/" }
    ]
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Surveilling Protesters",
    description: (
      <>
        EFF analyzed <strong className="text-white">12 million Flock searches</strong> and found 50+ agencies ran hundreds of searches targeting political demonstrations—including the "50501" and "Hands Off" protests. Many searches simply listed "protest" as the reason, with no crime specified.
      </>
    ),
    sources: [
      { name: "Electronic Frontier Foundation", url: "https://www.eff.org/deeplinks/2025/11/how-cops-are-using-flock-safetys-alpr-network-surveil-protesters-and-activists" }
    ]
  },
  {
    icon: <Siren className="w-6 h-6" />,
    title: "Stalking Partners",
    description: (
      <>
        A Kansas police chief searched his ex-girlfriend's vehicle <strong className="text-white">164 times</strong> and her new boyfriend's 64 times—logging false reasons like "missing child." A Kechi lieutenant was arrested for stalking his estranged wife. 
      </>
    ),
    sources: [
      { name: "Wichita Eagle", url: "https://www.yahoo.com/news/kansas-police-chief-used-flock-093300946.html" },
      { name: "KWCH", url: "https://www.kwch.com/2022/10/31/kechi-police-lieutenant-arrested-using-police-technology-stalk-wife/" }
    ]
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Racial Profiling",
    description: (
      <>
        <strong className="text-white">80+ law enforcement agencies</strong> were found using anti-Roma slurs in Flock searches. Police performed hundreds of searches using terms like "g*psy scam"—often without specifying any suspected crime. One Texas department targeted an entire traveling community.
      </>
    ),
    sources: [
      { name: "EFF", url: "https://www.eff.org/deeplinks/2025/11/license-plate-surveillance-logs-reveal-racist-policing-against-romani-people" },
      { name: "Arizona Mirror", url: "https://azmirror.com/2025/11/13/glendale-police-used-an-ethnic-slur-to-search-a-license-plate-surveillance-database/" }
    ]
  },
  {
    icon: <ShieldAlert className="w-6 h-6" />,
    title: "Security Vulnerabilities",
    description: (
      <>
        Security researcher Jon Gaines documented <strong className="text-white">51 vulnerabilities</strong> in Flock devices—including hardcoded passwords. At least <strong className="text-white">67 cameras were exposed to the public internet</strong>, including live footage of children on a playground.
      </>
    ),
    sources: [
      { name: "GainSec Research", url: "https://gainsec.com/2025/11/05/formalizing-my-flock-safety-security-research/" },
      { name: "Straight Arrow News", url: "https://san.com/cc/flock-camera-captured-kids-on-a-playground-a-security-failure-exposed-them-online/" }
    ]
  }
]

export function DocumentedAbuses() {
  return (
    <section className="py-20 md:py-32 border-b border-dark-600 bg-dark-800/20">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-16 md:mb-20 text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-dark-100">
            <span className="block">Warrantless power gets abused.</span>
            <span className="text-red-600 block mt-1 md:mt-2">Here's proof.</span>
          </h2>
        </div>

        {/* Card Grid */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {abuses.map((abuse, index) => (
              <AbuseCard key={index} {...abuse} />
            ))}
          </div>
        </div>

        {/* Supplementary Information */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">

          {/* The Hidden Abuse */}
          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-yellow-950/40 to-dark-900 border border-yellow-900/50 hover:border-yellow-600/50 transition-colors">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-yellow-600/20 border border-yellow-600/30 flex items-center justify-center text-yellow-400 shrink-0">
                 <AlertTriangle className="w-5 h-5" />
               </div>
               <h3 className="text-lg font-bold text-yellow-100">The Abuse We Can't See</h3>
             </div>

             <p className="text-yellow-200/70 leading-relaxed text-sm mb-6">
               These are only the cases where someone typed something obvious like "had an abortion" or "ICE" into the reason field. Officers routinely enter vague terms like "investigation" or "susp"—no one verifies these justifications in real time.
             </p>

             <div className="text-xs md:text-sm text-dark-400 border-l-2 border-yellow-900/50 pl-3">
               <span className="italic">Sources: </span>
               <a
                 href="https://data.aclum.org/2025/10/07/flock-gives-law-enforcement-all-over-the-country-access-to-your-location/"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-red-500/80 hover:text-red-400 underline underline-offset-2 transition-colors"
               >
                 ACLU of Massachusetts
               </a>
               <span className="text-dark-500"> · </span>
               <a
                 href="https://www.aclu-wi.org/news/what-the-flock-police-surveillance-is-ripe-for-abuse/"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-red-500/80 hover:text-red-400 underline underline-offset-2 transition-colors"
               >
                 ACLU of Wisconsin
               </a>
             </div>
          </div>

          {/* Congressional Investigation */}
          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-red-950/40 to-dark-900 border border-red-900/50 hover:border-red-600/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-400 shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-red-100">Congressional Investigation Launched</h3>
            </div>

            <p className="text-red-200/70 leading-relaxed text-sm mb-6">
              In August 2025, Representatives Raja Krishnamoorthi and Robert Garcia launched a formal congressional investigation into Flock's role in "enabling invasive surveillance practices that threaten the privacy, safety, and civil liberties of women, immigrants, and other vulnerable Americans."
            </p>

            <div className="text-xs md:text-sm text-dark-400 border-l-2 border-red-900/50 pl-3">
              <span className="italic">Source: </span>
              <a
                href="https://www.404media.co/congress-launches-investigation-into-flock-after-404-media-reporting/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500/80 hover:text-red-400 underline underline-offset-2 transition-colors"
              >
                404 Media
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
