import Link from 'next/link'
import { Video, Handshake, ShieldCheck, BarChart2, Receipt, LineChart, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  youtubeConfigured: boolean
  youtubeAlreadyConnected: boolean
  userName: string
  primaryPlatform?: string | null
  primaryPain?: string | null
}

const PLATFORM_LABEL: Record<string, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  twitch: 'Twitch',
  podcasts: 'podcast',
  substack: 'Substack',
  twitter: 'X',
  multi: 'multi-platform',
  other: 'creator',
}

const PAIN_HEADING: Record<string, string> = {
  sponsorships: 'Let’s get those deals tracked',
  rates: 'Let’s figure out what you should charge',
  taxes: 'Let’s get tax season ready',
  cashflow: 'Let’s see what’s coming in',
  organize: 'Let’s get you organized',
  other: 'Pick anywhere to start',
}

type Tile = {
  title: string
  blurb: string
  cta: string
  href: string
  Icon: typeof Video
  accent: string
}

function buildTiles(opts: {
  youtubeConfigured: boolean
  youtubeAlreadyConnected: boolean
  primaryPain: string | null | undefined
  primaryPlatform: string | null | undefined
}): Tile[] {
  const { youtubeConfigured, youtubeAlreadyConnected, primaryPain, primaryPlatform } = opts

  const youtubeTile: Tile = {
    title: 'Connect YouTube',
    blurb: 'Auto-sync AdSense revenue every day. Read-only.',
    cta: 'Connect',
    href: '/api/oauth/youtube/start',
    Icon: Video,
    accent: 'bg-red-50 text-red-600',
  }
  const dealsTile: Tile = {
    title: 'Log your first deal',
    blurb: 'Track a sponsorship from outreach to payment.',
    cta: 'Add a deal',
    href: '/deals',
    Icon: Handshake,
    accent: 'bg-violet-50 text-violet-600',
  }
  const contractTile: Tile = {
    title: 'Analyze a contract',
    blurb: 'Drop a PDF — AI flags risky clauses in seconds.',
    cta: 'Try it free',
    href: '/contracts',
    Icon: ShieldCheck,
    accent: 'bg-emerald-50 text-emerald-600',
  }
  const benchmarksTile: Tile = {
    title: 'See sponsorship rates',
    blurb: 'What other creators charge for your niche and size.',
    cta: 'View benchmarks',
    href: '/benchmarks',
    Icon: BarChart2,
    accent: 'bg-blue-50 text-blue-600',
  }
  const expensesTile: Tile = {
    title: 'Log an expense',
    blurb: 'Scan a receipt with AI, or add it manually.',
    cta: 'Add expense',
    href: '/expenses',
    Icon: Receipt,
    accent: 'bg-amber-50 text-amber-600',
  }
  const forecastTile: Tile = {
    title: 'See your forecast',
    blurb: '90-day cash flow projection from deals and invoices.',
    cta: 'View forecast',
    href: '/forecast',
    Icon: LineChart,
    accent: 'bg-cyan-50 text-cyan-600',
  }

  const tiles: Tile[] = []
  const youtubeWorth =
    youtubeConfigured && !youtubeAlreadyConnected &&
    (primaryPlatform === 'youtube' || primaryPlatform === 'multi' || !primaryPlatform)

  if (youtubeWorth) tiles.push(youtubeTile)

  switch (primaryPain) {
    case 'sponsorships':
      tiles.push(dealsTile, contractTile)
      break
    case 'rates':
      tiles.push(benchmarksTile, contractTile, dealsTile)
      break
    case 'taxes':
      tiles.push(expensesTile, contractTile)
      if (tiles.length < 3) tiles.push(dealsTile)
      break
    case 'cashflow':
      tiles.push(forecastTile, dealsTile)
      break
    case 'organize':
    case 'other':
    default:
      tiles.push(dealsTile, contractTile)
      break
  }

  return tiles.slice(0, 3)
}

export function SetupCard({
  youtubeConfigured,
  youtubeAlreadyConnected,
  userName,
  primaryPlatform,
  primaryPain,
}: Props) {
  const first = userName.split(' ')[0]
  const platformLabel = primaryPlatform ? PLATFORM_LABEL[primaryPlatform] ?? '' : ''
  const heading = primaryPain && PAIN_HEADING[primaryPain]
    ? PAIN_HEADING[primaryPain]
    : 'Get set up in 60 seconds'

  const subhead = platformLabel
    ? `Built around your ${platformLabel} business — pick anywhere to start.`
    : 'Pick anywhere to start — you can come back to the rest later.'

  const tiles = buildTiles({ youtubeConfigured, youtubeAlreadyConnected, primaryPain, primaryPlatform })

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome, {first}
            </div>
            <h2 className="text-xl font-bold text-foreground">{heading}</h2>
            <p className="text-sm text-muted-foreground mt-1">{subhead}</p>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-3 ${tiles.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {tiles.map((step) => (
            <Link
              key={step.href}
              href={step.href}
              className="group rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${step.accent} mb-3`}>
                <step.Icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.blurb}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                {step.cta}
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
