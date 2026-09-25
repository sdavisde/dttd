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
  // The Sentry tunnelRoute (see next.config.ts) and Vercel's injected scripts
  // never render a page, so there is no session to refresh and no redirect to
  // enforce; the tunnel must also stay reachable for logged-out users.
  /^\/monitoring(\/.*)?$/,
  /^\/_vercel\/.*$/,
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
 * A `<Link>` prefetch (Next's own header, or the browser's purpose hint).
 * The render behind it still authenticates from the cookies, and the real
 * navigation runs the proxy again, so refreshing the token here would only
 * add a GoTrue round-trip per visible link.
 */
function isPrefetchRequest(req: NextRequest): boolean {
  const purpose = req.headers.get('purpose') ?? req.headers.get('sec-purpose')
  return (
    req.headers.get('next-router-prefetch') !== null ||
    purpose?.includes('prefetch') === true
  )
}

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

  if (isPrefetchRequest(req)) {
    return NextResponse.next({ request: req })
  }

  logger.info(`running middleware: ${req.nextUrl.pathname}`)
  return await updateSession(req)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
