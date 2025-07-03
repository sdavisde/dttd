'use server'

import { createClient } from '@/lib/supabase/server'
import { Result, err, ok } from '@/lib/results'
import { Tables } from '@/database.types'

export async function createCandidateFromSponsorshipRequest(
  sponsorshipRequestId: number
): Promise<Result<Error, { candidate: Tables<'candidates'> }>> {
  try {
    const supabase = await createClient()

    const { data: sponsorshipRequest, error: sponsorshipRequestError } = await supabase
      .from('sponsorship_request')
      .select('*')
      .eq('id', sponsorshipRequestId)
      .single()

    if (sponsorshipRequestError) {
      return err(new Error(`Failed to fetch sponsorship request: ${sponsorshipRequestError.message}`))
    }

    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .insert({
        email: sponsorshipRequest.candidate_email,
        name: sponsorshipRequest.candidate_name,
        sponsor_name: sponsorshipRequest.sponsor_name,
        status: 'sponsored',
        weekend_id: null,
      })
      .select()
      .single()

    if (candidateError) {
      return err(new Error(`Failed to create candidate: ${candidateError.message}`))
    }

    return ok({ candidate })
  } catch (error) {
    return err(
      new Error(
        `Error while creating candidate from sponsorship request: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

/**
 * Delete a candidate or sponsorship request
 */
export async function deleteCandidate(
  id: string | number,
  type: 'candidate' | 'sponsorship_request'
): Promise<Result<Error, { success: boolean }>> {
  try {
    const supabase = await createClient()

    if (type === 'candidate') {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id as string)

      if (error) {
        return err(new Error(`Failed to delete candidate: ${error.message}`))
      }
    } else {
      const { error } = await supabase
        .from('sponsorship_request')
        .delete()
        .eq('id', id as number)

      if (error) {
        return err(new Error(`Failed to delete sponsorship request: ${error.message}`))
      }
    }

    return ok({ success: true })
  } catch (error) {
    return err(new Error(`Error while deleting ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`))
  }
}
