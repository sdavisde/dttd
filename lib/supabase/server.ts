'server-only'

import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'
import { Database } from '@/database.types'

/**
 * Creates a Supabase client for use in server components and server actions.
 * This client respects RLS policies based on the authenticated user's session.
 */
export async function createClient() {
  const cookieStore = await cookies()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    logger.error(
      'Trying to create server-side supabase client but NEXT_PUBLIC_SUPABASE_URL is not set'
    )
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    logger.error(
      'Trying to create server-side supabase client but NEXT_PUBLIC_SUPABASE_ANON_KEY is not set'
    )
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Creates a Supabase admin client that bypasses RLS policies.
 * Use this ONLY for server-to-server operations like webhooks where there is no user session.
 * This client uses the secret key and should never be exposed to the client.
 */
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    logger.error(
      'Trying to create admin supabase client but NEXT_PUBLIC_SUPABASE_URL is not set'
    )
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  if (!process.env.SUPABASE_SECRET_KEY) {
    logger.error(
      'Trying to create admin supabase client but SUPABASE_SECRET_KEY is not set'
    )
    throw new Error('SUPABASE_SECRET_KEY is not set')
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
