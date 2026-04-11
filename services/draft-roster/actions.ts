'use server'

import * as DraftRosterService from './draft-roster-service'
import type { DraftRosterMember } from './types'
import type { Result } from '@/lib/results'

// Re-export types for convenience
export type { DraftRosterMember } from './types'

/**
 * Adds a community member to the draft roster for a weekend.
 */
export async function addDraftRosterMember(
  weekendId: string,
  userId: string,
  chaRole: string,
  createdBy: string,
  rollo?: string
): Promise<Result<string, void>> {
  return DraftRosterService.addDraftRosterMember(
    weekendId,
    userId,
    chaRole,
    createdBy,
    rollo
  )
}

/**
 * Returns all non-finalized draft roster entries for a weekend.
 */
export async function getDraftRoster(
  weekendId: string
): Promise<Result<string, DraftRosterMember[]>> {
  return DraftRosterService.getDraftRoster(weekendId)
}

/**
 * Removes a draft roster entry.
 */
export async function removeDraftRosterMember(
  draftId: string
): Promise<Result<string, void>> {
  return DraftRosterService.removeDraftRosterMember(draftId)
}

/**
 * Finalizes a draft roster entry: creates weekend_roster + weekend_group_members
 * rows and archives the draft.
 */
export async function finalizeDraftRosterMember(
  draftId: string
): Promise<Result<string, void>> {
  return DraftRosterService.finalizeDraftRosterMember(draftId)
}
