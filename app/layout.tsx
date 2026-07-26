import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://quadropus.ai'),
  title: {
    default: 'Quadropus.ai — One AI Platform for Your Entire Business',
    template: '%s | Quadropus.ai',
  },
  description:
    'Build your presence. Grow your customers. Automate your work. Operate from one dashboard. The AI operating system for small and medium businesses in Atlantic Canada and beyond.',
  keywords: [
    'AI platform for business',
    'AI operating system SMB',
    'business automation AI',
    'AI website builder',
    'AI CRM',
    'AI chat agent for business',
    'small business AI platform',
    'Atlantic Canada AI',
    'AI SEO platform',
    'business AI dashboard',
    'Quadropus',
    'AI for small business',
  ],
  authors: [{ name: 'Quadropus.ai' }],
  creator: 'Quadropus.ai',
  publisher: 'Quadropus.ai',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Quadropus.ai — One AI Platform for Your Entire Business',
    description:
      'Build. Grow. Automate. Operate. One intelligent platform powered by the world\'s leading AI models for small and medium businesses.',
    url: 'https://quadropus.ai',
    siteName: 'Quadropus.ai',
    type: 'website',
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quadropus.ai — One AI Platform for Your Entire Business',
    description:
      'Build. Grow. Automate. Operate. The AI operating system for SMBs.',
    creator: '@quadropusai',
  },
  alternates: {
    canonical: 'https://quadropus.ai',
  },
  icons: {
    icon: [{ url: '/quadropus-logo.png' }],
    apple: [{ url: '/apple-icon.png' }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="antialiased bg-background text-foreground">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
