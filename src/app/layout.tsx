import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { ThemeProvider } from '@/components/shared/theme-provider'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://usecaelo.com'
const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID

// Homepage SEO title (≤60 chars, primary keyword first, brand last). Platform
// keywords (YouTube/TikTok/Instagram) live in the description, not the title.
const META_TITLE = 'Creator Accounting Software & Financial OS | Caelo'
const META_DESCRIPTION =
  'Caelo is the financial OS for creators — track sponsorships, scan receipts, analyze contracts, and forecast cash flow. Built for YouTube, TikTok & Instagram.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  // `default` is used verbatim for the homepage; `template` appends "| Caelo"
  // to any child page that sets a plain string title.
  title: {
    default: META_TITLE,
    template: '%s | Caelo',
  },
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
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
        {CLARITY_ID && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");`}
          </Script>
        )}
      </body>
    </html>
  )
}
