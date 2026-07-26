import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geistSans = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quadropus.ai — One AI platform for your entire business',
  description:
    'Build your presence. Grow your customers. Automate your work. Operate from one dashboard. The AI platform for small and medium businesses.',
  generator: 'v0.app',
  openGraph: {
    title: 'Quadropus.ai — One AI platform for your entire business',
    description:
      'Build. Grow. Automate. Operate. One intelligent platform for small and medium businesses.',
    type: 'website',
    siteName: 'Quadropus.ai',
  },
  icons: {
    icon: [{ url: '/quadropus-logo.png' }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased bg-background text-foreground">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
