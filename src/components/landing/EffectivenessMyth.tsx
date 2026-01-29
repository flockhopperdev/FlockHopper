import { 
  BarChart3, 
  AlertOctagon, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  FlaskConical
} from "lucide-react"

// Reusable source link component
function Source({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="inline-flex items-center gap-1.5 text-xs text-dark-400 hover:text-red-400 transition-colors group"
    >
      <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
      <span className="border-b border-dashed border-dark-600 group-hover:border-red-400/50">{children}</span>
    </a>
  )
}

export function EffectivenessMyth() {
  return (
    <section className="py-16 md:py-24 border-b border-dark-600 bg-dark-900">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-20">
          
          {/* Header */}
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-dark-100">
              Do They <span className="text-red-600">Actually Work?</span>
            </h2>
            <p className="text-lg md:text-xl text-dark-300 leading-relaxed max-w-3xl mx-auto">
              Flock Safety claims their cameras are crime-fighting miracles. Independent research tells a very different story.
            </p>
          </div>

          {/* Claims vs Reality - Clean Table Layout */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold text-dark-100 font-mono uppercase tracking-wider text-center">
              The Marketing vs. The Data
            </h3>
            
            {/* Desktop: Table Layout */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-dark-700">
              {/* Header Row */}
              <div className="grid grid-cols-2 bg-dark-900">
                <div className="p-6 border-r border-dark-700">
                  <div className="flex items-center gap-2 text-dark-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-mono uppercase tracking-wider">What Flock Claims</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-red-500">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm font-mono uppercase tracking-wider">The Reality</span>
                  </div>
                </div>
              </div>

              {/* Row 1: San Marino */}
              <div className="grid grid-cols-2 border-t border-dark-700">
                <div className="p-6 border-r border-dark-700 bg-dark-900/50">
                  <p className="text-2xl font-bold text-dark-200 mb-2">70% Crime Drop</p>
                  <p className="text-dark-400 text-sm mb-3">San Marino, CA residential burglaries</p>
                  <Source href="https://www.flocksafety.com/blog/why-flock">Flock Marketing</Source>
                </div>
                <div className="p-6 bg-red-950/10">
                  <p className="text-2xl font-bold text-red-500 mb-2">Crime Actually Increased</p>
                  <p className="text-dark-300 text-sm mb-3">
                    Forbes found burglaries <strong>increased 5%</strong> from 2019–2023. The police chief acknowledged the 70% claim was inaccurate.
                  </p>
                  <Source href="https://www.forbes.com/sites/cyrusfarivar/2024/02/29/flock-ai-cameras-may-not-reduce-crime/">Forbes Investigation</Source>
                </div>
              </div>

              {/* Row 2: 10% Solved */}
              <div className="grid grid-cols-2 border-t border-dark-700">
                <div className="p-6 border-r border-dark-700 bg-dark-900/50">
                  <p className="text-2xl font-bold text-dark-200 mb-2">10% of U.S. Crime Solved</p>
                  <p className="text-dark-400 text-sm mb-3">Flock claims to help solve 10% of all reported crime in America</p>
                  <Source href="https://www.flocksafety.com/blog/10-of-reported-crime-in-the-u-s-is-solved-using-flock-technology">Flock White Paper</Source>
                </div>
                <div className="p-6 bg-red-950/10">
                  <p className="text-2xl font-bold text-red-500 mb-2">"Borders on Ludicrous"</p>
                  <p className="text-dark-300 text-sm mb-3">
                    Criminologists called the methodology <strong>deeply flawed</strong>. "I doubt this would survive peer review."
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Source href="https://www.forbes.com/sites/cyrusfarivar/2024/02/29/flock-ai-cameras-may-not-reduce-crime/">Forbes</Source>
                    <Source href="https://www.techdirt.com/2024/04/01/studies-show-flocks-alprs-reduce-crime-so-long-as-flock-controls-the-inputs-and-the-methodology/">Techdirt</Source>
                  </div>
                </div>
              </div>

              {/* Row 3: No Causal Link */}
              <div className="grid grid-cols-2 border-t border-dark-700">
                <div className="p-6 border-r border-dark-700 bg-dark-900/50">
                  <p className="text-2xl font-bold text-dark-200 mb-2">62% Crime Reduction</p>
                  <p className="text-dark-400 text-sm mb-3">Cobb County, GA and other cherry-picked case studies</p>
                  <Source href="https://www.flocksafety.com/">Flock Homepage</Source>
                </div>
                <div className="p-6 bg-red-950/10">
                  <p className="text-2xl font-bold text-red-500 mb-2">No Causal Link Found</p>
                  <p className="text-dark-300 text-sm mb-3">
                    Randomized controlled studies show <strong>no statistically significant crime reduction</strong> once confounders are accounted for.
                  </p>
                  <Source href="https://www.forbes.com/sites/cyrusfarivar/2024/02/29/flock-ai-cameras-may-not-reduce-crime/">Forbes Investigation</Source>
                </div>
              </div>
            </div>

            {/* Mobile: Card Layout */}
            <div className="md:hidden space-y-6">
              {/* Comparison 1: San Marino */}
              <div className="rounded-2xl border border-dark-700 overflow-hidden">
                <div className="p-5 bg-dark-900/50">
                  <div className="flex items-center gap-2 text-dark-400 mb-3">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">What Flock Claims</span>
                  </div>
                  <p className="text-xl font-bold text-dark-200 mb-2">70% Crime Drop</p>
                  <p className="text-dark-400 text-sm mb-3">San Marino, CA residential burglaries</p>
                  <Source href="https://www.flocksafety.com/blog/why-flock">Flock Marketing</Source>
                </div>
                <div className="p-5 bg-red-950/10 border-t-2 border-red-900/30">
                  <div className="flex items-center gap-2 text-red-500 mb-3">
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">The Reality</span>
                  </div>
                  <p className="text-xl font-bold text-red-500 mb-2">Crime Actually Increased</p>
                  <p className="text-dark-300 text-sm mb-3">
                    Forbes found burglaries <strong>increased 5%</strong> from 2019–2023. The police chief acknowledged the 70% claim was inaccurate.
                  </p>
                  <Source href="https://www.forbes.com/sites/cyrusfarivar/2024/02/29/flock-ai-cameras-may-not-reduce-crime/">Forbes Investigation</Source>
                </div>
              </div>

              {/* Comparison 2: 10% Solved */}
              <div className="rounded-2xl border border-dark-700 overflow-hidden">
                <div className="p-5 bg-dark-900/50">
                  <div className="flex items-center gap-2 text-dark-400 mb-3">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">What Flock Claims</span>
                  </div>
                  <p className="text-xl font-bold text-dark-200 mb-2">10% of U.S. Crime Solved</p>
                  <p className="text-dark-400 text-sm mb-3">Flock claims to help solve 10% of all reported crime in America</p>
                  <Source href="https://www.flocksafety.com/blog/10-of-reported-crime-in-the-u-s-is-solved-using-flock-technology">Flock White Paper</Source>
                </div>
                <div className="p-5 bg-red-950/10 border-t-2 border-red-900/30">
                  <div className="flex items-center gap-2 text-red-500 mb-3">
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">The Reality</span>
                  </div>
                  <p className="text-xl font-bold text-red-500 mb-2">"Borders on Ludicrous"</p>
                  <p className="text-dark-300 text-sm mb-3">
                    Criminologists called the methodology <strong>deeply flawed</strong>. "I doubt this would survive peer review."
                  </p>
                  <div className="flex flex-col gap-2">
                    <Source href="https://www.forbes.com/sites/cyrusfarivar/2024/02/29/flock-ai-cameras-may-not-reduce-crime/">Forbes</Source>
                    <Source href="https://www.techdirt.com/2024/04/01/studies-show-flocks-alprs-reduce-crime-so-long-as-flock-controls-the-inputs-and-the-methodology/">Techdirt</Source>
                  </div>
                </div>
              </div>

              {/* Comparison 3: No Causal Link */}
              <div className="rounded-2xl border border-dark-700 overflow-hidden">
                <div className="p-5 bg-dark-900/50">
                  <div className="flex items-center gap-2 text-dark-400 mb-3">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">What Flock Claims</span>
                  </div>
                  <p className="text-xl font-bold text-dark-200 mb-2">62% Crime Reduction</p>
                  <p className="text-dark-400 text-sm mb-3">Cobb County, GA and other cherry-picked case studies</p>
                  <Source href="https://www.flocksafety.com/">Flock Homepage</Source>
                </div>
                <div className="p-5 bg-red-950/10 border-t-2 border-red-900/30">
                  <div className="flex items-center gap-2 text-red-500 mb-3">
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">The Reality</span>
                  </div>
                  <p className="text-xl font-bold text-red-500 mb-2">No Causal Link Found</p>
                  <p className="text-dark-300 text-sm mb-3">
                    Randomized controlled studies show <strong>no statistically significant crime reduction</strong> once confounders are accounted for.
                  </p>
                  <Source href="https://www.forbes.com/sites/cyrusfarivar/2024/02/29/flock-ai-cameras-may-not-reduce-crime/">Forbes Investigation</Source>
                </div>
              </div>
            </div>
          </div>

          {/* The Hard Numbers - Piedmont */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 justify-center">
              <FlaskConical className="w-5 h-5 text-red-500" />
              <h3 className="text-xl font-bold text-dark-100 font-mono uppercase tracking-wider">
                Independent Research
              </h3>
            </div>
            
            <div className="bg-dark-900 border border-dark-700 rounded-2xl p-8 md:p-10">
              <div className="flex flex-col lg:flex-row gap-10 items-center">
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/30 border border-red-900/30">
                    <BarChart3 className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-mono uppercase tracking-wider text-red-500">16-Year Study • Piedmont, CA</span>
                  </div>
                  <h4 className="text-3xl md:text-4xl font-bold text-dark-100">
                    Less than <span className="text-red-500">0.3%</span> of alerts led to a useful lead
                  </h4>
                  <p className="text-dark-300 text-lg leading-relaxed">
                    Piedmont spent <strong className="text-dark-100">$576,000</strong> on ALPR cameras over 16 years. 
                    Out of tens of thousands of license plate "hits," almost none resulted in catching a criminal.
                  </p>
                  <blockquote className="border-l-2 border-red-600 pl-4 text-dark-400 italic">
                    "Improper to conclude that ALPRs are an effective treatment for deterring vehicle theft."
                  </blockquote>
                  <Source href="https://www.independent.org/article/2021/11/30/automated-license-plate-readers-a-study-in-failure/">Independent Institute</Source>
                </div>
                
                {/* Donut Chart - 99.7% filled to show "no useful leads" */}
                <div className="shrink-0 flex justify-center">
                  <div className="relative w-48 h-48">
                    {/* Background ring */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" className="text-dark-800" />
                    </svg>
                    {/* 99.7% filled ring showing "no useful leads" */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle 
                        cx="50" cy="50" r="40" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="10" 
                        strokeDasharray="251" 
                        strokeDashoffset="0.75"
                        className="text-dark-600" 
                      />
                    </svg>
                    {/* Small 0.3% accent showing "useful leads" */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle 
                        cx="50" cy="50" r="40" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="10" 
                        strokeDasharray="0.75 251"
                        strokeLinecap="round"
                        className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="block text-3xl font-bold text-red-500">0.3%</span>
                      <span className="text-xs text-dark-400 mt-1">led to useful leads</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Exposed Marketing */}
          <div className="bg-gradient-to-br from-red-950/30 to-dark-900 border border-red-900/30 rounded-2xl p-8">
            <div className="flex items-center gap-2 text-red-500 mb-6">
              <AlertOctagon className="w-5 h-5" />
              <span className="font-mono text-sm uppercase tracking-wider font-bold">Exposed: Manipulated Marketing</span>
            </div>
            
            <div className="space-y-4">
              <p className="text-dark-200 leading-relaxed">
                <strong>Leaked internal communications</strong> revealed Flock rushed to publicize favorable results while ignoring data that <em>"did not meaningfully depict"</em> a public-safety benefit.
              </p>
              <p className="text-dark-300 leading-relaxed">
                <strong className="text-red-500">Dr. Johnny Nhan (TCU)</strong>, an academic partner, later said he would have handled the study differently. He confirmed police data was <em>"varied and incomplete"</em>—yet Flock published the study anyway.
              </p>
              <p className="text-dark-300 leading-relaxed">
                Forbes found that in cities where Flock claimed dramatic crime drops, <strong>crime often stayed flat or increased</strong>, with short-term dips cherry-picked for marketing.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-dark-700">
              <Source href="https://www.404media.co/researcher-who-oversaw-flock-surveillance-study-now-has-concerns-about-it/">404 Media Investigation</Source>
              <Source href="https://www.techdirt.com/2024/04/01/studies-show-flocks-alprs-reduce-crime-so-long-as-flock-controls-the-inputs-and-the-methodology/">Techdirt Analysis</Source>
              <Source href="https://www.forbes.com/sites/cyrusfarivar/2024/02/29/flock-ai-cameras-may-not-reduce-crime/">Forbes Investigation</Source>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
