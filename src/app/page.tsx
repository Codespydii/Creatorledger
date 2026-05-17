import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  FileText,
  Handshake,
  BarChart2,
  Receipt,
  ShieldCheck,
  Scale,
  Sparkles,
  ScanLine,
  LineChart,
  CheckCircle2,
  ArrowRight,
  Zap,
  Lock,
  CreditCard,
  Plus,
  Mail,
  UserPlus,
  Rocket,
  Video,
} from 'lucide-react'
import { ThemeToggle } from '@/components/shared/theme-toggle'

const painPoints = [
  'Tracking sponsorship payments in spreadsheets that no one updates',
  'Signing contracts you didn\'t fully understand and regretting it later',
  'Guessing your monthly income when an agency asks for a media kit',
  'Lost receipts piling up until tax season turns into a panic',
]

const aiFeatures = [
  {
    icon: ShieldCheck,
    title: 'AI Contract Analyzer',
    pitch: 'Upload any sponsorship brief — get red flags, missing protections, and negotiation suggestions in 15 seconds.',
    sample: ['Perpetual usage rights flagged', '12% below market rate', 'Missing kill fee clause'],
  },
  {
    icon: ScanLine,
    title: 'Receipt OCR',
    pitch: 'Snap a photo of any receipt. We pull out the vendor, amount, date, and tax category. Expense logged.',
    sample: ['B&H Photo · $1,847.32', 'Auto-categorized: Equipment', 'Saved in 3 seconds'],
  },
  {
    icon: Mail,
    title: 'Email-to-Deal',
    pitch: 'Paste a sponsorship email. AI extracts brand, amount, deliverables, and timing — a draft deal appears in your pipeline.',
    sample: ['Notion · $4,500 offer detected', '1 integrated + 2 IG stories', 'Stage: outreach'],
  },
  {
    icon: LineChart,
    title: 'Cash Flow Forecast',
    pitch: 'See exactly where your money is headed over the next 90 days — based on real deals, not guesses.',
    sample: ['+$14,200 net by Aug 1', 'Cash gap detected Jul 18', '5 inflow sources tracked'],
  },
]

const allFeatures = [
  { icon: TrendingUp, title: 'Revenue Tracking', desc: 'Log every income stream — AdSense, sponsorships, affiliate, merch, memberships. See the full picture in one place.' },
  { icon: Receipt, title: 'Expense Tracking', desc: 'Categorize by tax bucket, attach receipts, see margin in real time. Year-end report in one click.' },
  { icon: FileText, title: 'Pro Invoices', desc: 'Branded PDFs with auto-reminders and one-click Stripe payment links. Get paid 3× faster.' },
  { icon: Handshake, title: 'Deal Pipeline', desc: 'Drag-and-drop Kanban from prospect to paid. Track every brand relationship without losing one to your inbox.' },
  { icon: Scale, title: 'Rate Benchmarks', desc: 'Anonymous data from creators in your niche & size. Score every offer against the market before you respond.' },
  { icon: Sparkles, title: 'Public Media Kit', desc: 'A beautiful, brand-ready page at creatorledger/m/you — auto-filled from your channel stats, shareable in one click.' },
  { icon: Video, title: 'YouTube Auto-Sync', desc: 'Connect once. Your AdSense revenue lands in your books every morning — no manual entry, no missing months.' },
  { icon: BarChart2, title: 'Reports & Insights', desc: 'P&L by month, revenue by source, deal velocity, expense breakdowns — everything your accountant wishes you had.' },
]

const howItWorks = [
  { icon: UserPlus, step: '01', title: 'Sign up free', desc: 'No credit card. Takes about 30 seconds. You\'re in the dashboard before you finish your coffee.' },
  { icon: Zap, step: '02', title: 'Add what you have', desc: 'Connect YouTube for auto-sync, scan a receipt, or paste a sponsorship email. The AI takes it from there.' },
  { icon: Rocket, step: '03', title: 'Run the business', desc: 'Track deals, send invoices, analyze contracts, forecast cash flow. Replace 6 spreadsheets with one dashboard.' },
]

