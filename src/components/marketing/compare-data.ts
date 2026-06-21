import type { FaqItem } from './structured-data'

// Content for the /usecaelo-vs-<competitor> comparison pages. One entry powers
// the whole page (metadata, hero, table, honesty sections, FAQ). Keep claims
// factual and balanced — every entry names where the competitor is genuinely the
// better fit. That honesty builds trust (EEAT) and is what ranks for "vs"
// queries; one-sided comparison pages get ignored.
//
// Competitor pricing reflects published month-to-month rates as of 2026 and is
// labelled as such on-page (rates move — we caveat rather than assert forever).

export type Cell = boolean | string

export interface ComparisonRow {
  feature: string
  caelo: Cell
  competitor: Cell
}

export interface Comparison {
  /** URL slug — page lives at /<slug> (top-level, e.g. usecaelo-vs-quickbooks). */
  slug: string
  /** Display name of the competitor, e.g. "QuickBooks". */
  competitor: string
  metaTitle: string
  metaDescription: string
  h1: string
  intro: string
  rows: ComparisonRow[]
  /** Honest list of what the competitor does better. */
  competitorWins: string[]
  /** Where Caelo wins for creators specifically. */
  caeloWins: string[]
  /** One-paragraph "who should pick what" verdict. */
  verdict: string
  faq: FaqItem[]
}

// Creator-specific capabilities none of the general-purpose tools offer. Shared
// across all three comparisons (competitor column is false for each).
const CREATOR_ROWS: ComparisonRow[] = [
  { feature: 'Built specifically for content creators', caelo: true, competitor: false },
  { feature: 'Track 11 creator income streams (AdSense, sponsorships, affiliate, Patreon, merch…)', caelo: true, competitor: 'Manual categories' },
  { feature: 'YouTube AdSense auto-sync via OAuth', caelo: true, competitor: false },
  { feature: 'AI sponsorship-contract review', caelo: true, competitor: false },
  { feature: 'Brand-deal CRM pipeline', caelo: true, competitor: false },
  { feature: 'Anonymised creator rate benchmarks', caelo: true, competitor: false },
  { feature: 'Public media kit / rate card', caelo: true, competitor: false },
  { feature: '90-day cash forecast (models AdSense paying ~2 months late)', caelo: true, competitor: 'Generic only' },
]

