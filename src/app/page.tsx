import Image from 'next/image'
import Link from 'next/link'
import {
  TrendingUp,
  FileText,
  Handshake,
  ShieldCheck,
  Scale,
  Mail,
  LineChart,
  ScanLine,
  CheckCircle2,
  Plus,
  Sparkles,
  Globe2,
  BarChart2,
  ArrowRight,
  X,
} from 'lucide-react'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { PLATFORMS, YouTubeIcon } from '@/components/shared/platform-icons'
import { getFoundingStats, BETA_LENGTH_WEEKS } from '@/lib/beta'

const CONTACT_EMAIL = 'support@usecaelo.com'

// Re-check the live founding-spot count at most once a minute; the page is
// otherwise static marketing.
export const revalidate = 60

const painPoints = [
  'Your spreadsheet breaks the moment you earn from 5+ income streams.',
  'QuickBooks doesn’t know what a kill fee is.',
  'You’ve already signed a bad contract. You just don’t know it yet.',
]

const everythingElse = [
  {
    icon: ScanLine,
    title: 'AI receipt scanner',
    desc: 'Snap a photo, the AI fills in vendor, amount, date and category. Zero manual entry.',
  },
  {
    icon: Mail,
    title: 'AI email scanner',
    desc: 'Paste a sponsorship email — brand, value, deliverables and deadlines extracted in 5 seconds.',
  },
  {
    icon: FileText,
    title: 'Invoices + Stripe',
    desc: 'Professional PDF invoices with embedded Stripe payment links. Get paid 3× faster.',
  },
  {
    icon: LineChart,
    title: '90-day cash forecast',
    desc: 'See what’s landing before it hits your account. AdSense pays 2 months late — forecast accounts for it.',
  },
  {
    icon: Scale,
    title: 'Anonymised rate benchmarks',
    desc: 'See what creators your size actually earn per integration. Contribute, unlock the dataset.',
  },
  {
    icon: Sparkles,
    title: 'Public media kit',
    desc: 'Shareable rate-card page at usecaelo.com/m/you, auto-filled from your channel stats.',
  },
  {
    icon: Globe2,
    title: 'Multi-currency display',
    desc: 'USD, GBP, EUR, CAD, AUD, INR — pick one in settings, the whole app respects it.',
  },
  {
    icon: BarChart2,
    title: 'Tax-ready reports',
    desc: 'P&L by month, revenue by source, expense breakdown by category. Hand it to your accountant.',
  },
]

// Each line maps one Caelo feature to a distinct real tool a creator would
// otherwise pay for. Prices are the published month-to-month rates verified in
// June 2026 (QuickBooks Solopreneur $20, FreshBooks Lite $19, Expensify Collect
// $5, HubSpot Starter $20, LegalZoom Legal Advantage $35, Float $59, Beacons
// Creator $10). The "otherwise" total is summed in code so it can't drift.
const simplerStack: Array<{
  icon: React.ComponentType<{ className?: string }>
  feature: string
  replaces: string
  price: number
}> = [
  { icon: BarChart2, feature: 'Creator bookkeeping & P&L', replaces: 'QuickBooks Solopreneur', price: 20 },
  { icon: FileText, feature: 'Invoices + Stripe payment links', replaces: 'FreshBooks', price: 19 },
  { icon: ScanLine, feature: 'AI receipt scanning', replaces: 'Expensify', price: 5 },
  { icon: Handshake, feature: 'Brand-deal CRM pipeline', replaces: 'HubSpot Starter', price: 20 },
  { icon: ShieldCheck, feature: 'AI contract review', replaces: 'LegalZoom', price: 35 },
  { icon: LineChart, feature: '90-day cash forecast', replaces: 'Float', price: 59 },
  { icon: Sparkles, feature: 'Public media kit', replaces: 'Beacons', price: 10 },
]
const stackTotal = simplerStack.reduce((sum, s) => sum + s.price, 0)

const stats = [
  { value: '11', label: 'Income stream types tracked' },
  { value: '5 sec', label: 'To scan a contract with AI' },
  { value: '$0', label: 'To join the founding beta' },
  { value: '90 days', label: 'Cash forecast horizon' },
]

