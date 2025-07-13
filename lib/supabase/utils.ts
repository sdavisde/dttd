import { PostgrestError } from '@supabase/supabase-js'

export function isErr(maybeError: PostgrestError | null) {
  if (!maybeError) {
    return false
  }

  return maybeError.code !== 'PGRST116'
}
