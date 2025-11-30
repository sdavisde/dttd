import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'
import { logger } from './lib/logger'

/** Do-nothing routes that we want to avoid middleware calls for */
export const SKIP_REGEX_ROUTES = [
  /^\/payment\/candidate-fee\/.*$/,
  /^\/candidate\/.*$/,
  /^\/api\/.*$/,
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
  /^\/$/,
]

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (SKIP_REGEX_ROUTES.some((route) => route.test(pathname))) {
    return NextResponse.next()
  }

  logger.info(`running middleware: ${req.nextUrl.pathname}`)
  return await updateSession(req)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
