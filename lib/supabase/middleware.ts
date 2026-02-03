import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { logger } from '@/lib/logger'
import { validateRedirectUrl } from '@/lib/redirect'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicUrls =
    /^\/(forgot-password|reset-password|login|join|auth\/callback|\/?)$/
  const redirectToHomeUrls = /^\/(login|join)?$/

  if (user && redirectToHomeUrls.test(request.nextUrl.pathname)) {
    // Check for redirectTo parameter and validate it
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    const targetPath = validateRedirectUrl(redirectTo, '/home')
    logger.info(
      `user logged in, redirecting to ${targetPath} from ${request.nextUrl.pathname}`
    )
    const url = request.nextUrl.clone()
    url.pathname = targetPath.split('?')[0]
    // Preserve query string from redirectTo if present
    const queryIndex = targetPath.indexOf('?')
    if (queryIndex !== -1) {
      const params = new URLSearchParams(targetPath.slice(queryIndex + 1))
      params.forEach((value, key) => url.searchParams.set(key, value))
    }
    // Clear the redirectTo param from the final URL
    url.searchParams.delete('redirectTo')
    return NextResponse.redirect(url)
  }

  if (!user && !publicUrls.test(request.nextUrl.pathname)) {
    // Capture the original URL to redirect back after login
    const originalUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`
    logger.info(
      `no user, redirecting to login from ${request.nextUrl.pathname} (will return to ${originalUrl})`
    )
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', originalUrl)
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!
  logger.info(
    `finished updating session while requesting ${request.nextUrl.pathname}. user exists?: ${!!user}`
  )

  return supabaseResponse
}
