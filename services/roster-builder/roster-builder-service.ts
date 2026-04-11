import 'server-only'

import { isNil } from 'lodash'
import type { Result } from '@/lib/results'
import { err, ok, isErr, safeParse, isOk } from '@/lib/results'
import { logger } from '@/lib/logger'
import {
  calculateExperienceLevel,
  calculateRectorReadyStatus,
  countDistinctWeekends,
  TEAM_HEAD_ROLES,
} from '@/lib/users/experience/calculations'
import { UserExperienceSchema } from '@/lib/users/experience/validation'
import type { UserExperience } from '@/lib/users/experience/validation'
import type { Tables } from '@/database.types'
import { computeEligibility } from './eligibility'
import * as RosterBuilderRepository from './repository'
import * as WeekendRepository from '@/services/weekend/repository'
import * as GroupMemberRepository from '@/services/weekend-group-member/repository'
import * as MasterRosterService from '@/services/master-roster/master-roster-service'
import type {
  RosterBuilderCommunityMember,
  AssignmentStatus,
  DraftRosterMember,
  RawDraftRosterWithUser,
} from './types'

// ============================================================================
// Community Data
// ============================================================================

/**
 * Parses raw experience records into validated UserExperience objects.
 * Silently drops records that fail validation.
 */
function parseExperienceRecords(
  raw: Array<Tables<'users_experience'>>
): UserExperience[] {
  return raw
    .map((record) => safeParse(record, UserExperienceSchema))
    .filter(isOk)
    .map((result) => result.data)
}

/**
 * Determines whether a user has been a section head based on experience records.
 * Uses the TEAM_HEAD_ROLES whitelist from the existing codebase.
 */
function computeHasBeenSectionHead(experience: UserExperience[]): boolean {
  const teamHeadRoleStrings = TEAM_HEAD_ROLES as string[]
  return experience.some((r) => teamHeadRoleStrings.includes(r.cha_role))
}

/**
 * Determines whether a user has given a rollo based on experience records.
 */
function computeHasGivenRollo(experience: UserExperience[]): boolean {
  return experience.some((r) => !isNil(r.rollo))
}

/**
 * Fetches all community members with computed experience, eligibility, and
 * assignment data for the roster builder.
 */
export async function getRosterBuilderCommunityData(
  weekendId: string
): Promise<Result<string, RosterBuilderCommunityMember[]>> {
  const communityResult =
    await MasterRosterService.getCommunityDataForRosterBuilder(weekendId)
  if (isErr(communityResult)) {
    return err(communityResult.error)
  }

  const { users, rosterAssignments, draftAssignments, secuelaAttendees } =
    communityResult.data

  const members: RosterBuilderCommunityMember[] = users.map((user) => {
    const experience = parseExperienceRecords(user.users_experience)
    const weekendsServed = countDistinctWeekends(user.users_experience)
    const experienceLevel = calculateExperienceLevel(weekendsServed)
    const rectorReadyStatus = calculateRectorReadyStatus(experience)
    const hasBeenSectionHead = computeHasBeenSectionHead(experience)
    const hasGivenRollo = computeHasGivenRollo(experience)
    const attendsSecuela = secuelaAttendees.has(user.id)

    // Determine assignment status: finalized roster takes priority over draft
    let assignmentStatus: AssignmentStatus
    const rosterAssignment = rosterAssignments.get(user.id)
    const draftAssignment = draftAssignments.get(user.id)

    if (!isNil(rosterAssignment)) {
      assignmentStatus = {
        type: 'finalized',
        rosterId: rosterAssignment.rosterId,
        chaRole: rosterAssignment.chaRole,
        rollo: rosterAssignment.rollo,
      }
    } else if (!isNil(draftAssignment)) {
      assignmentStatus = {
        type: 'draft',
        draftId: draftAssignment.draftId,
        chaRole: draftAssignment.chaRole,
        rollo: draftAssignment.rollo,
      }
    } else {
      assignmentStatus = { type: 'unassigned' }
    }

    // Compute eligibility for roles with special requirements
    const eligibility = computeEligibility({
      hasBeenSectionHead,
      hasGivenRollo,
      rectorReadyIsReady: rectorReadyStatus.isReady,
    })

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phoneNumber: user.phone_number,
      church: user.church_affiliation,
      gender: user.gender,
      experience,
      experienceLevel,
      weekendsServed,
      rectorReadyStatus,
      hasBeenSectionHead,
      hasGivenRollo,
      attendsSecuela,
      assignmentStatus,
      eligibility,
    }
  })

  return ok(members)
}

// ============================================================================
// Draft Roster Management
// ============================================================================

/**
 * Normalizes a raw draft roster record with user data into the service DTO.
 */
