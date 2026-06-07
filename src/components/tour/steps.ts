export interface TourStep {
  /** Route this step lives on. The tour navigates here before highlighting. */
  route: string
  /** CSS selector for the element to spotlight. */
  target: string
  title: string
  description: string
}

/**
 * Full cross-page product tour covering every section of Caelo. Each step
 * navigates to its route, waits for the [data-tour] anchor to mount, then
 * spotlights it. Closes on the Connect YouTube button.
 */
export const CAELO_TOUR_STEPS: TourStep[] = [
  {
    route: '/dashboard',
    target: '[data-tour="overview"]',
    title: 'Your command center',
    description: 'Revenue, expenses, profit and outstanding invoices — your whole creator business in one glance, updated automatically.',
  },
  {
    route: '/revenue',
    target: '[data-tour="revenue"]',
    title: 'Track every income stream',
    description: 'Log sponsorships, AdSense, affiliates and more across 11 income types — or let YouTube sync your AdSense automatically.',
  },
  {
    route: '/expenses',
    target: '[data-tour="expenses"]',
    title: 'Capture every expense',
    description: 'Snap a receipt and the AI fills in the vendor, amount, date and category. No more shoebox at tax time.',
  },
  {
    route: '/invoices',
    target: '[data-tour="invoices"]',
    title: 'Get paid faster',
    description: 'Generate branded PDF invoices with payment links, then track what’s sent, paid and overdue — with automatic reminders.',
  },
  {
    route: '/deals',
    target: '[data-tour="deals"]',
    title: 'Your sponsorship pipeline',
    description: 'A full brand-deal CRM — track each partnership from outreach to paid, and let AI extract deals straight from emails.',
  },
  {
    route: '/contracts',
    target: '[data-tour="contracts"]',
    title: "AI reads your contracts so you don't have to",
    description: 'Drop a contract and the AI flags risky clauses — exclusivity, late payment, usage rights — in about 15 seconds, before you sign.',
  },
  {
    route: '/forecast',
    target: '[data-tour="forecast"]',
    title: 'See your cash flow ahead',
    description: 'A 90-day forecast built from your deals and invoices — it even accounts for AdSense paying two months late.',
  },
  {
    route: '/benchmarks',
    target: '[data-tour="benchmarks"]',
    title: 'Know what to charge',
    description: 'See what creators your size actually earn per integration, so you never undersell on your next deal.',
  },
  {
    route: '/media-kit',
    target: '[data-tour="mediakit"]',
    title: 'Your shareable pitch page',
    description: 'A polished, public media kit brands can view and download — auto-filled from your stats and rates.',
  },
  {
    route: '/reports',
    target: '[data-tour="reports"]',
    title: 'Tax-ready in one click',
    description: 'P&L by month, revenue by source, expenses by category — export it for any date range and hand it to your accountant.',
  },
  {
    route: '/settings',
    target: '[data-tour="connect-youtube"]',
    title: "You're all set 🎉",
    description: 'One last thing — connect your YouTube channel and your AdSense revenue syncs in automatically. Welcome to Caelo.',
  },
]
