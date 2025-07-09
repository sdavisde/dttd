'use server'

import { CreateEmailResponseSuccess, Resend } from 'resend'
import SponsorshipNotificationEmail from '@/components/email/SponsorshipNotificationEmail'
import { createClient } from '@/lib/supabase/server'
import { Result, err, ok, isErr } from '@/lib/results'
import { logger } from '@/lib/logger'
import { Tables } from '@/database.types'
import CandidateFormsEmail from '@/components/email/CandidateFormsEmail'
import { getHydratedCandidate } from './candidates'
import CandidateFeePaymentRequestEmail from '@/components/email/PaymentRequestEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

// Send sponsorship notification email to preweekend couple
export async function sendSponsorshipNotificationEmail(
  candidateId: string
): Promise<Result<Error, { data: CreateEmailResponseSuccess | null }>> {
  try {
    const supabase = await createClient()

    // Fetch sponsorship request data
    const candidateResult = await getHydratedCandidate(candidateId)

    if (isErr(candidateResult)) {
      return err(new Error(`Failed to fetch candidate: ${candidateResult.error.message}`))
    }

    const candidate = candidateResult.data

    if (!candidate) {
      return err(new Error('Candidate not found'))
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
      subject: `New Sponsorship Request - ${candidate.candidate_sponsorship_info?.candidate_name}`,
      react: SponsorshipNotificationEmail(candidate),
    })

    if (error) {
      logger.error(
        `Failed to send sponsorship notification email for ${candidate.candidate_sponsorship_info?.candidate_name}`,
        error
      )
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
  candidateSponsorshipInfo: Tables<'candidate_sponsorship_info'>
): Promise<Result<Error, { data: CreateEmailResponseSuccess | null }>> {
  try {
    if (!candidateSponsorshipInfo.candidate_email) {
      return err(new Error('Candidate email not found on candidate'))
    }

    const { data: candidateFormsEmail, error: candidateFormsEmailError } = await resend.emails.send({
      from: 'Dusty Trails Tres Dias <noreply@dustytrailstresdias.org>',
      to: [candidateSponsorshipInfo.candidate_email],
      subject: `Candidate Forms - ${candidateSponsorshipInfo.candidate_name}`,
      react: CandidateFormsEmail(candidateSponsorshipInfo),
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

    const candidateResult = await getHydratedCandidate(candidateId)
    if (isErr(candidateResult)) {
      logger.error(`Failed to fetch candidate ${candidateId}:`, candidateResult.error)
      return err(new Error(`Failed to fetch candidate: ${candidateResult.error.message}`))
    }

    const candidate = candidateResult.data

    logger.info(
      `Found candidate: ${candidate.candidate_sponsorship_info?.candidate_name} (${candidate.candidate_sponsorship_info?.candidate_email})`
    )
    logger.info(`Found sponsorship request with payment_owner: ${candidate.candidate_sponsorship_info?.payment_owner}`)

    // Determine payment owner and their contact information
    const paymentOwner = candidate.candidate_sponsorship_info?.payment_owner as 'candidate' | 'sponsor'
    let paymentOwnerEmail: string = ''
    let paymentOwnerName: string = ''

    if (paymentOwner === 'sponsor') {
      if (!candidate.candidate_sponsorship_info?.sponsor_email) {
        logger.error(`Sponsor email not found for sponsorship request ${candidate.candidate_sponsorship_info?.id}`)
        return err(new Error('Sponsor email not found'))
      }
      paymentOwnerEmail = candidate.candidate_sponsorship_info?.sponsor_email
      paymentOwnerName = candidate.candidate_sponsorship_info?.sponsor_name ?? 'Sponsor'
    }

    if (paymentOwner === 'candidate') {
      if (!candidate.candidate_sponsorship_info?.candidate_email) {
        logger.error(`Candidate email not found for ${candidate.candidate_sponsorship_info?.candidate_name}`)
        return err(new Error('Candidate email not found'))
      }
      paymentOwnerEmail = candidate.candidate_sponsorship_info?.candidate_email
      paymentOwnerName = candidate.candidate_sponsorship_info?.candidate_name ?? 'Candidate'
    }

    logger.info(`Sending payment request email to ${paymentOwnerName} (${paymentOwnerEmail})`)

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Dusty Trails Tres Dias <noreply@dustytrailstresdias.org>',
      to: [paymentOwnerEmail],
      subject: `Candidate Fees for ${candidate.candidate_sponsorship_info?.candidate_name ?? 'Candidate'} - Dusty Trails Tres Dias`,
      react: CandidateFeePaymentRequestEmail({
        candidate,
        paymentOwner,
        paymentOwnerName,
      }),
    })

    if (error) {
      logger.error(`Failed to send payment request email for ${candidate.candidate_sponsorship_info?.candidate_name}`, {
        error,
      })
      return err(new Error(`Failed to send email: ${error.message}`))
    }

    logger.info(`Payment request email sent successfully for ${candidate.candidate_sponsorship_info?.candidate_name}`)

    // Update candidate status to awaiting_payment
    const { error: updateError } = await supabase
      .from('candidates')
      .update({ status: 'awaiting_payment' })
      .eq('id', candidateId)

    if (updateError) {
      logger.error(
        `Failed to update candidate status to awaiting_payment for ${candidate.candidate_sponsorship_info?.candidate_name}`,
        {
          error: updateError,
        }
      )
      // Don't return error here as the email was sent successfully
    } else {
      logger.info(
        `Updated candidate ${candidate.candidate_sponsorship_info?.candidate_name} status to awaiting_payment`
      )
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
