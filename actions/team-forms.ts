'use server'

import { createClient } from '@/lib/supabase/server'
import { Result, err, ok } from '@/lib/results'
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

    const finalSpecialNeeds = !isNil(specialNeeds) && !isEmpty(specialNeeds.trim())
        ? specialNeeds.trim()
        : 'None'

    const { error } = await supabase
        .from('weekend_roster')
        .update({ special_needs: finalSpecialNeeds, completed_release_of_claim_at: new Date().toISOString() })
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