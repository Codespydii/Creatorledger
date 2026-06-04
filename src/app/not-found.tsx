import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex items-center gap-1.5 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/caelo-icon.png" alt="" className="h-7 w-7" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/caelo-logo.png" alt="Caelo" className="h-6 w-auto" />
      </div>
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-3 text-xl font-semibold text-foreground">This page wandered off</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you’re looking for doesn’t exist or may have moved. Let’s get you back on track.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          Go to dashboard
        </Link>
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Back home
        </Link>
      </div>
    </main>
  )
}
