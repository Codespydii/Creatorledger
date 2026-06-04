import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from '@/components/shared/theme-provider'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://usecaelo.com'

const META_TITLE = 'Caelo — Financial OS for Full-Time Creators'
const META_DESCRIPTION =
  'Track income from multiple sources, scan every expense with AI receipt capture, catch dangerous contract clauses before you sign, and forecast your cash flow — all in one dashboard built for full-time creators.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: META_TITLE,
  description: META_DESCRIPTION,
  keywords: [
    'creator finance',
    'sponsorship contract analyzer',
    'YouTube income tracker',
    'creator expense tracker',
    'brand deal CRM',
    'creator accounting',
  ],
  authors: [{ name: 'Caelo' }],
  openGraph: {
    type: 'website',
    title: META_TITLE,
    description: META_DESCRIPTION,
    url: APP_URL,
    siteName: 'Caelo',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: META_TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: META_TITLE,
    description: META_DESCRIPTION,
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground antialiased">
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            theme="system"
            richColors
            closeButton
            toastOptions={{ className: 'rounded-xl' }}
          />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
