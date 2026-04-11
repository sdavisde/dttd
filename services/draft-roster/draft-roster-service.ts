import 'server-only'

import { isNil } from 'lodash'
import type { Result } from '@/lib/results'
import { err, ok, isErr } from '@/lib/results'
import { logger } from '@/lib/logger'
import * as DraftRosterRepository from './repository'
import * as WeekendRepository from '@/services/weekend/repository'
import * as GroupMemberRepository from '@/services/weekend-group-member/repository'
import type { DraftRosterMember, RawDraftRosterWithUser } from './types'

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
): Promise<Result<string, void>> {
  return DraftRosterRepository.insertDraft({
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
    await DraftRosterRepository.findDraftsByWeekendId(weekendId)
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
  const draftResult = await DraftRosterRepository.findDraftById(draftId)
  if (isErr(draftResult)) {
    return err(draftResult.error)
  }

  if (isNil(draftResult.data)) {
    return err('Draft roster entry not found')
  }

  return DraftRosterRepository.deleteDraft(draftId)
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
  const draftResult = await DraftRosterRepository.findDraftById(draftId)
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
  const finalizeResult = await DraftRosterRepository.markDraftFinalized(draftId)
  if (isErr(finalizeResult)) {
    logger.warn(
      { draftId, error: finalizeResult.error },
      'Failed to mark draft as finalized — roster row was created successfully'
    )
  }

  return ok(undefined)
}
