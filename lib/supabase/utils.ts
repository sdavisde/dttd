import type { PostgrestError } from '@supabase/supabase-js'
import { isNil } from 'lodash'

export function isSupabaseError(
  maybeError: PostgrestError | null
): maybeError is PostgrestError {
  if (isNil(maybeError)) {
    return false
  }

  return maybeError.code !== 'PGRST116'
}