const platforms = ['YouTube', 'Instagram', 'TikTok', 'Twitch', 'Podcasts', 'Substack', 'Patreon', 'Twitter']

const pricingTiers = [
  {
    name: 'Beta',
    price: 'Free',
    sub: 'For now',
    cta: 'Start free',
    href: '/signup',
    highlight: true,
    features: [
      'Unlimited everything',
      'All AI features',
      'YouTube revenue sync',
      'No credit card required',
      '50% off Pro forever for first 100',
    ],
  },
  {
    name: 'Pro',
    price: '$19',
    sub: '/month · post-beta',
    cta: 'Beta first',
    href: '/signup',
    highlight: false,
    features: [
      'Everything in Beta',
      'Priority support',
      'Advanced reports',
      'CSV / data export',
      'Custom invoice branding',
    ],
  },
  {
    name: 'Enterprise',
    price: '$49',
    sub: '/month',
    cta: 'Coming soon',
    href: '/signup',
    highlight: false,
    features: [
      'Everything in Pro',
      'Team members & roles',
      'Manager / accountant access',
      'White-label media kits',
      'API access',
    ],
  },
]

const faq = [
  {
    q: 'Who is this for?',
    a: 'Any creator earning real income from sponsorships, ad revenue, merch, or memberships — from your first paid deal to your hundredth. YouTube, Instagram, TikTok, Twitch, podcasts, Substack — it doesn\'t matter where your audience lives.',
  },
  {
    q: 'How is this different from QuickBooks or FreshBooks?',
    a: 'Those are built for general small businesses. Creator Ledger is built specifically for creator economics — sponsorship CRM, AI contract review, rate benchmarks, YouTube revenue auto-import, and a public media kit. None of which traditional accounting tools do.',
  },
  {
    q: 'Is my financial data safe?',
    a: 'Yes. All sensitive credentials (YouTube tokens, Stripe keys) are AES-256 encrypted at rest. Sessions are HTTPS-only with JWT. Your data is yours — export anytime, delete the account anytime.',
  },
  {
    q: 'Do I need a credit card to sign up?',
    a: 'No. Beta is free with no card on file. When Pro launches, you\'ll have plenty of warning and the first 100 beta users keep 50% off forever.',
  },
  {
    q: 'I\'m not a YouTuber. Can I still use it?',
    a: 'Absolutely. The deal CRM, invoices, expenses, rate benchmarks, contract analyzer, receipt OCR, and forecasting work for any creator on any platform. Auto-revenue-sync is YouTube-only today, with Instagram, TikTok, Patreon, and Substack coming next.',
  },
  {
    q: 'What if I already have an accountant?',
    a: 'Even better. Creator Ledger gives them clean, categorized data so they spend less time on bookkeeping and more time saving you money. Manager access is on the roadmap.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-foreground">Creator Ledger</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-3 sm:px-4 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b from-violet-50 via-background to-background dark:from-violet-950/20"
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
            Beta · First 100 creators get 50% off Pro forever
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6 max-w-3xl mx-auto">
            Run your creator business{' '}
            <span className="text-primary">like a real business.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Track sponsorships, send invoices, scan receipts, forecast cash flow, and analyze contracts with AI — built for creators on every platform, at every size.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm w-full sm:w-auto"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background px-6 text-base font-medium text-foreground hover:bg-accent transition-colors w-full sm:w-auto"
            >
              See features
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No credit card</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Free during beta</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Cancel anytime</span>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Made for creators on
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {platforms.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* PRODUCT PREVIEW MOCKUP */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Browser frame */}
            <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/70" />
              </div>
              <div className="mx-auto rounded-md bg-background px-3 py-1 text-xs text-muted-foreground font-mono">
                creatorledger.app/dashboard
              </div>
            </div>
            {/* Fake dashboard */}
            <div className="p-6 sm:p-8 bg-slate-50/50 dark:bg-background">
              <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-bold text-foreground">Good morning, Alex</h2>
                  <p className="text-xs text-muted-foreground">Thursday, May 15</p>
                </div>
                <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">+ Add Revenue</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <MockStat label="Revenue MTD" value="$18,420" change="+24%" positive />
                <MockStat label="Expenses MTD" value="$3,210" change="−12%" positive />
                <MockStat label="Net Profit" value="$15,210" change="+31%" positive />
                <MockStat label="Outstanding" value="$8,500" change="2 invoices" positive={false} />
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-foreground">Revenue vs Expenses · 6mo</span>
                  <span className="text-xs text-muted-foreground">$94,210 total</span>
                </div>
                {/* Fake chart with SVG */}
                <svg viewBox="0 0 400 80" className="w-full h-20" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,60 L40,55 L80,40 L120,45 L160,30 L200,32 L240,20 L280,25 L320,15 L360,18 L400,8 L400,80 L0,80 Z" fill="url(#grad)" />
                  <path d="M0,60 L40,55 L80,40 L120,45 L160,30 L200,32 L240,20 L280,25 L320,15 L360,18 L400,8" stroke="#7c3aed" strokeWidth="2" fill="none" />
                </svg>
              </div>

              {/* Active deals strip */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-foreground">Active Deals</span>
                    <span className="text-[10px] text-muted-foreground">3 in pipeline</span>
                  </div>
                  <div className="space-y-2">
                    <MockDeal brand="Notion" amount="$4,500" stage="Contracted" tone="emerald" />
                    <MockDeal brand="Squarespace" amount="$3,200" stage="Negotiation" tone="amber" />
                    <MockDeal brand="Riverside" amount="$2,800" stage="Outreach" tone="violet" />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-foreground">Upcoming Invoices</span>
                    <span className="text-[10px] text-muted-foreground">$8,500 due</span>
                  </div>
                  <div className="space-y-2">
                    <MockInvoice client="Acme Co" amount="$3,500" due="Due in 4 days" />
                    <MockInvoice client="Bright Labs" amount="$2,200" due="Due in 9 days" />
                    <MockInvoice client="HelloFresh" amount="$2,800" due="Due in 14 days" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Sound familiar?</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Spreadsheets weren&apos;t built for this.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {painPoints.map((p) => (
              <div key={p} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                  <span className="block h-0.5 w-2.5 rounded-full bg-red-500" />
                </span>
                <p className="text-sm text-foreground leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">From zero to running</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Three steps. Sixty seconds.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {howItWorks.map(({ icon: Icon, step, title, desc }, i) => (
            <div key={step} className="relative">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-2xl font-bold text-muted-foreground/40 tabular-nums">{step}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
              {i < howItWorks.length - 1 && (
                <ArrowRight
                  aria-hidden
                  className="hidden md:block absolute top-1/2 -right-3 h-5 w-5 text-muted-foreground/40 -translate-y-1/2 z-10"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* AI KILLER FEATURES */}
      <section id="features" className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">AI built for creators</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Features no spreadsheet can give you.</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Four AI superpowers that turn admin work into a 5-second tap.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-5xl mx-auto">
            {aiFeatures.map(({ icon: Icon, title, pitch, sample }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{pitch}</p>
                <div className="space-y-1.5 rounded-lg border border-border bg-background p-3">
                  {sample.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-xs text-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALL FEATURES */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Everything you need to run the business side.</h2>
          <p className="text-base text-muted-foreground">One dashboard. Twelve features. Zero spreadsheets.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allFeatures.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Simple, creator-friendly pricing.</h2>
          <p className="text-base text-muted-foreground">Free during beta. Paid plans launch after we hit 500 active creators.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">No surprise charges.</span> We&apos;ll email you 30 days before anything is billed — your data stays free either way.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-7 flex flex-col ${
                tier.highlight
                  ? 'border-primary bg-card shadow-lg ring-1 ring-primary/30 relative'
                  : 'border-border bg-card shadow-sm'
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                  Available now
                </span>
              )}
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.sub}</span>
                </div>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors ${
                  tier.highlight
                    ? 'bg-primary text-white hover:bg-violet-700'
                    : 'border border-border bg-background text-foreground hover:bg-accent'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <TrustItem icon={Lock} title="Encrypted at rest" desc="AES-256 on all sensitive credentials. Your data is yours." />
            <TrustItem icon={CreditCard} title="No card required" desc="Sign up in 30 seconds. Cancel any time. Export your data on the way out." />
            <TrustItem icon={Zap} title="Built in public" desc="Roadmap is open. Feature requests go straight to the founder." />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 sm:px-6 py-20 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Questions, answered.</h2>
          <p className="text-base text-muted-foreground">If something isn&apos;t here, just email us once you sign up.</p>
        </div>
        <div className="space-y-3">
          {faq.map(({ q, a }) => (
            <details key={q} className="group rounded-xl border border-border bg-card p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer select-none items-start justify-between gap-3 list-none">
                <span className="font-semibold text-foreground">{q}</span>
                <Plus className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-border bg-gradient-to-b from-background to-violet-50 dark:to-violet-950/20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Stop guessing. Start running.
          </h2>
          <p className="text-base text-muted-foreground mb-8 max-w-xl mx-auto">
            Set up takes 60 seconds. You can connect your YouTube channel, scan a receipt, and analyze your first contract before your next cup of coffee.
          </p>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm"
          >
            Claim your beta spot <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            Free forever during beta · No credit card · Cancel anytime
          </p>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                  <DollarSign className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold text-foreground">Creator Ledger</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Run your creator business like a real business. Built solo, in public.
              </p>
            </div>
            <FooterCol
              title="Product"
              links={[
                { href: '#features', label: 'Features' },
                { href: '#pricing', label: 'Pricing' },
                { href: '#faq', label: 'FAQ' },
              ]}
            />
            <FooterCol
              title="Get started"
              links={[
                { href: '/signup', label: 'Sign up free' },
                { href: '/login', label: 'Sign in' },
                { href: '/forgot-password', label: 'Forgot password' },
              ]}
            />
            <FooterCol
              title="Account"
              links={[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/settings', label: 'Settings' },
              ]}
            />
            <FooterCol
              title="Legal"
              links={[
                { href: '/legal/terms', label: 'Terms of Service' },
                { href: '/legal/privacy', label: 'Privacy Policy' },
              ]}
            />
          </div>
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Creator Ledger. All rights reserved.</p>
            <p>Made for creators.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function MockStat({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className={`mt-1 text-[10px] font-medium ${positive ? 'text-emerald-600' : 'text-amber-600'}`}>{change}</div>
    </div>
  )
}

const TONE_STYLES: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  violet: 'bg-violet-100 text-violet-700',
}

function MockDeal({ brand, amount, stage, tone }: { brand: string; amount: string; stage: string; tone: 'emerald' | 'amber' | 'violet' }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-medium ${TONE_STYLES[tone]}`}>{stage}</span>
        <span className="text-foreground truncate">{brand}</span>
      </div>
      <span className="font-semibold text-foreground shrink-0">{amount}</span>
    </div>
  )
}

function MockInvoice({ client, amount, due }: { client: string; amount: string; due: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex flex-col min-w-0">
        <span className="text-foreground truncate">{client}</span>
        <span className="text-[10px] text-muted-foreground">{due}</span>
      </div>
      <span className="font-semibold text-foreground shrink-0">{amount}</span>
    </div>
  )
}

function TrustItem({ icon: Icon, title, desc }: { icon: typeof Lock; title: string; desc: string }) {
  return (
    <div>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
