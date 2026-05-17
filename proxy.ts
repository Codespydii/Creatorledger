import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'
import { cookies } from 'next/headers'

const protectedPrefixes = ['/dashboard', '/revenue', '/expenses', '/invoices', '/deals', '/reports', '/settings']
const publicRoutes = ['/login', '/signup', '/']

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  const isProtected = protectedPrefixes.some((p) => path.startsWith(p))
  const isPublic = publicRoutes.includes(path)

  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')?.value
  const session = await decrypt(cookie)

  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isPublic && session?.userId && path !== '/') {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