const freeFeatures = [
  'Revenue tracker — 11 income stream types',
  'Expense tracker with AI receipt scanning',
  'AI contract analyzer (5 scans / month)',
  'Invoice generator with PDF download',
  'YouTube AdSense auto-sync via OAuth',
  'Multi-currency: USD, GBP, EUR, CAD, AUD, INR',
]
const proFeatures = [
  'Everything in Free Beta',
  'Unlimited AI contract scans',
  'AI email scanner',
  'Brand deal CRM — full kanban pipeline',
  '90-day cash forecast',
  'Anonymised rate benchmarks',
  'Priority support',
]
const agencyFeatures = [
  'Everything in Pro',
  'Up to 5 creator accounts',
  'White-label invoices',
  'Team access and permissions',
]

const faq = [
  {
    q: 'Who is this for?',
    a: 'Any creator earning real income from sponsorships, ad revenue, merch, or memberships — from your first paid deal to your hundredth. YouTube, Instagram, TikTok, Twitch, Spotify, Substack, X — it doesn\'t matter where your audience lives.',
  },
  {
    q: 'How is this different from QuickBooks or FreshBooks?',
    a: 'Those are built for general small businesses. Caelo is built specifically for creator economics — sponsorship CRM, AI contract review, rate benchmarks, YouTube revenue auto-import, and a public media kit. None of which traditional accounting tools do.',
  },
  {
    q: 'Is my financial data safe?',
    a: 'Yes. All sensitive credentials (YouTube tokens, Stripe keys) are AES-256 encrypted at rest. Sessions are HTTPS-only with JWT. Your data is yours — export anytime, delete the account anytime.',
  },
  {
    q: 'Do I need a credit card to sign up?',
    a: 'No. Beta is free with no card on file. Founding members lock in $9/mo forever — but only once Pro launches, and you\'ll have plenty of warning before anything is billed.',
  },
  {
    q: 'I\'m not a YouTuber. Can I still use it?',
    a: 'Absolutely. The deal CRM, invoices, expenses, rate benchmarks, contract analyzer, receipt OCR, and forecasting work for any creator on any platform. Auto-revenue-sync is YouTube-only today, with Instagram, TikTok, Patreon, and Substack coming next.',
  },
  {
    q: 'What if I already have an accountant?',
    a: 'Even better. Caelo gives them clean, categorized data so they spend less time on bookkeeping and more time saving you money. Manager access is on the roadmap.',
  },
]

