import type { Metadata } from 'next'
import Script from 'next/script'
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

// Sitewide structured data. Organization powers brand/knowledge-panel
// understanding; SoftwareApplication makes Caelo eligible for product rich
// results and gives answer engines (ChatGPT, Perplexity, Gemini) a citable,
// machine-readable description of what the product is and what it costs. No
// aggregateRating until we have real reviews — faking it risks a manual action.
const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Caelo',
  url: APP_URL,
  logo: `${APP_URL}/caelo-logo.png`,
  description: META_DESCRIPTION,
  email: 'support@usecaelo.com',
}

const SOFTWARE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Caelo',
  applicationCategory: 'FinanceApplication',
  applicationSubCategory: 'Bookkeeping & accounting software for creators',
  operatingSystem: 'Web',
  url: APP_URL,
  description: META_DESCRIPTION,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free during the founding beta; Pro from $9/mo for founding members.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([ORG_SCHEMA, SOFTWARE_SCHEMA]) }}
        />
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
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
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
