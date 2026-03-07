'use server'

import { Result, err, ok, isErr } from '@/lib/results'
import { isNil, isEmpty } from 'lodash'
import * as GroupMemberRepository from '@/services/weekend-group-member/repository'
import {
  getTeamFormsProgress as serviceGetTeamFormsProgress,
  hasCompletedAllTeamForms as serviceHasCompletedAllTeamForms,
} from '@/services/weekend-group-member/weekend-group-member-service'

export type TeamFormsProgress = {
  steps: {
    statementOfBelief: boolean
    commitmentForm: boolean
    releaseOfClaim: boolean
    campWaiver: boolean
    infoSheet: boolean
  }
  completedSteps: string[]
  totalSteps: number
  completedCount: number
  isComplete: boolean
}

// ---------------------------------------------------------------------------
// Internal helper: resolve groupMemberId from a rosterId (backward-compat bridge)
// ---------------------------------------------------------------------------
async function resolveGroupMemberId(
  rosterId: string
): Promise<Result<string, string>> {
  const result = await GroupMemberRepository.getGroupMemberByRosterId(rosterId)
  if (isErr(result)) {
    return err(result.error)
  }
  return ok(result.data.id)
}

/**
 * Marks the Statement of Belief as completed for a given roster record.
 */
export async function signStatementOfBelief(
  rosterId: string
): Promise<Result<string, void>> {
  if (isNil(rosterId) || isEmpty(rosterId)) {
    return err('Roster ID is required')
  }

  const groupMemberResult = await resolveGroupMemberId(rosterId)
  if (isErr(groupMemberResult)) {
    return err(groupMemberResult.error)
  }

  return GroupMemberRepository.upsertFormCompletion(
    groupMemberResult.data,
    'statement_of_belief',
    new Date().toISOString()
  )
}

/**
 * Marks the Commitment Form as completed for a given roster record.
 */
export async function signCommitmentForm(
  rosterId: string
): Promise<Result<string, void>> {
  if (isNil(rosterId) || isEmpty(rosterId)) {
    return err('Roster ID is required')
  }

  const groupMemberResult = await resolveGroupMemberId(rosterId)
  if (isErr(groupMemberResult)) {
    return err(groupMemberResult.error)
  }

  return GroupMemberRepository.upsertFormCompletion(
    groupMemberResult.data,
    'commitment_form',
    new Date().toISOString()
  )
}

/**
 * Submits the Release of Claim form, saving special needs information.
 * Updates special_needs on all active roster rows for the same group.
 */
export async function submitReleaseOfClaim(
  rosterId: string,
  specialNeeds: string | null
): Promise<Result<string, void>> {
  if (isNil(rosterId) || isEmpty(rosterId)) {
    return err('Roster ID is required')
  }

  const groupMemberResult = await resolveGroupMemberId(rosterId)
  if (isErr(groupMemberResult)) {
    return err(groupMemberResult.error)
  }

  const groupMemberId = groupMemberResult.data

  // Upsert form completion
  const formResult = await GroupMemberRepository.upsertFormCompletion(
    groupMemberId,
    'release_of_claim',
    new Date().toISOString()
  )
  if (isErr(formResult)) {
    return formResult
  }

  // Update special_needs on all active roster rows for this group member
  const finalSpecialNeeds =
    !isNil(specialNeeds) && !isEmpty(specialNeeds.trim())
      ? specialNeeds.trim()
      : 'None'

  return GroupMemberRepository.updateSpecialNeedsForGroup(
    groupMemberId,
    finalSpecialNeeds
  )
}

/**
 * Marks the Camp Waiver as completed for a given roster record.
 */
export async function signCampWaiver(
  rosterId: string
): Promise<Result<string, void>> {
  if (isNil(rosterId) || isEmpty(rosterId)) {
    return err('Roster ID is required')
  }

  const groupMemberResult = await resolveGroupMemberId(rosterId)
  if (isErr(groupMemberResult)) {
    return err(groupMemberResult.error)
  }

  return GroupMemberRepository.upsertFormCompletion(
    groupMemberResult.data,
    'camp_waiver',
    new Date().toISOString()
  )
}

/**
 * Marks the Info Sheet as completed for a given roster record.
 */
export async function completeInfoSheet(
  rosterId: string
): Promise<Result<string, void>> {
  if (isNil(rosterId) || isEmpty(rosterId)) {
    return err('Roster ID is required')
  }

  const groupMemberResult = await resolveGroupMemberId(rosterId)
  if (isErr(groupMemberResult)) {
    return err(groupMemberResult.error)
  }

  return GroupMemberRepository.upsertFormCompletion(
    groupMemberResult.data,
    'info_sheet',
    new Date().toISOString()
  )
}

/**
 * Returns granular progress for team forms.
 */
export async function getTeamFormsProgress(
  rosterId: string
): Promise<Result<string, TeamFormsProgress>> {
  if (isNil(rosterId) || isEmpty(rosterId)) {
    return err('Roster ID is required')
  }

  const groupMemberResult = await resolveGroupMemberId(rosterId)
  if (isErr(groupMemberResult)) {
    return err(groupMemberResult.error)
  }

  return serviceGetTeamFormsProgress(groupMemberResult.data)
}

/**
 * Checks if a team member has completed all 5 required forms.
 */
export async function hasCompletedAllTeamForms(
  rosterId: string
): Promise<Result<string, boolean>> {
  const result = await getTeamFormsProgress(rosterId)
  if (isErr(result)) {
    return err(result.error)
  }
  return ok(result.data.isComplete)
}

/**
 * Updates emergency contact and medical information.
 * Writes to user_medical_profiles keyed by userId.
 */
export async function updateRosterMedicalInfo(
  userId: string,
  medicalInfo: {
    emergency_contact_name: string
    emergency_contact_phone: string
    medical_conditions?: string
  }
): Promise<Result<string, void>> {
  if (isNil(userId) || isEmpty(userId)) {
    return err('User ID is required')
  }

  return GroupMemberRepository.upsertUserMedicalProfile(userId, {
    emergency_contact_name: medicalInfo.emergency_contact_name,
    emergency_contact_phone: medicalInfo.emergency_contact_phone,
    medical_conditions:
      !isNil(medicalInfo.medical_conditions) &&
      !isEmpty(medicalInfo.medical_conditions.trim())
        ? medicalInfo.medical_conditions.trim()
        : null,
  })
}
