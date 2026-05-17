import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/shared/theme-provider'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://creatorledger.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: 'Creator Ledger — The Financial OS for Creators',
  description: 'Track sponsorships, send invoices, scan receipts, forecast cash flow, and analyze contracts with AI. Built for creators on every platform.',
  keywords: ['creator finance', 'sponsorship tracker', 'creator invoices', 'youtube revenue', 'creator business', 'media kit', 'rate card', 'brand deal CRM'],
  authors: [{ name: 'Creator Ledger' }],
  openGraph: {
    type: 'website',
    title: 'Creator Ledger — Run your creator business like a real business',
    description: 'AI-powered finance tools made for creators. Track deals, send invoices, forecast cash flow, analyze contracts. Free during beta.',
    url: APP_URL,
    siteName: 'Creator Ledger',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creator Ledger — The Financial OS for Creators',
    description: 'AI-powered finance tools for creators. Free during beta.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
