'use server'

import { authorizedAction } from '@/lib/actions/authorized-action'
import * as CommunityService from './community-service'
import { Permission } from '@/lib/security'
import { CommunityEncouragement } from './types'

/**
 * The community encouragement is a global message that is displayed to all members of DTTD.
 * The community spiritual director is responsible for updating the community encouragement, or removing it.
 * @returns the community encouragement.
 */
export async function getCommunityEncouragement() {
  return await CommunityService.getCommunityEncouragement()
}

type UpdateCommunityEncouragementRequest = {
  messageId: string
  message: string
}

/**
 * Updates the community encouragement with the string provided
 * @returns the newly updated community encouragement data.
 */
export const updateCommunityEncouragement = authorizedAction<
  UpdateCommunityEncouragementRequest,
  CommunityEncouragement | null
>(Permission.WRITE_COMMUNITY_ENCOURAGEMENT, async ({ messageId, message }) => {
  return await CommunityService.updateCommunityEncouragement(messageId, message)
})
