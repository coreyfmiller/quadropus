import type { Metadata } from 'next'
import { DashboardNav } from '@/components/dashboard/nav'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
