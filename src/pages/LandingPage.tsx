import {
  Header,
  Hero,
  ZipSearch,
  MapPreviewGL,
  WhatItIs,
  DocumentedAbuses,
  SystemicIssues,
  EffectivenessMyth,
  CitiesFightingBack,
  TakeAction,
  HowItWorks,
  CommunityResources,
  Footer,
  ProblemSummary,
} from '@/components/landing'
import { Seo } from '@/components/common'

export function LandingPage() {
  return (
    <>
      <Seo
        title="FlockHopper | ALPR Camera Avoidance Routing"
        description="Plan routes that minimize ALPR camera exposure. Explore 90,000+ cameras and build privacy-first routes across the United States."
      />
      <main className="min-h-screen bg-dark-900 pt-16 overflow-x-hidden">
        <Header />
        <Hero />
        
        <div className="container mx-auto px-4 py-12 space-y-12">
          <ZipSearch />
          <MapPreviewGL />
        </div>

        <ProblemSummary />
        <WhatItIs />
        <DocumentedAbuses />
        <SystemicIssues />
        <EffectivenessMyth />
        <CitiesFightingBack />
        <TakeAction />
        <HowItWorks />
        <CommunityResources />
        <Footer />
      </main>
    </>
  )
}
