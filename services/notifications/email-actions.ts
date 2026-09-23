'use server'

import { isNil } from 'lodash'
import type { CreateEmailResponseSuccess } from 'resend'
import SponsorshipNotificationEmail from '@/components/email/SponsorshipNotificationEmail'
import CandidateFormsCompletedEmail from '@/components/email/CandidateFormsCompletedEmail'
import { createClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/results'
import { err, ok, isErr } from '@/lib/results'
import { logger } from '@/lib/logger'
import CandidateFormsEmail from '@/components/email/CandidateFormsEmail'
import { getHydratedCandidate } from '@/actions/candidates'
import CandidateFeePaymentRequestEmail from '@/components/email/PaymentRequestEmail'
import TeamPaymentNotificationEmail from '@/components/email/TeamPaymentNotificationEmail'
import {
  getSystemEmailFrom,
  isNotificationEnabled,
} from '@/services/settings/settings-service'
import {
  NOTIFY_NEW_SPONSORSHIPS_KEY,
  NOTIFY_PAYMENT_RECEIPTS_KEY,
} from '@/services/settings/site-settings'
import * as NotificationService from './notification-service'
import { getCandidateReviewUrl } from './review-links'
import { sendEmail } from './email-client'
import { formatWeekendLabelFor } from '@/lib/weekend'

/**
 * Send sponsorship notification email to preweekend couple
 */
export async function sendSponsorshipNotificationEmail(
  candidateId: string
): Promise<Result<string, { data: CreateEmailResponseSuccess | null }>> {
  try {
    if (!(await isNotificationEnabled(NOTIFY_NEW_SPONSORSHIPS_KEY))) {
      logger.info(
        `Skipped sponsorship notification email for candidate ${candidateId}: new sponsorship notifications are switched off in site settings`
      )
      return ok({ data: null })
    }

    // Fetch sponsorship request data
    const candidateResult = await getHydratedCandidate(candidateId)

    if (isErr(candidateResult)) {
      return err(`Failed to fetch candidate: ${candidateResult.error}`)
    }

    const candidate = candidateResult.data

    if (isNil(candidate)) {
      return err('Candidate not found')
    }

    // Get pre-weekend couple email
    const preWeekendEmailResult =
      await NotificationService.getPreWeekendCoupleEmail()
    if (isErr(preWeekendEmailResult)) {
      return err(preWeekendEmailResult.error)
    }

    // Send email using Resend
    const sendResult = await sendEmail('sponsorship-notification', {
      from: await getSystemEmailFrom(),
      to: [preWeekendEmailResult.data],
      subject: `New Sponsorship Request - ${candidate.candidate_sponsorship_info?.candidate_name}`,
      react: SponsorshipNotificationEmail({
        ...candidate,
        reviewUrl: await getCandidateReviewUrl(candidate),
      }),
    })

    if (isErr(sendResult)) {
      logger.error(
        `Failed to send sponsorship notification email for ${candidate.candidate_sponsorship_info?.candidate_name}: ${sendResult.error}`
      )
      return err(`Failed to send email: ${sendResult.error}`)
    }

    return ok({ data: sendResult.data })
  } catch (error) {
    return err(
      `Error while sending sponsorship notification email: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Send candidate forms to sponsorship request, turning them into a candidate
 */
export async function sendCandidateForms(
  candidateId: string
): Promise<Result<string, { data: CreateEmailResponseSuccess | null }>> {
  try {
    if (isNil(candidateId)) {
      return err('Candidate id is required to build the forms link')
    }

    const candidateResult = await getHydratedCandidate(candidateId)
    if (isErr(candidateResult)) {
      return err(`Failed to fetch candidate: ${candidateResult.error}`)
    }
    const candidateSponsorshipInfo =
      candidateResult.data.candidate_sponsorship_info
    if (isNil(candidateSponsorshipInfo)) {
      return err('Sponsorship information not found on candidate')
    }

    if (isNil(candidateSponsorshipInfo.candidate_email)) {
      return err('Candidate email not found on candidate')
    }

    const candidateFormsEmailResult = await sendEmail('candidate-forms', {
      from: await getSystemEmailFrom(),
      to: [candidateSponsorshipInfo.candidate_email],
      subject: `Candidate Forms - ${candidateSponsorshipInfo.candidate_name}`,
      react: CandidateFormsEmail({ candidateId, candidateSponsorshipInfo }),
    })

    if (isErr(candidateFormsEmailResult)) {
      return err(`Failed to send email: ${candidateFormsEmailResult.error}`)
    }

    return ok({ data: candidateFormsEmailResult.data })
  } catch (error) {
    return err(
      `Error while sending candidate forms: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Sends a payment request for candidate fees tied to `candidateId`
 */
export async function sendPaymentRequestEmail(
  candidateId: string
): Promise<Result<string, { data: CreateEmailResponseSuccess | null }>> {
  try {
    logger.info(`Starting payment request email for candidate: ${candidateId}`)
    const supabase = await createClient()

    const candidateResult = await getHydratedCandidate(candidateId)
    if (isErr(candidateResult)) {
      ;`Failed to fetch candidate ${candidateId}: ${candidateResult.error}`
      return err(`Failed to fetch candidate: ${candidateResult.error}`)
    }

    const candidate = candidateResult.data

    logger.info(
      `Found candidate: ${candidate.candidate_sponsorship_info?.candidate_name} (${candidate.candidate_sponsorship_info?.candidate_email})`
    )
    logger.info(
      `Found sponsorship request with payment_owner: ${candidate.candidate_sponsorship_info?.payment_owner}`
    )

    // Determine payment owner and their contact information
    const paymentOwner = candidate.candidate_sponsorship_info?.payment_owner as
      | 'candidate'
      | 'sponsor'
    let paymentOwnerEmail: string = ''
    let paymentOwnerName: string = ''

    if (paymentOwner === 'sponsor') {
      if (isNil(candidate.candidate_sponsorship_info?.sponsor_email)) {
        logger.error(
          `Sponsor email not found for sponsorship request ${candidate.candidate_sponsorship_info?.id}`
        )
        return err('Sponsor email not found')
      }
      paymentOwnerEmail = candidate.candidate_sponsorship_info?.sponsor_email
      paymentOwnerName =
        candidate.candidate_sponsorship_info?.sponsor_name ?? 'Sponsor'
    }

    if (paymentOwner === 'candidate') {
      if (isNil(candidate.candidate_sponsorship_info?.candidate_email)) {
        logger.error(
          `Candidate email not found for ${candidate.candidate_sponsorship_info?.candidate_name}`
        )
        return err('Candidate email not found')
      }
      paymentOwnerEmail = candidate.candidate_sponsorship_info?.candidate_email
      paymentOwnerName =
        candidate.candidate_sponsorship_info?.candidate_name ?? 'Candidate'
    }

    // The status change below is the workflow step; only the email itself is
    // optional, so a switched-off toggle skips the send and nothing else.
    const paymentEmailsEnabled = await isNotificationEnabled(
      NOTIFY_PAYMENT_RECEIPTS_KEY
    )

    let data: CreateEmailResponseSuccess | null = null

    if (!paymentEmailsEnabled) {
      logger.info(
        `Skipped payment request email for candidate ${candidateId}: payment receipts & reminders are switched off in site settings`
      )
    } else {
      logger.info(
        `Sending payment request email to ${paymentOwnerName} (${paymentOwnerEmail})`
      )

      // Send email using Resend
      const sendResult = await sendEmail('payment-request', {
        from: await getSystemEmailFrom(),
        to: [paymentOwnerEmail],
        subject: `Candidate Fees for ${candidate.candidate_sponsorship_info?.candidate_name ?? 'Candidate'} - Dusty Trails Tres Dias`,
        react: CandidateFeePaymentRequestEmail({
          candidate,
          paymentOwner,
          paymentOwnerName,
        }),
      })

      if (isErr(sendResult)) {
        logger.error(
          `Failed to send payment request email for ${candidate.candidate_sponsorship_info?.candidate_name}: ${sendResult.error}`
        )
        return err(`Failed to send email: ${sendResult.error}`)
      }

      data = sendResult.data

      logger.info(
        `Payment request email sent successfully for ${candidate.candidate_sponsorship_info?.candidate_name}`
      )
    }

    // Update candidate status to awaiting_payment
    const { error: updateError } = await supabase
      .from('candidates')
      .update({ status: 'awaiting_payment' })
      .eq('id', candidateId)

    if (!isNil(updateError)) {
      logger.error(
        `Failed to update candidate status to awaiting_payment for ${candidate.candidate_sponsorship_info?.candidate_name}: ${updateError.message}`
      )
      // Don't return error here as the email was sent successfully
    } else {
      logger.info(
        `Updated candidate ${candidate.candidate_sponsorship_info?.candidate_name} status to awaiting_payment`
      )
    }

    return ok({ data })
  } catch (error) {
    logger.error(
      `Error while sending payment request email: ${error instanceof Error ? error.message : String(error)}`
    )
    return err(
      `Error while sending payment request email: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Sends an email to the assistant head CHA informing them that team fees have been paid.
 */
export async function notifyAssistantHeadForTeamPayment(
  teamUserId: string | null,
  weekendId: string | null,
  paymentAmount: number
): Promise<Result<string, true>> {
  if (isNil(teamUserId) || isNil(weekendId)) {
    return err('Team user ID or weekend ID is null')
  }

  try {
    if (!(await isNotificationEnabled(NOTIFY_PAYMENT_RECEIPTS_KEY))) {
      logger.info(
        `Skipped team payment notification for weekend ${weekendId}: payment receipts & reminders are switched off in site settings`
      )
      return ok(true)
    }

    const supabase = await createClient()

    // Get all weekend roster data and weekend details in parallel
    const [teamMemberResult, weekendResult, assistantHeadResult] =
      await Promise.all([
        // Get team member details
        supabase
          .from('weekend_roster')
          .select(
            `
          *,
          users!inner(email, first_name, last_name)
        `
          )
          .eq('user_id', teamUserId)
          .eq('weekend_id', weekendId)
          .single(),

        // Get weekend details
        supabase
          .from('weekends')
          .select('*, weekend_groups(number)')
          .eq('id', weekendId)
          .single(),

        // Find Assistant Head for this weekend
        supabase
          .from('weekend_roster')
          .select(
            `
          *,
          users!inner(email, first_name, last_name)
        `
          )
          .eq('weekend_id', weekendId)
          .eq('cha_role', 'Assistant Head')
          .limit(1)
          .single(),
      ])

    const { data: teamMember, error: teamMemberError } = teamMemberResult
    const { data: weekend, error: weekendError } = weekendResult
    const { data: assistantHead, error: assistantHeadError } =
      assistantHeadResult

    if (!isNil(teamMemberError) || isNil(teamMember)) {
      return err(
        `Failed to fetch team member details: ${teamMemberError?.message ?? 'Team member not found'}`
      )
    }

    if (!isNil(weekendError) || isNil(weekend)) {
      return err(
        `Failed to fetch weekend details: ${weekendError?.message ?? 'Weekend not found'}`
      )
    }

    if (!isNil(assistantHeadError) || isNil(assistantHead)) {
      return err(
        `Failed to fetch assistant head for weekend ${weekendId}: ${assistantHeadError?.message ?? 'Assistant Head not found'}`
      )
    }

    if (isNil(assistantHead.users.email)) {
      return err(`Assistant head email not found for weekend ${weekendId}`)
    }

    // Send email to assistant head
    const sendResult = await sendEmail('team-payment-notification', {
      from: await getSystemEmailFrom(),
      to: [assistantHead.users.email],
      subject: `Team Fee Received - ${teamMember.users.first_name} ${teamMember.users.last_name}`,
      react: TeamPaymentNotificationEmail({
        teamMemberName: `${teamMember.users.first_name} ${teamMember.users.last_name}`,
        teamMemberEmail: teamMember.users.email,
        weekendName: formatWeekendLabelFor({
          number: weekend.weekend_groups?.number,
          gender: weekend.type,
        }),
        paymentAmount,
      }),
    })

    if (isErr(sendResult)) {
      logger.error(
        `Failed to send team payment notification email to assistant head for ${teamMember.users.first_name} ${teamMember.users.last_name}: ${sendResult.error}`
      )
      return err(`Failed to send email: ${sendResult.error}`)
    }

    logger.info(
      `Team payment notification email sent successfully to assistant head for ${teamMember.users.first_name} ${teamMember.users.last_name}`
    )
    return ok(true)
  } catch (error) {
    return err(
      `Error while sending team payment notification email: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Notify pre-weekend couple when a candidate completes their forms
 */
export async function sendCandidateFormsCompletedEmail(
  candidateId: string
): Promise<Result<string, { data: CreateEmailResponseSuccess | null }>> {
  try {
    // Fetch candidate data
    const candidateResult = await getHydratedCandidate(candidateId)

    if (isErr(candidateResult)) {
      return err(`Failed to fetch candidate: ${candidateResult.error}`)
    }

    const candidate = candidateResult.data

    if (isNil(candidate)) {
      return err('Candidate not found')
    }

    // Get pre-weekend couple email
    const preWeekendEmailResult =
      await NotificationService.getPreWeekendCoupleEmail()
    if (isErr(preWeekendEmailResult)) {
      return err(preWeekendEmailResult.error)
    }

    const candidateName =
      !isNil(candidate.candidate_info?.first_name) &&
      !isNil(candidate.candidate_info?.last_name)
        ? `${candidate.candidate_info.first_name} ${candidate.candidate_info.last_name}`
        : (candidate.candidate_sponsorship_info?.candidate_name ?? 'Candidate')

    // Send email using Resend
    const sendResult = await sendEmail('candidate-forms-completed', {
      from: await getSystemEmailFrom(),
      to: [preWeekendEmailResult.data],
      subject: `Candidate Forms Completed - ${candidateName}`,
      react: CandidateFormsCompletedEmail({
        ...candidate,
        reviewUrl: await getCandidateReviewUrl(candidate),
      }),
    })

    if (isErr(sendResult)) {
      logger.error(
        `Failed to send candidate forms completed email for ${candidateName}: ${sendResult.error}`
      )
      return err(`Failed to send email: ${sendResult.error}`)
    }

    logger.info(
      `Candidate forms completed email sent successfully for ${candidateName}`
    )
    return ok({ data: sendResult.data })
  } catch (error) {
    return err(
      `Error while sending candidate forms completed email: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
