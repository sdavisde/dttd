import 'server-only'

import { Result, err, ok } from '@/lib/results'
import { getLoggedInUser } from '@/services/identity/user'
import { isErr } from '@/lib/results'
import { CommunityEncouragement } from './types'
import * as CommunityRepository from './repository'
import { isEmpty, isNil } from 'lodash'
import { Tables } from '@/database.types'

function normalizeCommunityEncouragement(
  rawEncouragement: Tables<'community_encouragements'>
) {
  return {
    id: rawEncouragement.id,
    message: rawEncouragement.message ?? '',
    updatedAt: new Date(rawEncouragement.updated_at),
    updatedBy: rawEncouragement.updated_by_user_id,
  }
}

/**
 * Get the current community encouragement message
 */
export async function getCommunityEncouragement(): Promise<
  Result<string, CommunityEncouragement | null>
> {
  const result = await CommunityRepository.getCommunityEncouragement()

  if (isErr(result)) {
    return err('Failed to get community encouragement')
  }

  return ok(normalizeCommunityEncouragement(result.data))
}

/**
 * Update the community encouragement message
 */
export async function updateCommunityEncouragement(
  messageId: string,
  message: string
): Promise<Result<string, CommunityEncouragement | null>> {
  // Get current user for updated_by_user_id
  const userResult = await getLoggedInUser()
  if (isErr(userResult)) {
    return err('Failed to get current user')
  }

  const result = await CommunityRepository.updateCommunityEncouragement(
    messageId,
    message,
    userResult.data.id
  )

  if (isErr(result)) {
    return err(`Failed to update community encouragement: ${result.error}`)
  }

  return ok(normalizeCommunityEncouragement(result.data))
}