export const COMPARISONS: Comparison[] = [
  {
    slug: 'usecaelo-vs-quickbooks',
    competitor: 'QuickBooks',
    metaTitle: 'Caelo vs QuickBooks: Best Bookkeeping for Creators (2026)',
    metaDescription:
      'Caelo vs QuickBooks for content creators — compare sponsorship tracking, AI contract review, YouTube auto-sync and pricing. See which bookkeeping tool fits creators.',
    h1: 'Caelo vs QuickBooks for creators',
    intro:
      'QuickBooks is the default accounting tool for small businesses — and it’s genuinely powerful for traditional bookkeeping. But it was never built for how creators earn: sponsorships, AdSense, affiliate, memberships and merch. Here’s an honest, side-by-side look at where each one wins.',
    rows: [
      ...CREATOR_ROWS,
      { feature: 'AI receipt scanning', caelo: true, competitor: 'Add-on / higher tiers' },
      { feature: 'Invoicing with Stripe pay links', caelo: true, competitor: true },
      { feature: 'Full double-entry general ledger', caelo: 'Creator-focused books', competitor: true },
      { feature: 'Payroll & contractor payments', caelo: false, competitor: 'Add-on' },
      { feature: 'Accountant / ProAdvisor network', caelo: 'Roadmap', competitor: true },
      { feature: 'Free tier', caelo: 'Free founding beta', competitor: false },
      { feature: 'Starting price', caelo: '$9/mo (founding) · $19/mo after', competitor: '~$20/mo (Solopreneur)' },
    ],
    competitorWins: [
      'Mature, full double-entry accounting with deep bank reconciliation — the standard most accountants expect.',
      'Payroll, contractor payments and inventory for businesses with employees or physical products.',
      'A huge ProAdvisor/accountant ecosystem — if your accountant insists on QuickBooks Online, that matters.',
      'Decades of integrations with banks, tax-filing software and third-party apps.',
    ],
    caeloWins: [
      'Understands creator revenue out of the box — 11 income-stream types instead of generic categories.',
      'Auto-imports YouTube AdSense daily; QuickBooks needs manual entry or CSV imports.',
      'Flags risky sponsorship-contract clauses (kill fees, perpetual rights, exclusivity) before you sign.',
      'Brand-deal CRM, rate benchmarks and a public media kit — none of which QuickBooks offers.',
    ],
    verdict:
      'Choose QuickBooks if you run a more traditional business with employees, inventory or an accountant who requires it. Choose Caelo if your income comes from sponsorships, ad revenue and brand deals and you want bookkeeping, contract review and a deal pipeline built around that — for less.',
    faq: [
      {
        q: 'Is QuickBooks good for content creators?',
        a: 'QuickBooks can technically track creator income, but it has no concept of sponsorships, AdSense, kill fees or brand-deal pipelines. You end up bending generic categories to fit a creator business. Caelo is built around those income streams from the start.',
      },
      {
        q: 'Is Caelo cheaper than QuickBooks?',
        a: 'Yes. Caelo starts at $9/mo for founding members ($19/mo after), versus roughly $20/mo for QuickBooks Solopreneur as of 2026 — and Caelo includes creator-specific features QuickBooks doesn’t offer at any tier.',
      },
      {
        q: 'Can I move from QuickBooks to Caelo?',
        a: 'Yes. You can add income and expenses manually or via import, connect YouTube for automatic AdSense sync, and keep your accountant in the loop with clean, categorised exports.',
      },
    ],
  },
  {
    slug: 'usecaelo-vs-wave',
    competitor: 'Wave',
    metaTitle: 'Caelo vs Wave: Best Free Bookkeeping for Creators (2026)',
    metaDescription:
      'Caelo vs Wave for creators — compare free plans, sponsorship tracking, AI contract review and YouTube sync. See which is the better bookkeeping tool for content creators.',
    h1: 'Caelo vs Wave for creators',
    intro:
      'Wave is popular because its core accounting and invoicing are genuinely free. For a brand-new side hustle that just needs to send an invoice, that’s hard to beat. But Wave is general-purpose software with no creator features and limited support — here’s the honest comparison.',
    rows: [
      ...CREATOR_ROWS,
      { feature: 'AI receipt scanning', caelo: true, competitor: 'Paid add-on' },
      { feature: 'Invoicing with online payments', caelo: true, competitor: 'Payments charged per transaction' },
      { feature: 'Free core accounting & invoicing', caelo: 'Free founding beta', competitor: true },
      { feature: 'AI features (contracts, receipts, email)', caelo: true, competitor: false },
      { feature: 'Live / priority support', caelo: 'Pro', competitor: 'Limited on free' },
      { feature: 'Starting price', caelo: '$9/mo (founding) · $19/mo after', competitor: '$0 core (paid payments/payroll)' },
    ],
    competitorWins: [
      'A genuinely free tier for core accounting and invoicing — great if budget is the only constraint.',
      'Simple and approachable for a first-time, very small business.',
      'Solid basic invoicing and bank-connection bookkeeping for non-creators.',
    ],
    caeloWins: [
      'Creator income streams, YouTube auto-sync and a brand-deal CRM — Wave has none of these.',
      'AI receipt scanning, contract review and email parsing built in, not bolted on.',
      'A cash forecast that understands AdSense pays roughly two months late.',
      'A public media kit and rate benchmarks that help you actually earn more, not just record it.',
    ],
    verdict:
      'Choose Wave if you’re pre-revenue or only need a free way to send invoices and track basic books, and you don’t need creator-specific tools. Choose Caelo once you’re earning from sponsorships, ad revenue or affiliates and want software that understands — and helps grow — that income.',
    faq: [
      {
        q: 'Is Wave really free?',
        a: 'Wave’s core accounting and invoicing are free, but you pay per-transaction fees to accept online payments and extra for payroll. It has no creator-specific features at any price.',
      },
      {
        q: 'Why would a creator pay for Caelo over free Wave?',
        a: 'Because Wave can only record your money — Caelo helps you earn and protect it. Sponsorship tracking, AI contract review, a deal CRM, rate benchmarks and a media kit aren’t things Wave offers at all. Caelo is also free during the founding beta.',
      },
    ],
  },
  {
    slug: 'usecaelo-vs-freshbooks',
    competitor: 'FreshBooks',
    metaTitle: 'Caelo vs FreshBooks: Bookkeeping Built for Creators (2026)',
    metaDescription:
      'Caelo vs FreshBooks for creators — compare invoicing, sponsorship tracking, AI contract review and pricing. See which bookkeeping tool fits content creators best.',
    h1: 'Caelo vs FreshBooks for creators',
    intro:
      'FreshBooks is excellent invoicing-first accounting for service freelancers and agencies who bill clients by project or hour. If that’s your model, it’s a strong tool. But creators don’t bill hours — they earn from sponsorships, ad revenue and brand deals. Here’s where each one fits.',
    rows: [
      ...CREATOR_ROWS,
      { feature: 'AI receipt scanning', caelo: true, competitor: 'Higher tiers' },
      { feature: 'Invoicing with Stripe pay links', caelo: true, competitor: true },
      { feature: 'Time tracking & project billing', caelo: false, competitor: true },
      { feature: 'Billable-client limits on lower plans', caelo: 'No client limits', competitor: 'Limited (e.g. Lite plan)' },
      { feature: 'Free tier', caelo: 'Free founding beta', competitor: false },
      { feature: 'Starting price', caelo: '$9/mo (founding) · $19/mo after', competitor: '~$19/mo (Lite)' },
    ],
    competitorWins: [
      'Best-in-class invoicing, time tracking and project billing for hourly service freelancers and agencies.',
      'Strong client-management workflow if your business is built around billable clients.',
      'Mature double-entry accounting and a long track record.',
    ],
    caeloWins: [
      'Built for creator income — sponsorships, AdSense, affiliate, memberships — not hourly client billing.',
      'YouTube auto-sync, AI contract review and a brand-deal CRM that FreshBooks doesn’t offer.',
      'No billable-client limits gating lower tiers — a non-issue for the creator model anyway.',
      'Rate benchmarks and a public media kit to help you price and close brand deals.',
    ],
    verdict:
      'Choose FreshBooks if you’re a service freelancer or agency that bills clients by time or project. Choose Caelo if you’re a creator earning from sponsorships, ad revenue and brand deals and want bookkeeping plus contract review, a deal pipeline and rate data built for that.',
    faq: [
      {
        q: 'Is FreshBooks good for content creators?',
        a: 'FreshBooks shines for hourly and project-based client work. Creators rarely bill that way — their income is sponsorships, ad revenue and brand deals, which FreshBooks doesn’t model. Caelo is purpose-built for creator income.',
      },
      {
        q: 'How does Caelo pricing compare to FreshBooks?',
        a: 'Caelo starts at $9/mo for founding members ($19/mo after), comparable to FreshBooks’ ~$19/mo Lite plan as of 2026 — but without client limits and with creator-specific features FreshBooks doesn’t have.',
      },
    ],
  },
]

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug)
}
