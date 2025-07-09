'use server'

import { createClient } from '@/lib/supabase/server'
import { Result, err, ok } from '@/lib/results'
import { SponsorFormSchema } from '@/app/sponsor/SponsorForm'
import { CandidateStatus, HydratedCandidate } from '@/lib/candidates/types'

/**
 * Create a new candidate with sponsorship information
 */
export async function createCandidateWithSponsorshipInfo(
  data: SponsorFormSchema
): Promise<Result<Error, HydratedCandidate>> {
  try {
    const supabase = await createClient()

    // Upsert the candidate record
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .insert({ status: 'sponsored' })
      .select()
      .single()

    if (candidateError) {
      return err(new Error(`Failed to create candidate: ${candidateError.message}`))
    }

    // Create the sponsorship info record
    const { error: sponsorshipInfoError } = await supabase.from('candidate_sponsorship_info').insert({
      candidate_id: candidate.id,
      ...data,
    })

    if (sponsorshipInfoError) {
      return err(new Error(`Failed to create sponsorship info: ${sponsorshipInfoError.message}`))
    }

    return ok(candidate)
  } catch (error) {
    return err(
      new Error(
        `Error while creating candidate with sponsorship info: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

/**
 * Delete a candidate and all related data
 */
export async function deleteCandidate(candidateId: string): Promise<Result<Error, { success: boolean }>> {
  try {
    const supabase = await createClient()

    // Delete sponsorship info first (due to foreign key constraint)
    const { error: sponsorshipInfoError } = await supabase
      .from('candidate_sponsorship_info')
      .delete()
      .eq('candidate_id', candidateId)

    if (sponsorshipInfoError) {
      return err(new Error(`Failed to delete sponsorship info: ${sponsorshipInfoError.message}`))
    }

    // Delete candidate info if it exists
    const { error: candidateInfoError } = await supabase.from('candidate_info').delete().eq('candidate_id', candidateId)

    if (candidateInfoError) {
      return err(new Error(`Failed to delete candidate info: ${candidateInfoError.message}`))
    }

    // Finally delete the candidate
    const { error: candidateError } = await supabase.from('candidates').delete().eq('id', candidateId)

    if (candidateError) {
      return err(new Error(`Failed to delete candidate: ${candidateError.message}`))
    }

    return ok({ success: true })
  } catch (error) {
    return err(new Error(`Error while deleting candidate: ${error instanceof Error ? error.message : 'Unknown error'}`))
  }
}

/**
 * Gets a candidate with all related information
 */
export async function getHydratedCandidate(candidateId: string): Promise<Result<Error, HydratedCandidate>> {
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
      return err(new Error(`Failed to get candidate with details: ${candidateError.message}`))
    }

    const hydratedCandidate: HydratedCandidate = {
      ...candidate,
      candidate_sponsorship_info: candidate.candidate_sponsorship_info.at(0),
      candidate_info: candidate.candidate_info.at(0),
    }

    return ok(hydratedCandidate)
  } catch (error) {
    return err(
      new Error(
        `Error while getting candidate with details: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

/**
 * Gets all candidates with their related information
 */
export async function getAllCandidatesWithDetails(): Promise<Result<Error, Array<HydratedCandidate>>> {
  try {
    const supabase = await createClient()

    const { data: candidates, error: candidatesError } = await supabase.from('candidates').select(`
        *,
        candidate_sponsorship_info(*),
        candidate_info(*),
        weekends (
          title
        )
      `)

    if (candidatesError) {
      return err(new Error(`Failed to get candidates with details: ${candidatesError.message}`))
    }

    return ok(
      candidates.map((candidate) => ({
        ...candidate,
        candidate_sponsorship_info: candidate.candidate_sponsorship_info.at(0),
        candidate_info: candidate.candidate_info.at(0),
      }))
    )
  } catch (error) {
    return err(
      new Error(
        `Error while getting candidates with details: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

export async function updateCandidateStatus(
  candidateId: string,
  status: CandidateStatus
): Promise<Result<Error, { success: boolean }>> {
  try {
    const supabase = await createClient()

    const { error: updateError } = await supabase.from('candidates').update({ status }).eq('id', candidateId)

    if (updateError) {
      return err(new Error(`Failed to update candidate status: ${updateError.message}`))
    }

    return ok({ success: true })
  } catch (error) {
    return err(
      new Error(`Error while updating candidate status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    )
  }
}
