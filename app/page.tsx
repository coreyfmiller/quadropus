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

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://quadropus.ai/#organization',
      name: 'Quadropus.ai',
      url: 'https://quadropus.ai',
      logo: 'https://quadropus.ai/quadropus-logo.png',
      description:
        'Quadropus.ai is the AI operating system for small and medium businesses. One platform to build, grow, automate, and operate your entire business.',
      foundingDate: '2026',
      areaServed: {
        '@type': 'Country',
        name: 'Canada',
      },
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://quadropus.ai/#website',
      url: 'https://quadropus.ai',
      name: 'Quadropus.ai',
      publisher: { '@id': 'https://quadropus.ai/#organization' },
      description:
        'One AI platform for your entire business. Build your presence, grow your customers, automate your work, and operate from one dashboard.',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Quadropus.ai',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'AI-powered business operating system that combines website building, customer growth, workflow automation, and business operations into one intelligent platform.',
      offers: [
        {
          '@type': 'Offer',
          name: 'Starter',
          price: '97',
          priceCurrency: 'CAD',
          description: 'AI monitoring, analytics, basic automation',
          billingIncrement: 'P1M',
        },
        {
          '@type': 'Offer',
          name: 'Growth',
          price: '497',
          priceCurrency: 'CAD',
          description: 'Full website, AI agents, content, SEO',
          billingIncrement: 'P1M',
        },
        {
          '@type': 'Offer',
          name: 'Scale',
          price: '1497',
          priceCurrency: 'CAD',
          description: 'Complete AI operations team for your business',
          billingIncrement: 'P1M',
        },
      ],
      featureList: [
        'AI-powered website building',
        'SEO and search optimization',
        'AI chat agents',
        'Voice AI',
        'Workflow automation',
        'CRM and customer management',
        'Business analytics and intelligence',
        'Multi-model AI (OpenAI, Anthropic, Google, xAI)',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Quadropus.ai?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Quadropus.ai is an AI operating system for small and medium businesses. It combines website building, customer acquisition, workflow automation, and business operations into one intelligent platform powered by the world\'s leading AI models.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does Quadropus.ai help small businesses?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Quadropus.ai replaces the need for multiple separate tools. It builds your website, optimizes your SEO, runs AI chat agents for customer service, automates repetitive workflows, and provides a unified dashboard to operate your entire business from one place.',
          },
        },
        {
          '@type': 'Question',
          name: 'What AI models does Quadropus.ai use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Quadropus.ai intelligently selects the right AI model for every task from OpenAI, Anthropic, Google, and xAI. This means businesses get the best intelligence available without vendor lock-in.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does Quadropus.ai cost?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Quadropus.ai offers three tiers: Starter at $97/month for AI monitoring and basic automation, Growth at $497/month for full website, AI agents, content and SEO, and Scale at $1,497/month for a complete AI operations team. All plans include a 14-day free trial.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can Quadropus.ai build my website?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The Build function of Quadropus.ai creates custom websites, brand identity, content, and landing pages. Your website is then continuously monitored and optimized by AI as part of the platform.',
          },
        },
      ],
    },
  ],
}

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
