'server-only'

import { createServerClient } from '@supabase/ssr'
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from '@supabase/supabase-js'
import { cookies, headers } from 'next/headers'
import { isNil } from 'lodash'
import { logger } from '@/lib/logger'
import type { Database } from '@/database.types'
import {
  AUDIT_REQ_HEADER,
  AUDIT_ROUTE_HEADER,
  auditModeFromHeaders,
  createAuditFetch,
  isAuditEnabled,
  type AuditClient,
  type AuditScope,
} from './audit-fetch'

/** Either server client; the schema types are the same for both. */
export type DbClient = SupabaseClient<Database>

/**
 * Lets a repository read run on a client the caller chose (the admin client
 * inside a cached reader) instead of the cookie-bound session client.
 */
export type ReadOptions = {
  client?: DbClient
}

/** The client a read should use: the one passed in, else the session client. */
export async function readClient(options?: ReadOptions): Promise<DbClient> {
  return options?.client ?? (await createClient())
}

/**
 * Audit-only (`AUDIT_LOG`): the request correlation the audit fetch would
 * read lazily, resolved eagerly for callers that are about to enter a scope
 * where `headers()` is not allowed (`unstable_cache`). Undefined otherwise.
 */
export async function currentAuditScope(): Promise<AuditScope | undefined> {
  if (!isAuditEnabled()) return undefined
  try {
    const h = await headers()
    return {
      reqId: h.get(AUDIT_REQ_HEADER) ?? undefined,
      route: h.get(AUDIT_ROUTE_HEADER) ?? undefined,
      mode: auditModeFromHeaders((name) => h.get(name)),
    }
  } catch {
    return undefined
  }
}

/**
 * Audit-only (`AUDIT_LOG`): a fetch that tags each Supabase call with the
 * request id the proxy stamped on the incoming request. Undefined otherwise,
 * so supabase-js keeps its default fetch.
 */
function auditFetch(client: AuditClient) {
  return createAuditFetch(client, async () => {
    const h = await headers()
    return {
      reqId: h.get(AUDIT_REQ_HEADER) ?? undefined,
      route: h.get(AUDIT_ROUTE_HEADER) ?? undefined,
      mode: auditModeFromHeaders((name) => h.get(name)),
    }
  })
}

/**
 * Creates a Supabase client for use in server components and server actions.
 * This client respects RLS policies based on the authenticated user's session.
 */
export async function createClient() {
  const cookieStore = await cookies()

  if (isNil(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    logger.error(
      'Trying to create server-side supabase client but NEXT_PUBLIC_SUPABASE_URL is not set'
    )
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  if (isNil(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
    logger.error(
      'Trying to create server-side supabase client but NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set'
    )
    throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set')
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { fetch: auditFetch('user') },
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
export function createAdminClient(options?: { audit?: AuditScope }) {
  if (isNil(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    logger.error(
      'Trying to create admin supabase client but NEXT_PUBLIC_SUPABASE_URL is not set'
    )
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  if (isNil(process.env.SUPABASE_SECRET_KEY)) {
    logger.error(
      'Trying to create admin supabase client but SUPABASE_SECRET_KEY is not set'
    )
    throw new Error('SUPABASE_SECRET_KEY is not set')
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      global: {
        fetch: isNil(options?.audit)
          ? auditFetch('admin')
          : createAuditFetch('admin', () => options.audit ?? {}),
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
