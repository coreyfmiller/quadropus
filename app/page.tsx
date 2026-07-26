import { SiteNav } from '@/components/site-nav'
import { Hero } from '@/components/hero'
import { SocialProof } from '@/components/social-proof'
import { FunctionsSection } from '@/components/functions-section'
import { DashboardSection } from '@/components/dashboard-section'
import { HowItWorks } from '@/components/how-it-works'
import { AiModels } from '@/components/ai-models'
import { Pricing } from '@/components/pricing'
import { Vision } from '@/components/vision'
import { FinalCta } from '@/components/final-cta'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <Hero />
        <SocialProof />
        <FunctionsSection />
        <DashboardSection />
        <HowItWorks />
        <AiModels />
        <Pricing />
        <Vision />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
