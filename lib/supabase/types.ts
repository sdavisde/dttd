import { SupabaseClient as RawSupabaseClient, User as SupabaseUser } from '@supabase/supabase-js'
import { Database } from '@/database.types'

export type User = SupabaseUser & {
  permissions: string[]
  user_metadata?: {
    first_name?: string
    last_name?: string
    gender?: string
  }
}

export type SupabaseClient = RawSupabaseClient<Database, 'public'>
