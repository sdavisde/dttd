import { SupabaseClient as RawSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/database.types'

export type SupabaseClient = RawSupabaseClient<Database, 'public'>
