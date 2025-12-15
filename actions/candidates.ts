'use server'

import { createClient } from '@/lib/supabase/server'
import { Result, err, ok } from '@/lib/results'
import { SponsorFormSchema } from '@/app/(public)/sponsor/SponsorForm'
import {
  CandidateStatus,
  HydratedCandidate,
  CandidateFormData,
} from '@/lib/candidates/types'

/**
 * Create a new candidate with sponsorship information
 */
export async function createCandidateWithSponsorshipInfo(
  data: SponsorFormSchema
): Promise<Result<string, HydratedCandidate>> {
  try {
    const supabase = await createClient()

    const { weekend_id, ...sponsorshipInfo } = data

    // Upsert the candidate record
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .insert({ status: 'sponsored', weekend_id })
      .select()
      .single()

    if (candidateError) {
      return err(`Failed to create candidate: ${candidateError.message}`)
    }

    // Create the sponsorship info record
    const { error: sponsorshipInfoError } = await supabase
      .from('candidate_sponsorship_info')
      .insert({
        candidate_id: candidate.id,
        ...sponsorshipInfo,
      })

    if (sponsorshipInfoError) {
      return err(
        `Failed to create sponsorship info: ${sponsorshipInfoError.message}`
      )
    }

    return ok(candidate as HydratedCandidate)
  } catch (error) {
    return err(
      `Error while creating candidate with sponsorship info: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Delete a candidate and all related data
 */
export async function deleteCandidate(
  candidateId: string
): Promise<Result<string, { success: boolean }>> {
  try {
    const supabase = await createClient()

    // Delete sponsorship info first (due to foreign key constraint)
    const { error: sponsorshipInfoError } = await supabase
      .from('candidate_sponsorship_info')
      .delete()
      .eq('candidate_id', candidateId)

    if (sponsorshipInfoError) {
      return err(
        `Failed to delete sponsorship info: ${sponsorshipInfoError.message}`
      )
    }

    // Delete candidate info if it exists
    const { error: candidateInfoError } = await supabase
      .from('candidate_info')
      .delete()
      .eq('candidate_id', candidateId)

    if (candidateInfoError) {
      return err(
        `Failed to delete candidate info: ${candidateInfoError.message}`
      )
    }

    // Finally delete the candidate
    const { error: candidateError } = await supabase
      .from('candidates')
      .delete()
      .eq('id', candidateId)

    if (candidateError) {
      return err(`Failed to delete candidate: ${candidateError.message}`)
    }

    return ok({ success: true })
  } catch (error) {
    return err(
      `Error while deleting candidate: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Gets a candidate with all related information
 */
export async function getHydratedCandidate(
  candidateId: string
): Promise<Result<string, HydratedCandidate>> {
  try {
    const supabase = await createClient()

    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select(
        `
        *,
        candidate_sponsorship_info(*),
        candidate_info(*)
      `
      )
      .eq('id', candidateId)
      .single()

    if (candidateError) {
      return err(
        `Failed to get candidate with details: ${candidateError.message}`
      )
    }

    const hydratedCandidate: HydratedCandidate = {
      ...candidate,
      candidate_sponsorship_info: candidate.candidate_sponsorship_info.at(0),
      candidate_info: candidate.candidate_info.at(0),
    } as HydratedCandidate

    return ok(hydratedCandidate)
  } catch (error) {
    return err(
      `Error while getting candidate with details: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Gets all candidates with their related information
 */
import { WeekendType } from '@/lib/weekend/types'

export type CandidateFilterOptions = {
  weekendGroupId?: string
  weekendType?: WeekendType
}

/**
 * Gets all candidates with their related information
 */
export async function getAllCandidatesWithDetails(
  options: CandidateFilterOptions = {}
): Promise<Result<string, Array<HydratedCandidate>>> {
  try {
    const supabase = await createClient()

    // Determine if we need to filter by weekend (requires inner join)
    const needsWeekendFilter = !!options.weekendGroupId || !!options.weekendType
    const weekendJoinType = needsWeekendFilter ? '!inner' : ''

    let query = supabase.from('candidates').select(`
        *,
        candidate_sponsorship_info(*),
        candidate_info(*),
        weekends${weekendJoinType} (
          id,
          title,
          group_id,
          type
        )
      `)

    if (options.weekendGroupId) {
      query = query.eq('weekends.group_id', options.weekendGroupId)
    }

    if (options.weekendType) {
      query = query.eq('weekends.type', options.weekendType)
    }

    const { data: candidates, error: candidatesError } = await query

    if (candidatesError) {
      return err(
        `Failed to get candidates with details: ${candidatesError.message}`
      )
    }

    return ok(
      candidates.map((candidate) => ({
        ...candidate,
        candidate_sponsorship_info: candidate.candidate_sponsorship_info.at(0),
        candidate_info: candidate.candidate_info.at(0),
      })) as HydratedCandidate[]
    )
  } catch (error) {
    return err(
      `Error while getting candidates with details: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function updateCandidateStatus(
  candidateId: string,
  status: CandidateStatus
): Promise<Result<string, { success: boolean }>> {
  try {
    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('candidates')
      .update({ status })
      .eq('id', candidateId)

    if (updateError) {
      return err(`Failed to update candidate status: ${updateError.message}`)
    }

    return ok({ success: true })
  } catch (error) {
    return err(
      `Error while updating candidate status: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Add Candidate Info when a user submits their candidate forms
 */
export async function addCandidateInfo(
  candidateId: string,
  data: CandidateFormData
): Promise<Result<string, true>> {
  try {
    const supabase = await createClient()

    const { error: candidateInfoError } = await supabase
      .from('candidate_info')
      .insert({
        candidate_id: candidateId,
        ...data,
      })

    if (candidateInfoError) {
      return err(`Failed to add candidate info: ${candidateInfoError.message}`)
    }

    return ok(true)
  } catch (error) {
    return err(
      `Error while adding candidate info: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Update the payment owner for a candidate
 */
export async function updateCandidatePaymentOwner(
  candidateId: string,
  paymentOwner: string
): Promise<Result<string, { success: boolean }>> {
  try {
    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('candidate_sponsorship_info')
      .update({ payment_owner: paymentOwner })
      .eq('candidate_id', candidateId)

    if (updateError) {
      return err(`Failed to update payment owner: ${updateError.message}`)
    }

    return ok({ success: true })
  } catch (error) {
    return err(
      `Error while updating payment owner: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
