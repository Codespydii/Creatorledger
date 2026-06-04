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
  Video,
  Sparkles,
  Globe2,
  BarChart2,
} from 'lucide-react'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { EmailCapture } from '@/components/shared/email-capture'

const CONTACT_EMAIL = 'mahipalsinghrajput476@gmail.com'

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
    desc: 'Shareable rate-card page at caelo.app/m/you, auto-filled from your channel stats.',
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

const platforms = ['YouTube', 'Instagram', 'TikTok', 'Twitch', 'Podcasts', 'Substack', 'Patreon', 'Twitter']

const faq = [
  {
    q: 'Who is this for?',
    a: 'Any creator earning real income from sponsorships, ad revenue, merch, or memberships — from your first paid deal to your hundredth. YouTube, Instagram, TikTok, Twitch, podcasts, Substack — it doesn\'t matter where your audience lives.',
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* SECTION 1 — NAVBAR */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-16 items-center justify-between">
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
          <div className="flex items-center gap-2 sm:gap-3">
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
            Free beta &middot; Founding spots open
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6 max-w-3xl mx-auto">
            Run your creator business{' '}
            <span className="text-primary">like a real business.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Track sponsorships, scan receipts with AI, catch dangerous contract clauses before you sign, and forecast cash flow &mdash; built for creators on every platform.
          </p>
          <div className="flex justify-center">
            <EmailCapture />
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
            <div className="p-6 sm:p-8 bg-slate-50/50 dark:bg-background">
              <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-foreground">Good morning, Alex</h3>
                  <p className="text-xs text-muted-foreground">Thursday, May 15</p>
                </div>
                <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  + Add Revenue
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <MockStat label="Revenue MTD" value="$18,420" change="+24%" positive />
                <MockStat label="Expenses MTD" value="$3,210" change="−12%" positive />
                <MockStat label="Net Profit" value="$15,210" change="+31%" positive />
                <MockStat label="Outstanding" value="$8,500" change="2 invoices" positive={false} />
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-foreground">Revenue vs Expenses &middot; 6mo</span>
                  <span className="text-xs text-muted-foreground">$94,210 total</span>
                </div>
                <svg viewBox="0 0 400 80" className="w-full h-20" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,60 L40,55 L80,40 L120,45 L160,30 L200,32 L240,20 L280,25 L320,15 L360,18 L400,8 L400,80 L0,80 Z" fill="url(#heroGrad)" />
                  <path d="M0,60 L40,55 L80,40 L120,45 L160,30 L200,32 L240,20 L280,25 L320,15 L360,18 L400,8" stroke="#7c3aed" strokeWidth="2" fill="none" />
                </svg>
              </div>
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
            eyebrowIcon={Video}
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
                Only for the first 50 creators — spot 51 pays $19
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
            features={agencyFeatures}
            ctaLabel="Contact us →"
            ctaHref={`mailto:${CONTACT_EMAIL}`}
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
            Join the founding beta &mdash; 50 spots
          </h2>
          <p className="text-base text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
            We&apos;re opening free access to our first 50 creators. No credit card. No time limit.
            Founding members lock in <span className="font-semibold text-foreground">$9/mo</span>{' '}
            &mdash; 50% off the Pro price, forever. Spot 51 pays full price.
          </p>
          <div className="flex justify-center">
            <EmailCapture />
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

function MockStat({
  label,
  value,
  change,
  positive,
}: {
  label: string
  value: string
  change: string
  positive: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm font-bold text-foreground">{value}</div>
      <div className={`mt-0.5 text-[10px] font-medium ${positive ? 'text-emerald-600' : 'text-amber-600'}`}>
        {change}
      </div>
    </div>
  )
}

const TONE_STYLES: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
}

function MockDeal({
  brand,
  amount,
  stage,
  tone,
}: {
  brand: string
  amount: string
  stage: string
  tone: 'emerald' | 'amber' | 'violet'
}) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${TONE_STYLES[tone]}`}>{stage}</span>
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
}: {
  name: string
  price: string
  unit: string
  subtitle?: string
  features: string[]
  ctaLabel: string
  ctaHref: string
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
      <Link
        href={ctaHref}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
      >
        {ctaLabel}
      </Link>
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
          <Video className="h-4 w-4 text-red-500" />
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

