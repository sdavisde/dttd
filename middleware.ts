import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is signed in and the current path is / or /join redirect to /home
  if (session && (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/join')) {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  // If user is not signed in and the current path is /home redirect to /
  if (!session && req.nextUrl.pathname === '/home') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/', '/home', '/join'],
}
