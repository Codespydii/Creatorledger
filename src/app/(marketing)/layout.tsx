import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'

// Shared chrome for every public marketing page (home, /features/*, /blog/*).
// The (auth) and (dashboard) route groups have their own layouts, so this
// header/footer never leaks into the app itself.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  )
}
