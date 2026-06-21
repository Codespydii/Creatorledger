import {
  TrendingUp,
  ScanLine,
  ShieldCheck,
  LineChart,
  Handshake,
  FileText,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export const CONTACT_EMAIL = 'support@usecaelo.com'

export interface FeatureBenefit {
  title: string
  desc: string
}

export interface Feature {
  /** URL slug — page lives at /features/<slug> */
  slug: string
  /** Short label used in the Product dropdown + footer */
  name: string
  /** One-liner shown under the name in the dropdown */
  tagline: string
  icon: LucideIcon
  /** Accent used on the feature page eyebrow/icon */
  color: 'violet' | 'emerald' | 'amber' | 'red'
  /** SEO <title> and meta description for /features/<slug> */
  metaTitle: string
  metaDescription: string
  /** Hero copy on the feature page */
  eyebrow: string
  headline: string
  subhead: string
  /** 3–4 concrete benefits rendered as cards */
  benefits: FeatureBenefit[]
}

// One entry powers three places: the Product mega-dropdown, the footer Product
// column, and the generated /features/<slug> landing page. Edit copy here.
export const FEATURES: Feature[] = [
  {
    slug: 'income-tracking',
    name: 'Income tracking',
    tagline: 'Every revenue stream in one ledger',
    icon: TrendingUp,
    color: 'violet',
    metaTitle: 'Creator income tracker — track every revenue stream',
    metaDescription:
      'Track AdSense, sponsorships, affiliate, merch, memberships and more in one ledger built for creators. Auto-sync YouTube revenue and see your real P&L.',
    eyebrow: 'Income tracking',
    headline: 'Every income stream a creator has — finally in one ledger.',
    subhead:
      'Spreadsheets break the moment you earn from five places at once. Caelo tracks 11 income-stream types and auto-imports YouTube AdSense so your numbers are always current.',
    benefits: [
      { title: '11 income-stream types', desc: 'AdSense, sponsorships, affiliate, merch, memberships, tips, licensing and more — each categorised the way creators actually get paid.' },
      { title: 'YouTube auto-sync', desc: 'Connect once and your AdSense revenue imports daily over OAuth. No CSV exports, no copy-paste.' },
      { title: 'Real P&L, not guesswork', desc: 'See profit by month and by source, with multi-currency display in USD, GBP, EUR, CAD, AUD and INR.' },
    ],
  },
  {
    slug: 'ai-receipt-scanner',
    name: 'AI receipt scanning',
    tagline: 'Snap a photo, skip the data entry',
    icon: ScanLine,
    color: 'emerald',
    metaTitle: 'AI receipt scanner for creators — auto-log expenses',
    metaDescription:
      'Snap a receipt and AI fills in the vendor, amount, date and category automatically. Zero manual entry, tax-ready expense tracking built for creators.',
    eyebrow: 'AI receipt scanning',
    headline: 'Snap a photo. The AI does the bookkeeping.',
    subhead:
      'Point your phone at any receipt and Caelo reads the vendor, amount, date and category in seconds — so your write-offs are captured the moment you spend.',
    benefits: [
      { title: 'Zero manual entry', desc: 'AI extracts vendor, total, date and category from a single photo. Review and save in one tap.' },
      { title: 'Tax-ready categories', desc: 'Expenses land in creator-relevant categories so your year-end export is already organised for your accountant.' },
      { title: 'Never lose a write-off', desc: 'Capture deductions in the moment instead of digging through a shoebox every April.' },
    ],
  },
  {
    slug: 'contract-analyzer',
    name: 'AI contract review',
    tagline: 'Catch bad clauses before you sign',
    icon: ShieldCheck,
    color: 'red',
    metaTitle: 'AI brand-deal contract analyzer for creators',
    metaDescription:
      'Upload a sponsorship contract and AI flags exclusivity traps, kill fees, IP grabs and payment terms in seconds — before you sign. Built for creators.',
    eyebrow: 'AI contract review',
    headline: 'Know what you’re signing — before you sign it.',
    subhead:
      'Paste or upload a brand-deal contract and Caelo highlights the clauses that cost creators money: exclusivity windows, kill fees, perpetual usage rights and vague payment terms.',
    benefits: [
      { title: 'Clause-level red flags', desc: 'Exclusivity, IP/usage grabs, kill fees and net-60 payment terms surfaced in plain English in about five seconds.' },
      { title: 'Negotiate from strength', desc: 'Walk into every deal knowing exactly which terms to push back on — and why they matter.' },
      { title: 'Works on PDFs and .docx', desc: 'Drop in the file the brand sent you. No reformatting, no copy-paste gymnastics.' },
    ],
  },
  {
    slug: 'cash-forecast',
    name: '90-day cash forecast',
    tagline: 'See money before it lands',
    icon: LineChart,
    color: 'violet',
    metaTitle: '90-day cash flow forecast for creators',
    metaDescription:
      'Forecast your creator cash flow 90 days out. Caelo accounts for AdSense paying two months late and pending brand deals so you always know what’s landing.',
    eyebrow: '90-day cash forecast',
    headline: 'See what’s landing before it hits your account.',
    subhead:
      'Creator income is lumpy and late. Caelo projects your next 90 days from booked deals and recurring revenue — and it knows AdSense pays roughly two months in arrears.',
    benefits: [
      { title: 'Built for late payouts', desc: 'The forecast models AdSense’s two-month delay and net-30/60 brand terms instead of pretending you get paid instantly.' },
      { title: 'Booked + expected', desc: 'Combines confirmed invoices, pipeline deals and recurring revenue into one forward view.' },
      { title: 'Plan with confidence', desc: 'Know whether next month covers rent, taxes and that new camera — before you commit.' },
    ],
  },
  {
    slug: 'deal-crm',
    name: 'Brand-deal CRM',
    tagline: 'A pipeline for every sponsorship',
    icon: Handshake,
    color: 'amber',
    metaTitle: 'Brand deal CRM & sponsorship pipeline for creators',
    metaDescription:
      'Manage every sponsorship from first email to paid in a kanban pipeline built for creators. Track deliverables, deadlines and deal value in one place.',
    eyebrow: 'Brand-deal CRM',
    headline: 'Run every sponsorship like a pipeline, not an inbox.',
    subhead:
      'Stop losing deals in your DMs. Track each brand partnership from first outreach to paid, with deliverables, deadlines and values visible at a glance.',
    benefits: [
      { title: 'Kanban pipeline', desc: 'Drag deals through stages — pitched, negotiating, signed, delivered, paid — so nothing slips.' },
      { title: 'AI email scanner', desc: 'Paste a sponsorship email and Caelo extracts the brand, value, deliverables and deadlines in seconds.' },
      { title: 'Deliverables & deadlines', desc: 'Every commitment tracked against its due date so you never miss a posting window.' },
    ],
  },
  {
    slug: 'invoicing',
    name: 'Invoices & payments',
    tagline: 'Professional invoices, paid faster',
    icon: FileText,
    color: 'emerald',
    metaTitle: 'Invoicing with Stripe payment links for creators',
    metaDescription:
      'Send professional PDF invoices with embedded Stripe payment links and get paid faster. Invoicing built for creators and freelancers.',
    eyebrow: 'Invoices & payments',
    headline: 'Professional invoices with one-click pay links.',
    subhead:
      'Generate a branded PDF invoice in seconds and embed a Stripe payment link so brands can pay you the moment they open it.',
    benefits: [
      { title: 'Branded PDF invoices', desc: 'Your business details, logo and line items on a clean, professional invoice — downloadable instantly.' },
      { title: 'Stripe pay links', desc: 'Connect Stripe and every invoice carries a one-click payment link. Get paid faster, chase less.' },
      { title: 'Tied to your books', desc: 'Paid invoices flow straight into your income ledger and cash forecast — no double entry.' },
    ],
  },
  {
    slug: 'media-kit',
    name: 'Media kit',
    tagline: 'A rate card brands can’t ignore',
    icon: Sparkles,
    color: 'violet',
    metaTitle: 'Free public media kit & rate card for creators',
    metaDescription:
      'Spin up a shareable public media kit and rate card auto-filled from your channel stats. Send brands a polished link that helps you close deals.',
    eyebrow: 'Media kit',
    headline: 'A shareable rate card that closes deals.',
    subhead:
      'Send brands a polished public media kit at usecaelo.com/m/you — auto-filled from your channel stats, ready to share in a single link.',
    benefits: [
      { title: 'Auto-filled from your stats', desc: 'Subscriber count, views and audience details pull straight from your connected channel.' },
      { title: 'One link to share', desc: 'Drop a clean usecaelo.com/m/you link into any pitch instead of a clunky PDF attachment.' },
      { title: 'Built to convert', desc: 'Present your rates and reach the way brands expect, so partnerships move faster.' },
    ],
  },
]

export function getFeature(slug: string): Feature | undefined {
  return FEATURES.find((f) => f.slug === slug)
}

export interface ResourceLink {
  name: string
  desc: string
  href?: string
  comingSoon?: boolean
}

// Powers the Resources dropdown. Items without an href (comingSoon) render
// disabled rather than as dead links. (Blog is a top-level nav item, so it's
// intentionally not duplicated here.)
export const RESOURCES: ResourceLink[] = [
  { name: 'Guides', desc: 'How to use Caelo, step by step', href: '/guides' },
  { name: 'Compare', desc: 'Caelo vs QuickBooks, Wave & FreshBooks', href: '/compare' },
  { name: 'Help & FAQ', desc: 'Answers to the most common questions', href: '/#faq' },
  { name: 'Free tools & templates', desc: 'Rate calculator, invoice & contract templates', comingSoon: true },
]

export interface FooterLink {
  label: string
  href?: string
  comingSoon?: boolean
}

export interface FooterColumn {
  heading: string
  links: FooterLink[]
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'Product',
    links: [...FEATURES.map((f) => ({ label: f.name, href: `/features/${f.slug}` }))],
  },
  {
    heading: 'Compare',
    links: [
      { label: 'All comparisons', href: '/compare' },
      { label: 'Caelo vs QuickBooks', href: '/usecaelo-vs-quickbooks' },
      { label: 'Caelo vs Wave', href: '/usecaelo-vs-wave' },
      { label: 'Caelo vs FreshBooks', href: '/usecaelo-vs-freshbooks' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Guides', href: '/guides' },
      { label: 'Bookkeeping for creators', href: '/guides/bookkeeping-for-creators' },
      { label: 'Blog', href: '/blog' },
      { label: 'Help & FAQ', href: '/#faq' },
      { label: 'Free tools & templates', comingSoon: true },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Why Caelo', href: '/#features' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Contact', href: `mailto:${CONTACT_EMAIL}` },
      { label: 'Join free beta', href: '/signup' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '/legal/privacy' },
      { label: 'Terms', href: '/legal/terms' },
    ],
  },
]
