import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'
import { logger } from './lib/logger'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Exclude specific routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next() // Allow the request to proceed without middleware logic
  }

  if (pathname === '/payment/candidate-fee') {
    return NextResponse.next()
  }

  logger.info('running middleware', req.nextUrl.pathname)
  return await updateSession(req)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