function normalizeDraftMember(raw: RawDraftRosterWithUser): DraftRosterMember {
  return {
    id: raw.id,
    weekendId: raw.weekend_id,
    userId: raw.user_id,
    chaRole: raw.cha_role,
    rollo: raw.rollo,
    createdBy: raw.created_by,
    createdAt: raw.created_at,
    finalizedAt: raw.finalized_at,
    user: {
      id: raw.users?.id ?? raw.user_id,
      firstName: raw.users?.first_name ?? null,
      lastName: raw.users?.last_name ?? null,
      email: raw.users?.email ?? null,
      phoneNumber: raw.users?.phone_number ?? null,
    },
  }
}

/**
 * Adds a community member to the draft roster for a weekend.
 * Access control is enforced at the page level (rector-only page).
 */
export async function addDraftRosterMember(
  weekendId: string,
  userId: string,
  chaRole: string,
  createdBy: string,
  rollo?: string
): Promise<Result<string, string>> {
  return RosterBuilderRepository.insertDraft({
    weekend_id: weekendId,
    user_id: userId,
    cha_role: chaRole,
    rollo: rollo ?? null,
    created_by: createdBy,
  })
}

/**
 * Returns all non-finalized draft roster entries for a weekend.
 * Access control is enforced at the page level (rector-only page).
 */
export async function getDraftRoster(
  weekendId: string
): Promise<Result<string, DraftRosterMember[]>> {
  const draftsResult =
    await RosterBuilderRepository.findDraftsByWeekendId(weekendId)
  if (isErr(draftsResult)) {
    return err(draftsResult.error)
  }

  return ok(draftsResult.data.map(normalizeDraftMember))
}

/**
 * Removes a draft roster entry.
 * Access control is enforced at the page level (rector-only page).
 */
export async function removeDraftRosterMember(
  draftId: string
): Promise<Result<string, void>> {
  const draftResult = await RosterBuilderRepository.findDraftById(draftId)
  if (isErr(draftResult)) {
    return err(draftResult.error)
  }

  if (isNil(draftResult.data)) {
    return err('Draft roster entry not found')
  }

  return RosterBuilderRepository.deleteDraft(draftId)
}

/**
 * Finalizes a draft roster entry:
 * 1. Creates a weekend_roster row with status 'awaiting_payment'
 * 2. Creates a weekend_group_members row if needed
 * 3. Marks the draft as finalized (sets finalized_at)
 *
 * Access control is enforced at the page level (rector-only page).
 */
export async function finalizeDraftRosterMember(
  draftId: string
): Promise<Result<string, void>> {
  const draftResult = await RosterBuilderRepository.findDraftById(draftId)
  if (isErr(draftResult)) {
    return err(draftResult.error)
  }

  if (isNil(draftResult.data)) {
    return err('Draft roster entry not found')
  }

  const draft = draftResult.data

  if (!isNil(draft.finalized_at)) {
    return err('Draft roster entry has already been finalized')
  }

  // Step 1: Create the weekend_roster row
  const rosterResult = await WeekendRepository.insertWeekendRosterMember({
    weekend_id: draft.weekend_id,
    user_id: draft.user_id,
    status: 'awaiting_payment',
    cha_role: draft.cha_role,
    rollo: draft.rollo,
  })

  if (isErr(rosterResult)) {
    return err(`Failed to create roster entry: ${rosterResult.error}`)
  }

  // Step 2: Ensure a weekend_group_members row exists
  const weekendResult = await WeekendRepository.findWeekendById(
    draft.weekend_id
  )
  if (isErr(weekendResult) || isNil(weekendResult.data?.group_id)) {
    logger.warn(
      { weekendId: draft.weekend_id, userId: draft.user_id },
      'Could not upsert weekend_group_members during finalization: weekend or group_id not found'
    )
  } else {
    const groupResult = await GroupMemberRepository.upsertGroupMember(
      weekendResult.data.group_id,
      draft.user_id
    )
    if (isErr(groupResult)) {
      logger.warn(
        { error: groupResult.error },
        'Failed to upsert weekend_group_members during finalization'
      )
    }
  }

  // Step 3: Archive the draft by setting finalized_at
  const finalizeResult =
    await RosterBuilderRepository.markDraftFinalized(draftId)
  if (isErr(finalizeResult)) {
    logger.warn(
      { draftId, error: finalizeResult.error },
      'Failed to mark draft as finalized — roster row was created successfully'
    )
  }

  return ok(undefined)
}

// ============================================================================
// Finalized Roster Management
// ============================================================================

/**
 * Drops a finalized roster member by setting their status to 'drop'.
 * The member returns to the community pool.
 */
export async function dropFinalizedRosterMember(
  rosterId: string
): Promise<Result<string, void>> {
  return WeekendRepository.dropWeekendRosterMember(rosterId)
}

/**
 * Removes a finalized roster member by deleting the weekend_roster row entirely.
 * The member returns to the community pool.
 */
export async function removeFinalizedRosterMember(
  rosterId: string
): Promise<Result<string, void>> {
  return WeekendRepository.deleteWeekendRosterMember(rosterId)
}
