import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { DevAirBadge } from '@/components/DevAirBadge'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prize Survey - Live Event Polling',
  description: 'Real-time survey platform for events with live results and prize unlocks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <DevAirBadge />
          {children}
        </Providers>
      </body>
    </html>
  )
}
