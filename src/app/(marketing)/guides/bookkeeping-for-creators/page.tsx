import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, ChevronRight, Plus } from 'lucide-react'
import { FEATURES } from '@/components/marketing/nav-data'
import { COMPARISONS } from '@/components/marketing/compare-data'
import { JsonLd, faqPageSchema, breadcrumbSchema, type FaqItem } from '@/components/marketing/structured-data'

const url = '/guides/bookkeeping-for-creators'

export const metadata: Metadata = {
  title: 'Bookkeeping for Creators: The Complete Guide (2026)',
  description:
    'Bookkeeping for creators, explained — how to track sponsorships, AdSense, affiliate and merch income, log deductible expenses, and stay tax-ready. Plus the best software for creators.',
  alternates: { canonical: url },
  openGraph: {
    title: 'Bookkeeping for Creators: The Complete Guide',
    description:
      'How to do bookkeeping as a content creator — track every income stream, capture deductions, and stay tax-ready.',
    url,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bookkeeping for Creators: The Complete Guide',
    description: 'How to do bookkeeping as a content creator — track income, expenses, and stay tax-ready.',
  },
}

const INCOME_STREAMS = [
  'Sponsorships & brand deals',
  'YouTube AdSense / ad revenue',
  'Affiliate commissions',
  'Memberships (Patreon, channel members)',
  'Merch sales',
  'Tips & donations',
  'Courses & digital products',
  'Licensing & UGC',
  'Services & consulting',
  'Platform creator funds',
  'Other one-off income',
]

const DEDUCTIONS = [
  'Equipment — cameras, lenses, mics, lighting, computers',
  'Software & subscriptions used for the business',
  'Home-office or studio space',
  'Editing, VA and contractor payments',
  'Travel for shoots, events and collaborations',
  'Props, wardrobe and set costs (when business-only)',
  'Platform and payment-processing fees',
  'Professional fees — accountant, legal, courses',
]

const STEPS = [
  { n: '01', title: 'Separate business and personal money', desc: 'Open a dedicated account for creator income and expenses. It makes every other step — and tax time — dramatically easier.' },
  { n: '02', title: 'Track every income stream', desc: 'Record income by source (sponsorship, AdSense, affiliate, merch…) so you can see what actually drives your business, not just one gross number.' },
  { n: '03', title: 'Capture expenses as they happen', desc: 'Log deductible costs in the moment — a photo of a receipt beats a shoebox in April. Categorise them to creator-relevant tax buckets.' },
  { n: '04', title: 'Set aside money for taxes', desc: 'Creator income arrives with nothing withheld. Move a percentage of every payment into a tax savings bucket so you’re never caught short.' },
  { n: '05', title: 'Review monthly and forecast', desc: 'Once a month, reconcile income and expenses, check your real profit, and look ahead — AdSense and net-30/60 brand deals pay late, so forecasting matters.' },
]

const faq: FaqItem[] = [
  {
    q: 'What is bookkeeping for creators?',
    a: 'Bookkeeping for creators is the practice of recording and categorising the income and expenses of a content-creation business — sponsorships, ad revenue, affiliate, memberships and merch on the income side, and equipment, software, contractors and home-office costs on the expense side. The goal is an accurate, tax-ready picture of profit across every income stream.',
  },
  {
    q: 'Do content creators need to do bookkeeping?',
    a: 'Yes. Once you earn money from content, you’re running a business, and that income is taxable — usually with nothing withheld. Good bookkeeping keeps you tax-ready, captures every deduction, and shows which income streams actually make money so you can grow the right ones.',
  },
  {
    q: 'How is creator bookkeeping different from normal bookkeeping?',
    a: 'Creators have many small, irregular income streams across platforms, payouts that arrive late (AdSense pays roughly two months in arrears), and unusual deductions like equipment and editing. General accounting tools weren’t designed for this, so creators often bend generic categories to fit — or use software built specifically for creator economics.',
  },
  {
    q: 'What’s the best bookkeeping software for creators?',
    a: 'The best tool depends on your model. General-purpose options like QuickBooks, FreshBooks and Wave handle traditional accounting but have no creator-specific features. Caelo is built for creators — tracking 11 income streams, auto-syncing YouTube AdSense, reviewing sponsorship contracts with AI, and forecasting lumpy creator cash flow.',
  },
  {
    q: 'How much should creators set aside for taxes?',
    a: 'It varies by country and income, but many creators set aside roughly 25–30% of net income for taxes as a starting buffer, then adjust with an accountant. The key is to move that money out of spending reach the moment each payment lands.',
  },
]