export default async function LandingPage() {
  const { left: spotsLeft, cap: foundingCap, isFull: foundingFull } = await getFoundingStats()
  return (
    <div className="min-h-screen bg-background">
      {/* SECTION 1 — NAVBAR */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid h-16 grid-cols-[1fr_auto_1fr] items-center">
          <Link href="/" className="flex items-center gap-2" aria-label="Caelo home">
            <Image src="/caelo-logo.png" alt="Caelo" width={125} height={36} priority className="h-9 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 justify-self-end">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            >
              Join Free Beta
            </Link>
          </div>
        </div>
      </nav>

      {/* SECTION 2 — HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b from-violet-50 via-background to-background dark:from-violet-950/20"
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {foundingFull
              ? 'Free beta · Founding spots full'
              : `Free beta · ${spotsLeft} of ${foundingCap} founding spots left`}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6 max-w-3xl mx-auto">
            Run your creator business{' '}
            <span className="text-primary">like a real business.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Track sponsorships, scan receipts with AI, catch dangerous contract clauses before you sign, and forecast cash flow &mdash; built for creators on every platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
            >
              Start free — no card <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 text-base font-medium text-foreground transition-colors hover:border-foreground/30"
            >
              See how it works
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Founding members lock in $9/mo forever
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Cancel anytime
            </span>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Made for creators on
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PLATFORMS.map(({ name, Icon }) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* PRODUCT PREVIEW MOCKUP */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/70" />
              </div>
              <div className="mx-auto rounded-md bg-background px-3 py-1 text-xs text-muted-foreground font-mono">
                usecaelo.com/dashboard
              </div>
            </div>
            <Image
              src="/dashboard-preview-light.png"
              alt="The Caelo dashboard showing revenue, expenses, net profit, and revenue-by-source for a creator business"
              width={1305}
              height={563}
              priority
              className="w-full h-auto block dark:hidden"
            />
            <Image
              src="/dashboard-preview-dark.png"
              alt="The Caelo dashboard showing revenue, expenses, net profit, and revenue-by-source for a creator business"
              width={1304}
              height={554}
              priority
              className="w-full h-auto hidden dark:block"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3 — PAIN STRIP */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {painPoints.map((p) => (
              <div
                key={p}
                className="rounded-xl border border-border bg-card p-5 text-sm text-foreground leading-relaxed"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — FEATURE SHOWCASE (alternating image + text) */}
      <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
            Built for the creator P&amp;L
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Everything built for how creators actually earn.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Not adapted from small-business software. Built from scratch for your income model.
          </p>
        </div>

        <div className="space-y-20 sm:space-y-28">
          {/* Row 1 — YouTube AdSense auto-sync */}
          <ShowcaseRow
            eyebrowLabel="YouTube auto-sync"
            eyebrowIcon={YouTubeIcon}
            eyebrowColor="red"
            title="Your AdSense revenue, logged for you every morning."
            description="Connect once with Google OAuth. Every day at 4 AM, your YouTube AdSense earnings sync into the dashboard — broken down by channel, ready for reports. No CSVs, no manual entry, no missing months ever again."
            bullets={[
              '30-second OAuth — no API keys to copy',
              'Daily auto-sync, historical backfill on connect',
              'Channel stats kept fresh for your media kit',
            ]}
            visual={<YouTubeSyncMock />}
            reverse={false}
          />

          {/* Row 2 — Revenue + Expense tracking */}
          <ShowcaseRow
            eyebrowLabel="Revenue + Expense tracking"
            eyebrowIcon={TrendingUp}
            eyebrowColor="violet"
            title="Eleven income streams. One dashboard. Real margin."
            description="AdSense, sponsorships, affiliates, Patreon, memberships, merch, tips, courses, services, refunds, other — tracked separately, reported together. Pair it with categorized expenses and you finally see your true profit, not just gross income."
            bullets={[
              '11 income stream types, color-coded',
              'Expense categories that match creator tax buckets',
              'Live profit margin, not month-end surprises',
            ]}
            visual={<RevenueExpenseMock />}
            reverse={true}
          />

          {/* Row 3 — AI Contract Analyzer */}
          <ShowcaseRow
            eyebrowLabel="AI Contract Analyzer"
            eyebrowIcon={ShieldCheck}
            eyebrowColor="emerald"
            title="Catch the bad clauses before you sign them."
            description="Drop in a sponsorship PDF. In 5 seconds, AI flags perpetual usage rights, missing kill fees, open-ended exclusivity and below-market rates — with counter-language ready to paste into your reply."
            bullets={[
              'Perpetual rights, exclusivity & kill-fee detection',
              'Rate benchmarked against creators your size',
              'Negotiation counter-text written for you',
            ]}
            visual={<ContractAnalyzerMock />}
            reverse={false}
          />

          {/* Row 4 — Brand Deal CRM */}
          <ShowcaseRow
            eyebrowLabel="Brand Deal CRM"
            eyebrowIcon={Handshake}
            eyebrowColor="amber"
            title="Every deal, every stage — no more lost threads."
            description="Kanban pipeline from outreach to paid. Drag deals across stages, set follow-up reminders, track deliverables and deadlines. Replace the inbox folder you keep meaning to organize."
            bullets={[
              'Drag-and-drop pipeline, six stages',
              'Auto-reminders on stale deals',
              'Pipeline value rolled up into the forecast',
            ]}
            visual={<DealsKanbanMock />}
            reverse={true}
          />
        </div>
      </section>

      {/* SECTION 4.5 — EVERYTHING ELSE */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight">
              And everything else built in.
            </h2>
            <p className="text-base text-muted-foreground">
              You shouldn&apos;t need five subscriptions to run a creator business.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {everythingElse.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 mb-3">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4.6 — A SIMPLER STACK (cost comparison) */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">A simpler stack</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Stop paying for seven apps to run one business.
            </h2>
            <p className="text-base text-muted-foreground">
              Most creators stitch together a bookkeeping tool, an invoicer, a receipt scanner, a CRM, a
              contract reviewer and more. Caelo is all of it &mdash; for less than any single one.
            </p>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-violet-100/60 via-transparent to-emerald-100/40 blur-2xl dark:from-violet-900/20 dark:to-emerald-900/10"
            />
            <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
              <ul className="divide-y divide-border">
                {simplerStack.map(({ icon: Icon, feature, replaces, price }) => (
                  <li key={feature} className="flex items-center gap-4 px-5 sm:px-6 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground">{feature}</div>
                      <div className="text-xs text-muted-foreground">
                        Replaces <span className="font-medium text-foreground/70">{replaces}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
                      ${price}
                      <span className="text-xs font-normal text-muted-foreground">/mo</span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* What you'd spend otherwise */}
              <div className="flex items-center gap-4 border-t border-border px-5 sm:px-6 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/40">
                  <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 text-sm font-medium text-muted-foreground">
                  What you&rsquo;d spend otherwise
                </div>
                <div className="shrink-0 text-sm font-semibold text-red-500 line-through tabular-nums">
                  ${stackTotal}/mo
                </div>
              </div>

              {/* Caelo */}
              <div className="flex items-center gap-4 bg-emerald-50 px-5 sm:px-6 py-5 dark:bg-emerald-950/30">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    Caelo &mdash; everything above
                  </div>
                  <div className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                    Founding price, locked forever
                  </div>
                </div>
                <div className="shrink-0 text-xl font-bold text-emerald-700 tabular-nums dark:text-emerald-300">
                  $9<span className="text-sm font-medium">/mo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
            >
              Replace your whole stack <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-[11px] text-muted-foreground text-center">
              Competitor prices are public month-to-month rates as of {new Date().getFullYear()}. Caelo founding
              price; $19/mo after.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5 — HOW IT WORKS */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Getting started</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Up and running in 5 minutes.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Step
              n="01"
              title="Connect YouTube"
              desc="OAuth takes 30 seconds. AdSense syncs automatically every day — no manual entry, ever."
            />
            <Step
              n="02"
              title="Add every income stream"
              desc="Log sponsorships, affiliates, Patreon, merch, tips. Scan expense receipts with your camera. See your full financial picture for the first time."
            />
            <Step
              n="03"
              title="Drop in a contract"
              desc="Upload any sponsorship PDF. The AI flags every risky clause with negotiation counters before you sign."
            />
          </div>
        </div>
      </section>

      {/* SECTION 6 — HONEST STATS */}
      <section className="border-t border-border bg-emerald-50/60 dark:bg-emerald-950/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl sm:text-4xl font-bold text-foreground tabular-nums">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Simple pricing. No surprises.</h2>
          <p className="text-base text-muted-foreground">
            Start free. Founding members lock in 50% off forever.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto items-stretch">
          {/* Plan 1 — Free Beta */}
          <PlanCard
            name="Free Beta"
            price="$0"
            unit="/ month"
            subtitle="Free during beta"
            features={freeFeatures}
            ctaLabel="Join free beta →"
            ctaHref="/signup"
          />

          {/* Plan 2 — Pro (popular) */}
          <div className="relative rounded-2xl border-2 border-primary bg-card p-7 flex flex-col shadow-xl ring-1 ring-primary/20">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white">
              Founding member — 50% off, locked forever
            </span>
            <h3 className="text-lg font-semibold text-foreground">Pro</h3>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground line-through">$19</span>
                <span className="text-4xl font-bold text-foreground">$9</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                {foundingFull
                  ? 'Founding spots are full — Pro is $19/mo'
                  : `${spotsLeft} of ${foundingCap} founding spots left — then $19/mo`}
              </p>
            </div>
            <ul className="mt-6 space-y-2.5 mb-6 flex-1">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
            >
              Claim founding spot →
            </Link>
          </div>

          {/* Plan 3 — Agency */}
          <PlanCard
            name="Agency"
            price="$99"
            unit="/ month"
            subtitle="For creator agencies — coming soon"
            features={agencyFeatures}
            ctaLabel="Coming soon"
            comingSoon
          />
        </div>
      </section>

      {/* SECTION 7.5 — FAQ */}
      <section id="faq" className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Questions, answered.</h2>
            <p className="text-base text-muted-foreground">
              If something isn&apos;t here, just email us once you sign up.
            </p>
          </div>
          <div className="space-y-3">
            {faq.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-border bg-card p-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer select-none items-start justify-between gap-3 list-none">
                  <span className="font-semibold text-foreground">{q}</span>
                  <Plus
                    aria-hidden
                    className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                  />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — FINAL CTA */}
      <section className="border-t border-border bg-gradient-to-b from-violet-50 to-background dark:from-violet-950/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Join the founding beta &mdash; {foundingCap} spots
          </h2>
          <p className="text-base text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            Free access during our {BETA_LENGTH_WEEKS}-week founding beta &mdash; no credit card.
            The first {foundingCap} creators lock in{' '}
            <span className="font-semibold text-foreground">$9/mo</span>, half off Pro; after that it&apos;s $19.{' '}
            {foundingFull ? 'Founding spots are now full.' : `Only ${spotsLeft} left.`}
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
            >
              Claim your founding spot <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-muted-foreground">
              Free during beta &middot; No credit card &middot; Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 9 — FOOTER */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src="/caelo-logo.png" alt="Caelo" width={97} height={28} className="h-7 w-auto" />
              <span className="hidden sm:inline text-xs text-muted-foreground">
                The financial OS for full-time creators.
              </span>
            </div>
            <div className="flex items-center gap-5 text-xs">
              <Link href="/legal/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/legal/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Caelo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary tabular-nums">
          {n}
        </span>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}

function PlanCard({
  name,
  price,
  unit,
  subtitle,
  features,
  ctaLabel,
  ctaHref,
  comingSoon = false,
}: {
  name: string
  price: string
  unit: string
  subtitle?: string
  features: string[]
  ctaLabel: string
  ctaHref?: string
  comingSoon?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-7 flex flex-col shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">{name}</h3>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-foreground">{price}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      {subtitle && <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>}
      <ul className="mt-6 space-y-2.5 mb-6 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {comingSoon ? (
        <span
          aria-disabled="true"
          className="inline-flex h-10 cursor-default items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 px-4 text-sm font-semibold text-muted-foreground"
        >
          {ctaLabel}
        </span>
      ) : (
        <Link
          href={ctaHref ?? '#'}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}

const EYEBROW_TONES: Record<string, string> = {
  red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300',
  violet: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  amber: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
}

interface ShowcaseRowProps {
  eyebrowLabel: string
  eyebrowIcon: React.ComponentType<{ className?: string }>
  eyebrowColor: 'red' | 'violet' | 'emerald' | 'amber'
  title: string
  description: string
  bullets: string[]
  visual: React.ReactNode
  reverse: boolean
}

function ShowcaseRow({
  eyebrowLabel,
  eyebrowIcon: EyebrowIcon,
  eyebrowColor,
  title,
  description,
  bullets,
  visual,
  reverse,
}: ShowcaseRowProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <div className={reverse ? 'lg:order-2' : 'lg:order-1'}>
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${EYEBROW_TONES[eyebrowColor]} mb-5`}
        >
          <EyebrowIcon className="h-3.5 w-3.5" />
          {eyebrowLabel}
        </div>
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-4 leading-tight">
          {title}
        </h3>
        <p className="text-base text-muted-foreground leading-relaxed mb-6">{description}</p>
        <ul className="space-y-2.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={reverse ? 'lg:order-1' : 'lg:order-2'}>
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-violet-100/60 via-transparent to-emerald-100/40 blur-2xl dark:from-violet-900/20 dark:to-emerald-900/10"
          />
          {visual}
        </div>
      </div>
    </div>
  )
}

function YouTubeSyncMock() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <YouTubeIcon className="h-4 w-4" />
          <span className="text-xs font-semibold text-foreground">YouTube connection</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
        </span>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">@alextheCreator</div>
            <div className="text-[11px] text-muted-foreground">124K subscribers &middot; Last sync 4 hours ago</div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground">Last 7 days · AdSense</span>
            <span className="text-xs font-bold text-emerald-600">+$1,247.32</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 h-16 items-end">
            {[58, 72, 41, 88, 64, 92, 78].map((h, i) => (
              <div
                key={i}
                className="rounded-t bg-gradient-to-t from-violet-500 to-violet-400"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[9px] text-muted-foreground font-mono">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Next auto-sync in 4h 12m
        </div>
      </div>
    </div>
  )
}

function RevenueExpenseMock() {
  const streams: Array<{ name: string; amount: string; color: string; pct: number }> = [
    { name: 'Sponsorships', amount: '$8,200', color: 'bg-violet-500', pct: 44 },
    { name: 'YouTube AdSense', amount: '$4,820', color: 'bg-emerald-500', pct: 26 },
    { name: 'Affiliate', amount: '$2,400', color: 'bg-blue-500', pct: 13 },
    { name: 'Patreon', amount: '$1,800', color: 'bg-pink-500', pct: 10 },
    { name: 'Merch', amount: '$1,200', color: 'bg-amber-500', pct: 7 },
  ]
  return (
    <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
      <div className="border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Revenue this month</span>
          <span className="text-xs font-bold text-foreground">$18,420</span>
        </div>
      </div>
      <div className="p-5 space-y-3">
        {streams.map((s) => (
          <div key={s.name}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${s.color}`} />
                <span className="text-xs font-medium text-foreground">{s.name}</span>
              </div>
              <span className="text-xs font-semibold text-foreground tabular-nums">{s.amount}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className={`h-full ${s.color}`} style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
        <div className="pt-3 mt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Expenses (12 categorized)</span>
          <span className="text-xs font-semibold text-red-600">-$3,210</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">Net profit</span>
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">$15,210</span>
        </div>
      </div>
    </div>
  )
}

function ContractAnalyzerMock() {
  const flags: Array<{ severity: 'high' | 'medium' | 'low'; title: string }> = [
    { severity: 'high', title: 'Perpetual usage rights — recommend 12-month cap' },
    { severity: 'high', title: 'No kill fee — recommend 50% on cancel' },
    { severity: 'medium', title: 'Exclusivity is open-ended — scope to category + 90 days' },
    { severity: 'low', title: 'Below-market rate (-22% vs creators your size)' },
  ]
  return (
    <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
      <div className="border-b border-border bg-muted/40 px-4 py-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span className="text-xs font-semibold text-foreground">contract-acme-2025-05.pdf</span>
        <span className="ml-auto text-[10px] text-muted-foreground font-mono">scanned 5s ago</span>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">62 / 100</div>
            <div className="text-[10px] text-muted-foreground">Contract health score</div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
            Negotiate before signing
          </span>
        </div>
        <div className="space-y-2">
          {flags.map((f) => (
            <div
              key={f.title}
              className={`rounded-lg border px-3 py-2 text-[11px] ${
                f.severity === 'high'
                  ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
                  : f.severity === 'medium'
                  ? 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30'
                  : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    f.severity === 'high' ? 'bg-red-500' : f.severity === 'medium' ? 'bg-orange-500' : 'bg-amber-500'
                  }`}
                />
                <span className="text-foreground">{f.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DealsKanbanMock() {
  const cols: Array<{ name: string; count: number; deals: Array<{ brand: string; amount: string }> }> = [
    { name: 'Outreach', count: 3, deals: [{ brand: 'Riverside', amount: '$2.8K' }, { brand: 'Squarespace', amount: '$3.2K' }] },
    { name: 'Negotiating', count: 2, deals: [{ brand: 'Notion', amount: '$4.5K' }] },
    { name: 'Contracted', count: 4, deals: [{ brand: 'Acme Co', amount: '$5.2K' }, { brand: 'HelloFresh', amount: '$2.8K' }] },
  ]
  const colorByStage: Record<string, string> = {
    Outreach: 'border-violet-300 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/30',
    Negotiating: 'border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30',
    Contracted: 'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30',
  }
  return (
    <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
      <div className="border-b border-border bg-muted/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Handshake className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Brand deals · Q2</span>
        </div>
        <span className="text-[10px] text-muted-foreground">$18,500 in pipeline</span>
      </div>
      <div className="p-4 grid grid-cols-3 gap-2.5">
        {cols.map((col) => (
          <div key={col.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{col.name}</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">{col.count}</span>
            </div>
            {col.deals.map((d) => (
              <div
                key={d.brand}
                className={`rounded-md border px-2 py-1.5 ${colorByStage[col.name]}`}
              >
                <div className="text-[11px] font-semibold text-foreground truncate">{d.brand}</div>
                <div className="text-[10px] text-muted-foreground">{d.amount}</div>
              </div>
            ))}
            <div className="h-12 rounded-md border border-dashed border-border" />
          </div>
        ))}
      </div>
    </div>
  )
}

