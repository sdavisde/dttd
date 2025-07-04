'use server'

import { CreateEmailResponseSuccess, Resend } from 'resend'
import SponsorshipNotificationEmail from '@/components/email/SponsorshipNotificationEmail'
import { createClient } from '@/lib/supabase/server'
import { Result, err, ok } from '@/lib/results'
import { logger } from '@/lib/logger'
import { Tables } from '@/database.types'
import CandidateFormsEmail from '@/components/email/CandidateFormsEmail'
import PaymentRequestEmail from '@/components/email/PaymentRequestEmail'

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

// sends a payment request for candidate fees tied to `candidateId`
export async function sendPaymentRequestEmail(
  candidateId: string
): Promise<Result<Error, { data: CreateEmailResponseSuccess | null }>> {
  try {
    logger.info(`Starting payment request email for candidate: ${candidateId}`)
    const supabase = await createClient()

    // Fetch candidate data with sponsorship request information
    const { data: candidateWithSponsorship, error: candidateError } = await supabase
      .from('candidates')
      .select(
        `
        *,
        sponsorship_request!inner(
          id,
          payment_owner,
          sponsor_name,
          sponsor_email
        )
      `
      )
      .eq('id', candidateId)
      .single()

    if (candidateError) {
      logger.error(`Failed to fetch candidate ${candidateId}:`, candidateError)
      return err(new Error(`Failed to fetch candidate: ${candidateError.message}`))
    }

    if (!candidateWithSponsorship) {
      logger.error(`Candidate not found for candidateId: ${candidateId}`)
      return err(new Error('Candidate not found'))
    }

    const { sponsorship_request: sponsorshipRequest, ...candidate } = candidateWithSponsorship

    logger.info(`Found candidate: ${candidate.name} (${candidate.email})`)
    logger.info(`Found sponsorship request with payment_owner: ${sponsorshipRequest.payment_owner}`)

    // Determine payment owner and their contact information
    const paymentOwner = sponsorshipRequest.payment_owner as 'candidate' | 'sponsor'
    let paymentOwnerEmail: string = ''
    let paymentOwnerName: string = ''

    if (paymentOwner === 'sponsor') {
      if (!sponsorshipRequest.sponsor_email) {
        logger.error(`Sponsor email not found for sponsorship request ${sponsorshipRequest.id}`)
        return err(new Error('Sponsor email not found'))
      }
      paymentOwnerEmail = sponsorshipRequest.sponsor_email
      paymentOwnerName = sponsorshipRequest.sponsor_name ?? 'Sponsor'
    }

    if (paymentOwner === 'candidate') {
      if (!candidate.email) {
        logger.error(`Candidate email not found for ${candidate.name}`)
        return err(new Error('Candidate email not found'))
      }
      paymentOwnerEmail = candidate.email
      paymentOwnerName = candidate.name ?? 'Candidate'
    }

    logger.info(`Sending payment request email to ${paymentOwnerName} (${paymentOwnerEmail})`)

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Dusty Trails Tres Dias <noreply@dustytrailstresdias.org>',
      to: [paymentOwnerEmail],
      subject: `Candidate Fees for ${candidate.name ?? 'Candidate'} - Dusty Trails Tres Dias`,
      react: PaymentRequestEmail({
        candidate,
        paymentOwner,
        paymentOwnerEmail,
        paymentOwnerName,
      }),
    })

    if (error) {
      logger.error(`Failed to send payment request email for ${candidate.name}`, {
        error,
      })
      return err(new Error(`Failed to send email: ${error.message}`))
    }

    logger.info(`Payment request email sent successfully for ${candidate.name}`)

    // Update candidate status to awaiting_payment
    const { error: updateError } = await supabase
      .from('candidates')
      .update({ status: 'awaiting_payment' })
      .eq('id', candidateId)

    if (updateError) {
      logger.error(`Failed to update candidate status to awaiting_payment for ${candidate.name}`, {
        error: updateError,
      })
      // Don't return error here as the email was sent successfully
    } else {
      logger.info(`Updated candidate ${candidate.name} status to awaiting_payment`)
    }

    return ok({ data })
  } catch (error) {
    logger.error(`Error while sending payment request email:`, error)
    return err(
      new Error(
        `Error while sending payment request email: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}
