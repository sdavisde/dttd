import 'server-only'

import { Resend } from 'resend'
import { err, isErr, ok, Result } from '@/lib/results'
import { logger } from '@/lib/logger'
import * as NotificationRepository from './repository'
import * as CandidateRepository from '@/services/candidates/repository'
import { ContactInfo, NotificationRecipient } from './types'
import CandidatePaymentCompletedEmail from '@/components/email/CandidatePaymentCompletedEmail'
import { Tables } from '@/lib/supabase/database.types'

const resend = new Resend(process.env.RESEND_API_KEY)

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

  if (!data.email_address) {
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

  if (!data.email_address) {
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
  const candidateInfo = rawCandidate.candidate_info?.at(0)
  const sponsorshipInfo = rawCandidate.candidate_sponsorship_info?.at(0)

  const candidateName =
    candidateInfo?.first_name && candidateInfo?.last_name
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
  }

  const { error } = await resend.emails.send({
    from: 'Dusty Trails Tres Dias <noreply@dustytrailstresdias.org>',
    to: [recipientEmail],
    subject: `Candidate Payment Received - ${candidateName}`,
    react: CandidatePaymentCompletedEmail({
      candidate,
      paymentAmount,
      paymentMethod,
      paymentOwner,
    }),
  })

  if (error) {
    logger.error(
      error,
      `Failed to send candidate payment notification email for ${candidateName}`
    )
    return err(`Failed to send email: ${error.message}`)
  }

  logger.info(
    `Candidate payment notification email sent successfully for ${candidateName}`
  )
  return ok(true)
}

/**
 * Updates contact information email address.
 */
export async function updateContactInformation(
  contactId: string,
  emailAddress: string
): Promise<Result<string, Tables<'contact_information'>>> {
  return await NotificationRepository.updateContactInformation(
    contactId,
    emailAddress
  )
}
