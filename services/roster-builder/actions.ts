'use server'

import * as RosterBuilderService from './roster-builder-service'
import type { DraftRosterMember } from './types'
import type { Result } from '@/lib/results'

// Re-export types for convenience
export type {
  RosterBuilderCommunityMember,
  AssignmentStatus,
  EligibilityResult,
  DraftRosterMember,
} from './types'

// ============================================================================
// Community Data
// ============================================================================

/**
 * Fetches all community members with experience, eligibility, and assignment
 * data for the roster builder page.
 * Access control is enforced at the page level (rector-only page).
 */
export async function getRosterBuilderCommunityData(weekendId: string) {
  return RosterBuilderService.getRosterBuilderCommunityData(weekendId)
}

// ============================================================================
// Draft Roster Management
// ============================================================================

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
  return RosterBuilderService.addDraftRosterMember(
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
  return RosterBuilderService.getDraftRoster(weekendId)
}

/**
 * Removes a draft roster entry.
 */
export async function removeDraftRosterMember(
  draftId: string
): Promise<Result<string, void>> {
  return RosterBuilderService.removeDraftRosterMember(draftId)
}

/**
 * Finalizes a draft roster entry: creates weekend_roster + weekend_group_members
 * rows and archives the draft.
 */
export async function finalizeDraftRosterMember(
  draftId: string
): Promise<Result<string, void>> {
  return RosterBuilderService.finalizeDraftRosterMember(draftId)
}
