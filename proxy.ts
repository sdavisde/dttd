import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'
import { logger } from './lib/logger'
import {
  AUDIT_REQ_HEADER,
  AUDIT_ROUTE_HEADER,
  isAuditEnabled,
} from './lib/supabase/audit-fetch'

/** Do-nothing routes that we want to avoid middleware calls for */
export const SKIP_REGEX_ROUTES = [
  /^\/payment\/candidate-fee(\/.*)?$/,
  /^\/candidate\/.*$/,
  /^\/api\/.*$/,
  // Sentry tunnelRoute (see next.config.ts) - must stay reachable for logged-out users
  /^\/monitoring$/,
]

/**
 * Public routes that we still want to run through middleware.
 * Generally done to ensure we send the user to the /home page if they are logged in.
 */
export const PUBLIC_REGEX_ROUTES = [
  /^\/forgot-password$/,
  /^\/reset-password$/,
  /^\/login$/,
  /^\/join$/,
  /^\/auth\/callback$/,
  /^\/auth\/confirm$/,
  /^\/secuela-signin$/,
  /^\/$/,
]

/**
 * A.K.A. middleware - this function has been renamed as part of Next 16
 */
export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (SKIP_REGEX_ROUTES.some((route) => route.test(pathname))) {
    return NextResponse.next()
  }

  if (isAuditEnabled()) {
    // Audit only: stamp the request so server-side Supabase calls can be
    // correlated with the page render that issued them.
    req.headers.set(AUDIT_REQ_HEADER, crypto.randomUUID().slice(0, 8))
    req.headers.set(AUDIT_ROUTE_HEADER, pathname)
  }

  logger.info(`running middleware: ${req.nextUrl.pathname}`)
  return await updateSession(req)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
