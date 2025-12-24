import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { fromSupabase, Result } from '@/lib/results'
import { Tables } from '@/database.types'

/**
 * Get the current community encouragement message
 */
export async function getCommunityEncouragement(): Promise<
  Result<string, Tables<'community_encouragements'>>
> {
  const supabase = await createClient()

  const result = await supabase
    .from('community_encouragements')
    .select('*')
    .limit(1)
    .single()

  return fromSupabase(result)
}

/**
 * Update the community encouragement message
 */
export async function updateCommunityEncouragement(
  message: string,
  userId: string
): Promise<Result<string, Tables<'community_encouragements'>>> {
  const supabase = await createClient()

  const result = await supabase
    .from('community_encouragements')
    .update({
      message: message ?? null,
      updated_by_user_id: userId,
    })
    .select()
    .single()

  return fromSupabase(result)
}
