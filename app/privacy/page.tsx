import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Quadropus.ai collects, uses, and protects your information.',
  alternates: { canonical: 'https://quadropus.ai/privacy' },
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-32 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated: July 26, 2026</p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/85">
        <section>
          <h2 className="text-lg font-medium text-foreground">Who We Are</h2>
          <p className="mt-3">
            Quadropus.ai is operated by Fundy Logic Inc., a corporation registered in New Brunswick, Canada. We provide an AI-powered business platform that helps small and medium businesses build their online presence, grow their customer base, automate workflows, and operate from one dashboard.
          </p>
          <p className="mt-2">
            For privacy inquiries, contact us at hello@quadropus.ai.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">What Information We Collect</h2>
          <p className="mt-3">We collect the following types of information:</p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li><strong>Account information:</strong> Name, email address, business name, phone number when you sign up or contact us.</li>
            <li><strong>Business data:</strong> Website content, service descriptions, hours, pricing, and other business information you provide for your platform.</li>
            <li><strong>Customer data:</strong> Information your customers submit through chatbots, contact forms, or other tools we build for you. You are the controller of this data; we process it on your behalf.</li>
            <li><strong>Usage data:</strong> How you interact with the platform, pages visited, features used. Collected via Vercel Analytics (privacy-focused, no cookies).</li>
            <li><strong>Payment information:</strong> Processed by Stripe. We never see or store your full credit card number.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">How We Use Your Information</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>To provide and maintain the Quadropus.ai platform</li>
            <li>To build and host your website, AI agents, and automations</li>
            <li>To generate content (blog posts, SEO optimization) on your behalf</li>
            <li>To process payments and manage your subscription</li>
            <li>To send service-related communications (account updates, platform changes)</li>
            <li>To improve our platform based on aggregate usage patterns</li>
          </ul>
          <p className="mt-3">We do not sell your personal information to third parties. Ever.</p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">AI-Generated Content</h2>
          <p className="mt-3">
            Quadropus.ai uses artificial intelligence (including models from OpenAI, Anthropic, Google, and xAI) to generate content, power chat agents, and provide business insights. Your business information may be sent to these AI providers to deliver the service. These providers process data according to their own privacy policies and do not use your data to train their models when accessed via API.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">Data Sharing</h2>
          <p className="mt-3">We share data only with service providers necessary to operate the platform:</p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li><strong>Vercel:</strong> Website hosting and deployment (US/Canada servers)</li>
            <li><strong>Supabase:</strong> Database and authentication</li>
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>Google:</strong> Analytics, search console data, AI models</li>
            <li><strong>OpenAI / Anthropic / xAI:</strong> AI content generation and chat agents</li>
            <li><strong>Resend:</strong> Transactional email delivery</li>
          </ul>
          <p className="mt-3">We do not sell, rent, or trade your information with third parties for marketing purposes.</p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">Data Storage and Security</h2>
          <p className="mt-3">
            Your data is stored on servers in the United States and Canada (via Vercel and Supabase). We implement appropriate technical and organizational measures to protect your information, including encryption in transit (TLS) and at rest, access controls, and regular security reviews.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">Data Retention</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>Account data: Retained for the duration of your subscription plus 90 days</li>
            <li>Customer data (chatbot conversations, form submissions): Retained for the duration of your subscription, deleted within 30 days of cancellation</li>
            <li>Payment records: Retained as required by tax law (7 years)</li>
            <li>Analytics: Aggregated, non-personal, retained indefinitely</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">Your Rights</h2>
          <p className="mt-3">Under Canadian privacy law (PIPEDA) and applicable regulations, you have the right to:</p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data (subject to legal retention requirements)</li>
            <li>Withdraw consent for non-essential data processing</li>
            <li>Request an export of your data in a portable format</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, email hello@quadropus.ai. We respond within 30 days.</p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">Cookies</h2>
          <p className="mt-3">
            Quadropus.ai uses minimal cookies. We use Vercel Analytics which is cookie-free and privacy-focused. We do not use advertising cookies or third-party tracking pixels. Essential cookies may be used for authentication and session management.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">Children</h2>
          <p className="mt-3">
            Quadropus.ai is not directed at individuals under 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, contact us and we will delete it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">Changes to This Policy</h2>
          <p className="mt-3">
            We may update this privacy policy from time to time. We will notify active subscribers via email at least 30 days before material changes take effect. The "last updated" date at the top reflects the most recent revision.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">Contact</h2>
          <p className="mt-3">
            Fundy Logic Inc.<br />
            New Brunswick, Canada<br />
            hello@quadropus.ai
          </p>
        </section>
      </div>
    </main>
  )
}
