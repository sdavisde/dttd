'use server'

import { createClient } from '@/lib/supabase/server'
import { Result, err, ok, isOk, isErr } from '@/lib/results'
import { isSupabaseError } from '@/lib/supabase/utils'
import { isNil, isEmpty } from 'lodash'

/**
 * Marks the Statement of Belief as completed for a given roster record.
 */
export async function signStatementOfBelief(
  rosterId: string
): Promise<Result<string, void>> {
  if (isNil(rosterId) || isEmpty(rosterId)) {
    return err('Roster ID is required')
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('weekend_roster')
    .update({ completed_statement_of_belief_at: new Date().toISOString() })
    .eq('id', rosterId)

  if (isSupabaseError(error)) {
    return err(`Failed to sign Statement of Belief: ${error.message}`)
  }

  return ok(undefined)
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

  const supabase = await createClient()

  const { error } = await supabase
    .from('weekend_roster')
    .update({ completed_commitment_form_at: new Date().toISOString() })
    .eq('id', rosterId)

  if (isSupabaseError(error)) {
    return err(`Failed to sign Commitment Form: ${error.message}`)
  }

  return ok(undefined)
}

/**
 * Submits the Release of Claim form, saving special needs information.
 * If no special needs, saves "None".
 */
export async function submitReleaseOfClaim(
  rosterId: string,
  specialNeeds: string | null
): Promise<Result<string, void>> {
  if (isNil(rosterId) || isEmpty(rosterId)) {
    return err('Roster ID is required')
  }

  const supabase = await createClient()

  const finalSpecialNeeds =
    !isNil(specialNeeds) && !isEmpty(specialNeeds.trim())
      ? specialNeeds.trim()
      : 'None'

  const { error } = await supabase
    .from('weekend_roster')
    .update({
      special_needs: finalSpecialNeeds,
      completed_release_of_claim_at: new Date().toISOString(),
    })
    .eq('id', rosterId)

  if (isSupabaseError(error)) {
    return err(`Failed to submit Release of Claim: ${error.message}`)
  }

  return ok(undefined)
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

  const supabase = await createClient()

  // Note: assuming column name is completed_camp_waiver
  const { error } = await supabase
    .from('weekend_roster')
    .update({ completed_camp_waiver_at: new Date().toISOString() })
    .eq('id', rosterId)

  if (isSupabaseError(error)) {
    return err(`Failed to sign Camp Waiver: ${error.message}`)
  }

  return ok(undefined)
}

/**
 * Updates emergency contact and medical information for a roster record.
 */
export async function updateRosterMedicalInfo(
  rosterId: string,
  medicalInfo: {
    emergency_contact_name: string
    emergency_contact_phone: string
    medical_conditions?: string
  }
): Promise<Result<string, void>> {
  if (isNil(rosterId) || isEmpty(rosterId)) {
    return err('Roster ID is required')
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('weekend_roster')
    .update({
      emergency_contact_name: medicalInfo.emergency_contact_name,
      emergency_contact_phone: medicalInfo.emergency_contact_phone,
      medical_conditions:
        !isNil(medicalInfo.medical_conditions) &&
        !isEmpty(medicalInfo.medical_conditions.trim())
          ? medicalInfo.medical_conditions.trim()
          : null,
    })
    .eq('id', rosterId)

  if (isSupabaseError(error)) {
    return err(`Failed to update medical information: ${error.message}`)
  }

  return ok(undefined)
}

export async function completeInfoSheet(
  rosterId: string
): Promise<Result<string, void>> {
  if (isNil(rosterId) || isEmpty(rosterId)) {
    return err('Roster ID is required')
  }

  const supabase = await createClient()

  // Note: assuming column name is completed_info_sheet
  const { error } = await supabase
    .from('weekend_roster')
    .update({ completed_info_sheet_at: new Date().toISOString() })
    .eq('id', rosterId)

  if (isSupabaseError(error)) {
    return err(`Failed to complete Info Sheet: ${error.message}`)
  }

  return ok(undefined)
}

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

/**
 * Returns granular progress for team forms.
 */
export async function getTeamFormsProgress(
  rosterId: string
): Promise<Result<string, TeamFormsProgress>> {
  if (isNil(rosterId) || isEmpty(rosterId)) {
    return err('Roster ID is required')
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekend_roster')
    .select(
      `
            completed_statement_of_belief_at,
            completed_commitment_form_at,
            completed_release_of_claim_at,
            completed_camp_waiver_at,
            completed_info_sheet_at
        `
    )
    .eq('id', rosterId)
    .single()

  if (isSupabaseError(error)) {
    return err(`Failed to check form completion status: ${error.message}`)
  }

  if (!data) {
    return err('Roster record not found')
  }

  const steps = {
    statementOfBelief: !isNil(data.completed_statement_of_belief_at),
    commitmentForm: !isNil(data.completed_commitment_form_at),
    releaseOfClaim: !isNil(data.completed_release_of_claim_at),
    campWaiver: !isNil(data.completed_camp_waiver_at),
    infoSheet: !isNil(data.completed_info_sheet_at),
  }

  const stepIds = {
    statementOfBelief: 'statement-of-belief',
    commitmentForm: 'commitment-form',
    releaseOfClaim: 'release-of-claim',
    campWaiver: 'camp-waiver',
    infoSheet: 'info-sheet',
  }

  const completedSteps: string[] = []
  if (steps.statementOfBelief) completedSteps.push(stepIds.statementOfBelief)
  if (steps.commitmentForm) completedSteps.push(stepIds.commitmentForm)
  if (steps.releaseOfClaim) completedSteps.push(stepIds.releaseOfClaim)
  if (steps.campWaiver) completedSteps.push(stepIds.campWaiver)
  if (steps.infoSheet) completedSteps.push(stepIds.infoSheet)

  // Total steps is 5
  const totalSteps = 5
  const completedCount = completedSteps.length
  const isComplete = completedCount === totalSteps

  return ok({
    steps,
    completedSteps,
    totalSteps,
    completedCount,
    isComplete,
  })
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
