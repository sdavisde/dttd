import 'server-only'

import { isNil, sumBy } from 'lodash'
import { err, isErr, ok, Result, unwrapOr } from '@/lib/results'
import { notifyCandidatePaymentReceived } from '@/services/notifications/notification-service'
import * as CandidateRepository from './repository'
import {
  Candidate,
  CandidateStatus,
  RawCandidate,
  EmergencyContact,
} from './types'
import { addressSchema } from '@/lib/users/validation'
import { Tables } from '@/database.types'
import { logger } from '@/lib/logger'

function normalizeCandidate(
  rawCandidate: RawCandidate
): Result<string, Candidate> {
  if (isNil(rawCandidate)) {
    return err('Candidate not found')
  }

  const candidateInfo = rawCandidate.candidate_info?.at(0)
  const sponsorshipInfo = rawCandidate.candidate_sponsorship_info?.at(0)
  const payments = rawCandidate.candidate_payments ?? []

  // Calculate total amount paid
  const amountPaid = sumBy(payments, (it) => it.payment_amount ?? 0)

  // Build address from candidate_info if available
  const addressData = {
    addressLine1: candidateInfo?.address_line_1,
    addressLine2: candidateInfo?.address_line_2 ?? undefined,
    city: candidateInfo?.city,
    state: candidateInfo?.state,
    zip: candidateInfo?.zip,
  }
  const address = unwrapOr(addressSchema.safeParse(addressData), null) ?? null

  // Build emergency contact from candidate_info if available
  let emergencyContact: EmergencyContact | null = null
  if (
    !isNil(candidateInfo?.emergency_contact_name) &&
    !isNil(candidateInfo?.emergency_contact_phone)
  ) {
    emergencyContact = {
      name: candidateInfo.emergency_contact_name,
      phone: candidateInfo.emergency_contact_phone,
    }
  }

  if (
    isNil(sponsorshipInfo) ||
    isNil(sponsorshipInfo.sponsor_name) ||
    isNil(sponsorshipInfo.sponsor_email) ||
    isNil(sponsorshipInfo.sponsor_phone) ||
    isNil(sponsorshipInfo.sponsor_church) ||
    isNil(sponsorshipInfo.sponsor_weekend) ||
    isNil(sponsorshipInfo.payment_owner)
  ) {
    return err('Sponsorship info not found')
  }

  const sponsorInfo = {
    name: sponsorshipInfo.sponsor_name,
    email: sponsorshipInfo.sponsor_email,
    phone: sponsorshipInfo.sponsor_phone,
    church: sponsorshipInfo.sponsor_church,
    weekend: sponsorshipInfo.sponsor_weekend,
  }

  const [sponsorFormFirstName, sponsorFormLastName] =
    sponsorshipInfo.candidate_name?.split(' ') ?? []
  const firstName = candidateInfo?.first_name ?? sponsorFormFirstName ?? null
  const lastName = candidateInfo?.last_name ?? sponsorFormLastName ?? null
  const candidateEmail =
    candidateInfo?.email ?? sponsorshipInfo?.candidate_email ?? null

  if (
    isNil(candidateInfo) ||
    isNil(firstName) ||
    isNil(lastName) ||
    isNil(candidateEmail)
  ) {
    return err('Candidate info not found')
  }

  if (isNil(rawCandidate.weekend_id)) {
    return err('Weekend ID not found')
  }

  return ok({
    id: rawCandidate.id,
    firstName,
    lastName,
    email: candidateEmail,
    phone: candidateInfo?.phone ?? null,
    age: candidateInfo?.age ?? null,
    status: rawCandidate.status as CandidateStatus,
    weekendId: rawCandidate.weekend_id,
    address,
    emergencyContact,
    amountPaid,
    paymentOwner: sponsorshipInfo.payment_owner,
    sponsorInfo,
  })
}

/**
 * Gets a single candidate by ID with all related information normalized.
 */
export async function getCandidateById(
  candidateId: string
): Promise<Result<string, Candidate>> {
  const result = await CandidateRepository.getCandidateById(candidateId)
  if (isErr(result)) {
    return result
  }
  return normalizeCandidate(result.data)
}

/**
 * Gets all candidates with normalized information.
 */
export async function getAllCandidates(): Promise<
  Result<string, Array<Candidate>>
> {
  const result = await CandidateRepository.getAllCandidates()
  if (isErr(result)) {
    return result
  }

  const candidates = result.data
    .map((raw) => unwrapOr(normalizeCandidate(raw), null))
    .filter((c) => !isNil(c))

  return ok(candidates)
}

/**
 * Records a manual (cash/check) payment for a candidate.
 */
export async function recordManualCandidatePayment(
  candidateId: string,
  paymentAmount: number,
  paymentMethod: 'cash' | 'check',
  paymentOwner: string,
  notes?: string
): Promise<Result<string, Tables<'candidate_payments'>>> {
  // Verify the candidate record exists
  const candidateResult =
    await CandidateRepository.findCandidateById(candidateId)

  if (isErr(candidateResult)) {
    return err(`Failed to find candidate: ${candidateResult.error}`)
  }

  if (isNil(candidateResult.data)) {
    return err('Candidate not found')
  }

  // Insert the payment record
  const result = await CandidateRepository.insertManualCandidatePayment({
    candidate_id: candidateId,
    payment_amount: paymentAmount,
    payment_method: paymentMethod,
    payment_intent_id: `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    payment_owner: paymentOwner,
    notes: notes ?? null,
  })

  if (isErr(result)) {
    return err(`Failed to record payment: ${result.error}`)
  }

  logger.info(
    `Manual candidate payment recorded: ${paymentMethod} payment of $${paymentAmount} for candidate ID ${candidateId}`
  )

  // Notify pre-weekend couple of payment (don't fail if email fails)
  const emailResult = await notifyCandidatePaymentReceived(
    candidateId,
    paymentAmount,
    paymentMethod
  )
  if (isErr(emailResult)) {
    logger.error(
      `Failed to send payment notification email for candidate ${candidateId}: ${emailResult.error}`
    )
  }

  return ok(result.data)
}

/**
 * Gets the count of non-rejected candidates for a specific weekend.
 */
export async function getCandidateCountByWeekend(
  weekendId: string
): Promise<Result<string, number>> {
  return CandidateRepository.getCandidateCountByWeekend(weekendId)
}
