'use server'

import { CreateEmailResponseSuccess, Resend } from 'resend'
import SponsorshipNotificationEmail from '@/components/email/SponsorshipNotificationEmail'
import { createClient } from '@/lib/supabase/server'
import { Result, err, ok } from '@/lib/results'
import { logger } from '@/lib/logger'
import { Tables } from '@/database.types'
import CandidateFormsEmail from '@/components/email/CandidateFormsEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

// Send sponsorship notification email to preweekend couple
export async function sendSponsorshipNotificationEmail(
  sponsorshipRequestId: number
): Promise<Result<Error, { data: CreateEmailResponseSuccess | null }>> {
  try {
    const supabase = await createClient()

    // Fetch sponsorship request data
    const { data: sponsorshipRequest, error: fetchError } = await supabase
      .from('sponsorship_request')
      .select('*')
      .eq('id', sponsorshipRequestId)
      .single()

    if (fetchError) {
      return err(new Error(`Failed to fetch sponsorship request: ${fetchError.message}`))
    }

    if (!sponsorshipRequest) {
      return err(new Error('Sponsorship request not found'))
    }

    const { data: preweekendCouple, error: preweekendCoupleError } = await supabase
      .from('contact_information')
      .select('*')
      .eq('id', 'preweekend-couple')
      .single()
    if (preweekendCoupleError) {
      return err(new Error(`Failed to fetch preweekend couple: ${preweekendCoupleError.message}`))
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Dusty Trails Tres Dias <noreply@dustytrailstresdias.org>',
      to: [preweekendCouple.email_address ?? 'admin@dustytrailstresdias.org'],
      subject: `New Sponsorship Request - ${sponsorshipRequest.candidate_name}`,
      react: SponsorshipNotificationEmail(sponsorshipRequest),
    })

    if (error) {
      logger.error(`Failed to send sponsorship notification email for ${sponsorshipRequest.candidate_name}`, {
        error,
      })
      return err(new Error(`Failed to send email: ${error.message}`))
    }

    return ok({ data })
  } catch (error) {
    return err(
      new Error(
        `Error while sending sponsorship notification email: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

/**
 * Send candidate forms to sponsorship request, turning them into a candidate
 */
export async function sendCandidateForms(
  candidate: Tables<'candidates'>
): Promise<Result<Error, { data: CreateEmailResponseSuccess | null }>> {
  try {
    if (!candidate.email) {
      return err(new Error('Candidate email not found on candidate'))
    }

    const { data: candidateFormsEmail, error: candidateFormsEmailError } = await resend.emails.send({
      from: 'Dusty Trails Tres Dias <noreply@dustytrailstresdias.org>',
      to: [candidate.email],
      subject: `Candidate Forms - ${candidate.name}`,
      react: CandidateFormsEmail(candidate),
    })

    if (candidateFormsEmailError) {
      return err(new Error(`Failed to send email: ${candidateFormsEmailError.message}`))
    }

    return ok({ data: candidateFormsEmail })
  } catch (error) {
    return err(
      new Error(`Error while sending candidate forms: ${error instanceof Error ? error.message : 'Unknown error'}`)
    )
  }
}
