import 'server-only'

import { isNil } from 'lodash'
import { endOfMonth, startOfMonth } from 'date-fns'
import type { Result } from '@/lib/results'
import { err, isErr, ok } from '@/lib/results'
import { logger } from '@/lib/logger'
import {
  getSystemEmailFrom,
  isNotificationEnabled,
} from '@/services/settings/settings-service'
import { NOTIFY_PAYMENT_RECEIPTS_KEY } from '@/services/settings/site-settings'
import { sendEmail } from './email-client'
import * as NotificationRepository from './repository'
// TODO: This should use the candidates service public API instead of direct repository access
import * as CandidateRepository from '@/services/candidates/repository'
import type { ContactInfo, NotificationRecipient } from './types'
import type { HydratedCandidate } from '@/lib/candidates/types'
import CandidatePaymentCompletedEmail from '@/components/email/CandidatePaymentCompletedEmail'
import { getCandidateReviewUrl } from './review-links'

/**
 * Gets contact information by ID and transforms to DTO.
 */
export async function getContactInformation(
  contactId: string
): Promise<Result<string, ContactInfo>> {
  const result = await NotificationRepository.getContactInformation(contactId)

  if (isErr(result)) {
    return result
  }

  const data = result.data

  return ok({
    id: data.id,
    label: data.label ?? contactId,
    emailAddress: data.email_address ?? '',
  })
}

/**
 * Gets contact information for a notification recipient.
 */
export async function getRecipientContactInfo(
  recipient: NotificationRecipient
): Promise<Result<string, ContactInfo>> {
  const result = await NotificationRepository.getContactInformation(recipient)

  if (isErr(result)) {
    return result
  }

  const data = result.data

  if (isNil(data.email_address)) {
    return err(`Email address not found for recipient: ${recipient}`)
  }

  return ok({
    id: data.id,
    label: data.label ?? recipient,
    emailAddress: data.email_address,
  })
}

/**
 * Gets the pre-weekend couple's email address.
 */
export async function getPreWeekendCoupleEmail(): Promise<
  Result<string, string>
> {
  const result = await getRecipientContactInfo('preweekend-couple')

  if (isErr(result)) {
    return result
  }

  return ok(result.data.emailAddress)
}

/**
 * Gets the pre-weekend couple's email address using admin client.
 * For use in webhook contexts where there is no user session.
 */
export async function getPreWeekendCoupleEmailAdmin(): Promise<
  Result<string, string>
> {
  const result =
    await NotificationRepository.getContactInformationAdmin('preweekend-couple')

  if (isErr(result)) {
    return result
  }

  const data = result.data

  if (isNil(data.email_address)) {
    return err('Email address not found for preweekend-couple')
  }

  return ok(data.email_address)
}

/**
 * Notifies the pre-weekend couple when a candidate payment is received.
 * Uses the regular client (requires user session).
 */
export async function notifyCandidatePaymentReceived(
  candidateId: string,
  paymentAmount: number,
  paymentMethod: 'card' | 'cash' | 'check'
): Promise<Result<string, true>> {
  const candidateResult =
    await CandidateRepository.getCandidateById(candidateId)
  if (isErr(candidateResult)) {
    return err(`Failed to fetch candidate: ${candidateResult.error}`)
  }

  const preWeekendEmailResult = await getPreWeekendCoupleEmail()
  if (isErr(preWeekendEmailResult)) {
    return err(preWeekendEmailResult.error)
  }

  return sendCandidatePaymentEmail(
    candidateResult.data,
    preWeekendEmailResult.data,
    paymentAmount,
    paymentMethod
  )
}

/**
 * Notifies the pre-weekend couple when a candidate payment is received.
 * Uses admin client for webhook contexts where there is no user session.
 */
export async function notifyCandidatePaymentReceivedAdmin(
  candidateId: string,
  paymentAmount: number,
  paymentMethod: 'card' | 'cash' | 'check'
): Promise<Result<string, true>> {
  const candidateResult =
    await CandidateRepository.getCandidateByIdAdmin(candidateId)
  if (isErr(candidateResult)) {
    return err(`Failed to fetch candidate: ${candidateResult.error}`)
  }

  const preWeekendEmailResult = await getPreWeekendCoupleEmailAdmin()
  if (isErr(preWeekendEmailResult)) {
    return err(preWeekendEmailResult.error)
  }

  return sendCandidatePaymentEmail(
    candidateResult.data,
    preWeekendEmailResult.data,
    paymentAmount,
    paymentMethod
  )
}

/**
 * Internal helper to send candidate payment email.
 */
async function sendCandidatePaymentEmail(
  rawCandidate: NonNullable<
    Awaited<ReturnType<typeof CandidateRepository.getCandidateById>>['data']
  >,
  recipientEmail: string,
  paymentAmount: number,
  paymentMethod: 'card' | 'cash' | 'check'
): Promise<Result<string, true>> {
  if (!(await isNotificationEnabled(NOTIFY_PAYMENT_RECEIPTS_KEY))) {
    logger.info(
      `Skipped candidate payment notification for candidate ${rawCandidate.id}: payment receipts & reminders are switched off in site settings`
    )
    return ok(true)
  }

  const candidateInfo = rawCandidate.candidate_info?.at(0)
  const sponsorshipInfo = rawCandidate.candidate_sponsorship_info?.at(0)

  const candidateName =
    !isNil(candidateInfo?.first_name) && !isNil(candidateInfo?.last_name)
      ? `${candidateInfo.first_name} ${candidateInfo.last_name}`
      : (sponsorshipInfo?.candidate_name ?? 'Candidate')

  const paymentOwner = (sponsorshipInfo?.payment_owner ?? 'candidate') as
    | 'candidate'
    | 'sponsor'

  // Build hydrated candidate shape for email template
  const candidate = {
    ...rawCandidate,
    candidate_info: candidateInfo,
    candidate_sponsorship_info: sponsorshipInfo,
  } as HydratedCandidate

  const sendResult = await sendEmail('candidate-payment-completed', {
    from: await getSystemEmailFrom(),
    to: [recipientEmail],
    subject: `Candidate Payment Received - ${candidateName}`,
    react: CandidatePaymentCompletedEmail({
      candidate,
      paymentAmount,
      paymentMethod,
      paymentOwner,
      reviewUrl: await getCandidateReviewUrl(candidate),
    }),
  })

  if (isErr(sendResult)) {
    logger.error(
      `Failed to send candidate payment notification email for ${candidateName}: ${sendResult.error}`
    )
    return err(`Failed to send email: ${sendResult.error}`)
  }

  logger.info(
    `Candidate payment notification email sent successfully for ${candidateName}`
  )
  return ok(true)
}

/**
 * Counts the emails successfully sent so far in the current calendar month.
 *
 * Counts send attempts (one row per `sendEmail()` call), not individual
 * recipient addresses -- that is the unit the email provider bills on. The
 * `recipient_count` column is there if we ever need the finer number.
 */
export async function getEmailsSentThisMonth(): Promise<
  Result<string, number>
> {
  const now = new Date()

  return NotificationRepository.countSentEmailsBetween(
    startOfMonth(now),
    endOfMonth(now)
  )
}

/**
 * Updates contact information email address.
 */
export async function updateContactInformation(
  contactId: string,
  emailAddress: string
): Promise<Result<string, ContactInfo>> {
  const result = await NotificationRepository.updateContactInformation(
    contactId,
    emailAddress
  )

  if (isErr(result)) {
    return result
  }

  const data = result.data

  return ok({
    id: data.id,
    label: data.label ?? contactId,
    emailAddress: data.email_address ?? '',
  })
}
