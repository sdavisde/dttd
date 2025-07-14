import { PostgrestError } from '@supabase/supabase-js'

export function isSupabaseError(maybeError: PostgrestError | null): maybeError is PostgrestError {
  if (!maybeError) {
    return false
  }

  return maybeError.code !== 'PGRST116'
}
