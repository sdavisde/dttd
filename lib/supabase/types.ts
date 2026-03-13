import type { SupabaseClient as RawSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/database.types'

export type SupabaseClient = RawSupabaseClient<Database, 'public'>
