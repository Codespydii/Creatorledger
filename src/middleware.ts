import { NextResponse, type NextRequest } from 'next/server'

// Lightweight, edge-safe guard: if there's no session cookie at all, bounce to
// /login before the page renders. The authoritative check (JWT verify + user
// scoping) still happens server-side in verifySession() — this is purely
// defense-in-depth so a new protected route can't be reached cookie-less.
export function middleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get('session')?.value)
  if (hasSession) return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/revenue/:path*',
    '/expenses/:path*',
    '/invoices/:path*',
    '/deals/:path*',
    '/contracts/:path*',
    '/forecast/:path*',
    '/benchmarks/:path*',
    '/reports/:path*',
    '/report-pdf/:path*',
    '/media-kit/:path*',
    '/settings/:path*',
  ],
}
