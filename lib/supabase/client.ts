// client only

import { createBrowserClient } from '@supabase/ssr'
import { logger } from '@/lib/logger'
import { Database } from '@/database.types'

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    logger.error('Trying to create client-side supabase client but NEXT_PUBLIC_SUPABASE_URL is not set')
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    logger.error('Trying to create client-side supabase client but NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
