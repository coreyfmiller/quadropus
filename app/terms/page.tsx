import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using the Quadropus.ai platform.',
  alternates: { canonical: 'https://quadropus.ai/terms' },
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-32 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Terms of Service</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated: July 26, 2026</p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/85">
        <section>
          <h2 className="text-lg font-medium text-foreground">1. Agreement</h2>
          <p className="mt-3">
            By accessing or using Quadropus.ai ("the Platform"), you agree to be bound by these Terms of Service. The Platform is operated by Fundy Logic Inc. ("we," "us," "our"), a corporation registered in New Brunswick, Canada. If you do not agree to these terms, do not use the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">2. Service Description</h2>
          <p className="mt-3">Quadropus.ai is an AI-powered business platform that provides:</p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>Website creation, hosting, and maintenance</li>
            <li>Search engine optimization and visibility monitoring</li>
            <li>AI-powered chat agents and automation tools</li>
            <li>Business analytics and reporting dashboard</li>
            <li>Content generation (blog posts, social media, marketing copy)</li>
          </ul>
          <p className="mt-3">
            Specific features available depend on your subscription tier. We reserve the right to modify, add, or remove features with 30 days notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">3. Subscription and Payment</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>A one-time setup fee covers your initial website build, AI chat agent, SEO configuration, and onboarding.</li>
            <li>Monthly subscriptions are billed in advance via Stripe.</li>
            <li>Prices are listed in USD. Canadian clients may be charged equivalent CAD.</li>
            <li>You may cancel at any time. Cancellation takes effect at the end of your current billing period.</li>
            <li>No refunds are provided for partial months or the one-time setup fee after work has begun.</li>
            <li>We may change pricing with 30 days written notice. Existing subscribers keep their current rate for 60 days after notice.</li>
            <li>Failed payments: We will retry 3 times over 10 days. If payment fails, your account may be suspended.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">4. Your Responsibilities</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>Provide accurate business information for your website and platform setup.</li>
            <li>Maintain the security of your account credentials.</li>
            <li>Comply with all applicable laws regarding your business operations.</li>
            <li>Ensure you have the right to use any content you provide (logos, photos, text).</li>
            <li>Respond to requests for information within a reasonable timeframe when needed for service delivery.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">5. Acceptable Use</h2>
          <p className="mt-3">You may not use the Platform for:</p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>Any illegal activity or to promote illegal services</li>
            <li>Distributing malware, spam, or phishing content</li>
            <li>Harassment, hate speech, or discriminatory content</li>
            <li>Impersonating other businesses or individuals</li>
            <li>Violating intellectual property rights of third parties</li>
            <li>Any activity that could damage, disable, or impair the Platform</li>
          </ul>
          <p className="mt-3">We reserve the right to suspend or terminate accounts that violate these terms without refund.</p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">6. Intellectual Property</h2>
          <h3 className="mt-4 text-base font-medium text-foreground">What you own:</h3>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>Your business name, logo, and brand assets</li>
            <li>Content you provide to us (photos, testimonials, business descriptions)</li>
            <li>Your customer data (collected via chatbots, forms, and other tools)</li>
            <li>Your domain name</li>
          </ul>
          <h3 className="mt-4 text-base font-medium text-foreground">What we own:</h3>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>The Quadropus.ai platform, code, UI, and infrastructure</li>
            <li>Our AI models, prompts, workflows, and proprietary systems</li>
            <li>The Quadropus brand, name, and associated marks</li>
          </ul>
          <h3 className="mt-4 text-base font-medium text-foreground">AI-generated content:</h3>
          <p className="mt-2">
            Blog posts, marketing copy, and other content generated by our AI systems on your behalf are licensed to you for use in your business. You may continue using this content if you cancel your subscription.
          </p>
          <h3 className="mt-4 text-base font-medium text-foreground">Website on cancellation:</h3>
          <p className="mt-2">
            If you cancel your subscription, your website will be taken offline within 30 days after your final billing period ends. Upon request, we will provide a static export of your website content (text, images) within 30 days of cancellation. The underlying code, design system, and platform integrations are not included in exports.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">7. AI Disclosure</h2>
          <p className="mt-3">
            Quadropus.ai uses artificial intelligence extensively. This includes website content generation, blog writing, chat agent responses, SEO analysis, and business recommendations. While we review and optimize AI output, we do not guarantee that AI-generated content is free of errors. You are responsible for reviewing content published on your website or sent to your customers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">8. Uptime and Availability</h2>
          <p className="mt-3">
            We strive to maintain high availability of the Platform but do not guarantee uninterrupted service. Planned maintenance will be communicated in advance when possible. We are not liable for downtime caused by third-party services (hosting providers, AI model providers, payment processors), force majeure events, or circumstances beyond our reasonable control.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">9. Limitation of Liability</h2>
          <p className="mt-3">
            To the maximum extent permitted by law:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>Quadropus.ai is provided "as is" without warranties of any kind, express or implied.</li>
            <li>We do not guarantee specific business outcomes (increased sales, higher rankings, more customers).</li>
            <li>We are not responsible for decisions made based on AI-generated insights or recommendations.</li>
            <li>Our total liability to you is limited to the fees you paid in the 12 months preceding the claim.</li>
            <li>We are not liable for indirect, incidental, special, consequential, or punitive damages.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">10. Indemnification</h2>
          <p className="mt-3">
            You agree to indemnify and hold harmless Fundy Logic Inc. from any claims, damages, or expenses arising from: your use of the Platform, your violation of these terms, content you provide, or your business operations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">11. Data Processing</h2>
          <p className="mt-3">
            When we process your customer data (information collected through chatbots, forms, or CRM features), we act as a data processor on your behalf. You are the data controller. We will:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>Process customer data only as necessary to provide the service</li>
            <li>Implement appropriate security measures to protect the data</li>
            <li>Not sell, share, or use customer data for our own purposes</li>
            <li>Delete customer data within 30 days of subscription cancellation</li>
            <li>Notify you within 72 hours of any data breach affecting your customer data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">12. Termination</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>You may cancel your subscription at any time through the Platform or by emailing hello@quadropus.ai.</li>
            <li>We may terminate your account for violation of these terms, non-payment, or illegal activity.</li>
            <li>On termination, your access to the Platform ends at the close of your billing period.</li>
            <li>We will retain your data for 90 days post-cancellation for your retrieval, then delete it.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">13. Governing Law</h2>
          <p className="mt-3">
            These terms are governed by the laws of the Province of New Brunswick, Canada. Any disputes will be resolved in the courts of New Brunswick. If any provision of these terms is found unenforceable, the remaining provisions continue in full effect.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">14. Changes to Terms</h2>
          <p className="mt-3">
            We may update these terms from time to time. Material changes will be communicated via email at least 30 days before they take effect. Continued use of the Platform after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground">15. Contact</h2>
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