export default function BookkeepingForCreatorsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: 'Bookkeeping for creators', path: url },
  ])

  return (
    <div>
      <JsonLd data={[breadcrumb, faqPageSchema(faq)]} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mx-auto max-w-3xl px-4 sm:px-6 pt-8">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li><Link href="/guides" className="hover:text-foreground transition-colors">Guides</Link></li>
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li className="text-foreground font-medium">Bookkeeping for creators</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-8 pb-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">The complete guide</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
          Bookkeeping for creators
        </h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
          If you earn money from content, you’re running a business — and that means bookkeeping. This guide covers how
          creators track income across sponsorships, ad revenue, affiliate and merch, capture deductions, stay tax-ready,
          and pick the right software for the job.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
          >
            Start free with Caelo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Definition (snippet-friendly) */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">What is creator bookkeeping?</h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Bookkeeping for creators</strong> is the practice of recording and
            categorising the income and expenses of a content-creation business. On the income side that means
            sponsorships, ad revenue, affiliate commissions, memberships and merch; on the expense side, equipment,
            software, contractors and home-office costs. Done well, it gives you an accurate, tax-ready view of your
            profit across every income stream — not just one gross number in a bank account.
          </p>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            It differs from ordinary small-business bookkeeping in three ways: creators juggle many small, irregular
            income streams; payouts often arrive late (YouTube AdSense pays roughly two months in arrears); and the
            deductions are unusual — cameras, editing, props and platform fees. That’s why generic tools can feel like a
            poor fit.
          </p>
        </div>
      </section>

      {/* Income streams to track */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Income streams creators should track</h2>
        <p className="mt-3 text-muted-foreground">
          Tracking income by source is what turns bookkeeping from a chore into a growth tool — you see which streams
          actually pay.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {INCOME_STREAMS.map((s) => (
            <li key={s} className="flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Deductions */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Common creator tax deductions</h2>
          <p className="mt-3 text-muted-foreground">
            Capture these as you spend so you never lose a write-off. (Always confirm specifics with a tax professional
            in your country.)
          </p>
          <ul className="mt-6 space-y-2.5">
            {DEDUCTIONS.map((d) => (
              <li key={d} className="flex items-start gap-2 text-sm text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How to do it — steps */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">How to do bookkeeping as a creator</h2>
        <div className="mt-8 space-y-5">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary tabular-nums">
                {s.n}
              </span>
              <div>
                <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How Caelo helps — links to feature pages */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              How Caelo does creator bookkeeping for you
            </h2>
            <p className="mt-3 text-muted-foreground">
              Caelo is bookkeeping and accounting software built specifically for creators. Each piece below is a tool
              you’d otherwise pay for separately.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Link
                key={f.slug}
                href={`/features/${f.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-4 w-4 text-primary" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{f.name}</span>
                  <span className="block text-xs text-muted-foreground truncate">{f.tagline}</span>
                </span>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Compare — links to vs pages */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Best bookkeeping software for creators
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          General-purpose accounting tools can track creator income, but none are built for it. See how Caelo compares
          to the most common alternatives:
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {COMPARISONS.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent"
            >
              <span className="text-sm font-semibold text-foreground">Caelo vs {c.competitor}</span>
              <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
        <Link href="/compare" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          See all comparisons <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* FAQ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-8">
            Bookkeeping for creators: FAQ
          </h2>
          <div className="space-y-3">
            {faq.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-border bg-card p-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer select-none items-start justify-between gap-3 list-none">
                  <span className="font-semibold text-foreground">{q}</span>
                  <Plus aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-gradient-to-b from-violet-50 to-background dark:from-violet-950/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Stop wrestling spreadsheets. Start with creator bookkeeping that fits.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Track every income stream, scan receipts and contracts with AI, and forecast your cash — free during the
            founding beta.
          </p>
          <Link
            href="/signup"
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
          >
            Get started free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
