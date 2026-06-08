'use server'

import { createClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/results'
import { err, ok, isErr } from '@/lib/results'
import { isNil } from 'lodash'
import type { SponsorFormSchema } from '@/app/(public)/sponsor/SponsorForm'
import type {
  CandidateStatus,
  PaymentRecord,
  HydratedCandidate,
  CandidateFormData,
} from '@/lib/candidates/types'
import { authorizedAction } from '@/lib/actions/authorized-action'
import { Permission } from '@/lib/security'
import { sendCandidateFormsCompletedEmail } from '@/services/notifications'
import { logger } from '@/lib/logger'
import type { WeekendType } from '@/lib/weekend/types'
import { WeekendStatus, WEEKEND_CANDIDATE_CAPACITY } from '@/lib/weekend/types'
import type { Database } from '@/database.types'
import { getCandidateCountByWeekend } from '@/services/candidates/actions'
import {
  getPaymentForTarget,
  getCandidateFee,
  movePaymentsToWeekend,
} from '@/services/payment/payment-service'
import { getPaymentSummary } from '@/lib/payments/utils'

type CandidateSponsorshipInfoUpdate =
  Database['public']['Tables']['candidate_sponsorship_info']['Update']
type CandidateInfoUpdate =
  Database['public']['Tables']['candidate_info']['Update']

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

    if (!isNil(candidateError) || isNil(candidate)) {
      return err(
        `Failed to create candidate: ${candidateError?.message ?? 'No data returned'}`
      )
    }

    // Create the sponsorship info record
    const { error: sponsorshipInfoError } = await supabase
      .from('candidate_sponsorship_info')
      .insert({
        candidate_id: candidate.id,
        ...sponsorshipInfo,
      })

    if (!isNil(sponsorshipInfoError)) {
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

    if (!isNil(sponsorshipInfoError)) {
      return err(
        `Failed to delete sponsorship info: ${sponsorshipInfoError.message}`
      )
    }

    // Delete candidate info if it exists
    const { error: candidateInfoError } = await supabase
      .from('candidate_info')
      .delete()
      .eq('candidate_id', candidateId)

    if (!isNil(candidateInfoError)) {
      return err(
        `Failed to delete candidate info: ${candidateInfoError.message}`
      )
    }

    // Finally delete the candidate
    const { error: candidateError } = await supabase
      .from('candidates')
      .delete()
      .eq('id', candidateId)

    if (!isNil(candidateError)) {
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

    if (!isNil(candidateError) || isNil(candidate)) {
      return err(
        `Failed to get candidate with details: ${candidateError?.message ?? 'No data returned'}`
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
export type CandidateFilterOptions = {
  weekendGroupId?: string
  weekendType?: WeekendType
}

/**
 * Gets all candidates with their related information.
 * Payments are fetched from the payment_transaction table.
 */
export async function getAllCandidatesWithDetails(
  options: CandidateFilterOptions = {}
): Promise<Result<string, Array<HydratedCandidate>>> {
  try {
    const supabase = await createClient()

    // Determine if we need to filter by weekend (requires inner join)
    const needsWeekendFilter =
      !isNil(options.weekendGroupId) || !isNil(options.weekendType)
    const weekendJoinType = needsWeekendFilter ? '!inner' : ''

    // Query candidates (payments are fetched separately from payment_transaction)
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

    if (!isNil(options.weekendGroupId)) {
      query = query.eq('weekends.group_id', options.weekendGroupId)
    }

    if (!isNil(options.weekendType)) {
      query = query.eq('weekends.type', options.weekendType)
    }

    const { data: candidates, error: candidatesError } = await query

    if (!isNil(candidatesError) || isNil(candidates)) {
      return err(
        `Failed to get candidates with details: ${candidatesError?.message ?? 'No data returned'}`
      )
    }

    // Fetch payments and Stripe fee in parallel
    const [paymentsByCandidate, candidateFeeResult] = await Promise.all([
      Promise.all(
        candidates.map(async (candidate) => {
          const paymentsResult = await getPaymentForTarget(
            'candidate',
            candidate.id
          )
          return {
            candidateId: candidate.id,
            payments: isErr(paymentsResult) ? [] : paymentsResult.data,
          }
        })
      ),
      getCandidateFee(),
    ])

    // Stripe fee in dollars (unitAmount is in cents)
    const baseFee =
      !isErr(candidateFeeResult) && !isNil(candidateFeeResult.data.unitAmount)
        ? candidateFeeResult.data.unitAmount / 100
        : 0

    // Create a map of candidate ID to payments
    const paymentsMap = new Map<string, PaymentRecord[]>()
    for (const { candidateId, payments } of paymentsByCandidate) {
      paymentsMap.set(candidateId, payments)
    }

    return ok(
      candidates.map((candidate) => {
        const payments = paymentsMap.get(candidate.id) ?? []
        return {
          ...candidate,
          candidate_sponsorship_info:
            candidate.candidate_sponsorship_info.at(0),
          candidate_info: candidate.candidate_info.at(0),
          payments,
          paymentSummary: getPaymentSummary(payments, baseFee),
        }
      }) as HydratedCandidate[]
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

    if (!isNil(updateError)) {
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
 * Also updates the candidate status to 'pending_approval'
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

    if (!isNil(candidateInfoError)) {
      return err(`Failed to add candidate info: ${candidateInfoError.message}`)
    }

    // Update candidate status to pending_approval after forms are completed
    const { error: statusError } = await supabase
      .from('candidates')
      .update({ status: 'pending_approval' })
      .eq('id', candidateId)

    if (!isNil(statusError)) {
      return err(`Failed to update candidate status: ${statusError.message}`)
    }

    // Send email notification to pre-weekend couple (don't fail if email fails)
    const emailResult = await sendCandidateFormsCompletedEmail(candidateId)
    if (isErr(emailResult)) {
      logger.error(
        `Failed to send forms completed email for candidate ${candidateId}: ${emailResult.error}`
      )
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

    if (!isNil(updateError)) {
      return err(`Failed to update payment owner: ${updateError.message}`)
    }

    return ok({ success: true })
  } catch (error) {
    return err(
      `Error while updating payment owner: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Update a single field in the candidate_sponsorship_info table
 * Requires WRITE_CANDIDATES permission
 */
export const updateCandidateSponsorshipField = authorizedAction<
  {
    candidateId: string
    field: keyof CandidateSponsorshipInfoUpdate
    value: string | null
  },
  { success: boolean }
>(Permission.WRITE_CANDIDATES, async ({ candidateId, field, value }) => {
  try {
    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('candidate_sponsorship_info')
      .update({ [field]: value })
      .eq('candidate_id', candidateId)

    if (!isNil(updateError)) {
      return err(`Failed to update ${field}: ${updateError.message}`)
    }

    return ok({ success: true })
  } catch (error) {
    return err(
      `Error while updating ${field}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
})

/**
 * Update a single field in the candidate_info table
 * Requires WRITE_CANDIDATES permission
 */
export const updateCandidateInfoField = authorizedAction<
  {
    candidateId: string
    field: keyof CandidateInfoUpdate
    value: string | number | boolean | null
  },
  { success: boolean }
>(Permission.WRITE_CANDIDATES, async ({ candidateId, field, value }) => {
  try {
    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('candidate_info')
      .update({ [field]: value })
      .eq('candidate_id', candidateId)

    if (!isNil(updateError)) {
      return err(`Failed to update ${field}: ${updateError.message}`)
    }

    return ok({ success: true })
  } catch (error) {
    return err(
      `Error while updating ${field}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
})

/**
 * Update the candidate status field
 * Requires WRITE_CANDIDATES permission
 */
export const updateCandidateStatusField = authorizedAction<
  { candidateId: string; status: CandidateStatus },
  { success: boolean }
>(Permission.WRITE_CANDIDATES, async ({ candidateId, status }) => {
  try {
    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('candidates')
      .update({ status })
      .eq('id', candidateId)

    if (!isNil(updateError)) {
      return err(`Failed to update status: ${updateError.message}`)
    }

    return ok({ success: true })
  } catch (error) {
    return err(
      `Error while updating status: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
})

/**
 * A weekend a candidate can be moved to, with a live capacity hint.
 */
export interface MoveWeekendOption {
  weekendId: string
  label: string
  count: number
  capacity: number
  isFull: boolean
}

/**
 * Gets the weekends a candidate can be moved to.
 * Only weekends of the same gender (type) that are not finished are eligible,
 * and the candidate's current weekend is excluded. Each option includes a live
 * candidate count so callers can show a capacity hint.
 */
export async function getMoveWeekendOptions(
  candidateId: string
): Promise<Result<string, MoveWeekendOption[]>> {
  try {
    const supabase = await createClient()

    // Load the candidate's current weekend to determine gender and exclude it
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('weekend_id')
      .eq('id', candidateId)
      .single()

    if (!isNil(candidateError) || isNil(candidate)) {
      return err(
        `Failed to load candidate: ${candidateError?.message ?? 'No data returned'}`
      )
    }

    if (isNil(candidate.weekend_id)) {
      return err('Candidate is not assigned to a weekend')
    }

    const { data: currentWeekend, error: currentWeekendError } = await supabase
      .from('weekends')
      .select('id, type')
      .eq('id', candidate.weekend_id)
      .single()

    if (!isNil(currentWeekendError) || isNil(currentWeekend)) {
      return err(
        `Failed to load current weekend: ${currentWeekendError?.message ?? 'No data returned'}`
      )
    }

    // Eligible targets: same gender, not finished, excluding the current weekend
    const { data: weekends, error: weekendsError } = await supabase
      .from('weekends')
      .select('id, type, title, start_date, weekend_groups(number)')
      .eq('type', currentWeekend.type)
      .neq('id', currentWeekend.id)
      .in('status', [WeekendStatus.PLANNING, WeekendStatus.ACTIVE])
      .order('start_date', { ascending: true })

    if (!isNil(weekendsError) || isNil(weekends)) {
      return err(
        `Failed to load weekends: ${weekendsError?.message ?? 'No data returned'}`
      )
    }

    const options = await Promise.all(
      weekends.map(async (weekend) => {
        const countResult = await getCandidateCountByWeekend(weekend.id)
        const count = isErr(countResult) ? 0 : countResult.data
        const number = weekend.weekend_groups?.number
        const groupLabel = !isNil(number)
          ? `DTTD #${number}`
          : (weekend.title ?? 'Weekend')
        const gender = weekend.type === 'MENS' ? "Men's" : "Women's"
        return {
          weekendId: weekend.id,
          label: `${groupLabel} ${gender}`,
          count,
          capacity: WEEKEND_CANDIDATE_CAPACITY,
          isFull: count >= WEEKEND_CANDIDATE_CAPACITY,
        }
      })
    )

    return ok(options)
  } catch (error) {
    return err(
      `Error while loading move weekend options: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Moves a candidate to a different weekend.
 * The candidate's forms (candidate_info) and sponsorship info travel
 * automatically via candidate_id; their payments are reassigned to the new
 * weekend so financials follow them. Requires WRITE_CANDIDATES permission.
 */
export const moveCandidateToWeekend = authorizedAction<
  { candidateId: string; targetWeekendId: string },
  { success: boolean }
>(Permission.WRITE_CANDIDATES, async ({ candidateId, targetWeekendId }) => {
  try {
    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('candidates')
      .update({ weekend_id: targetWeekendId })
      .eq('id', candidateId)

    if (!isNil(updateError)) {
      return err(`Failed to move candidate: ${updateError.message}`)
    }

    // Reassign the candidate's payments to the new weekend
    const paymentsResult = await movePaymentsToWeekend(
      'candidate',
      candidateId,
      targetWeekendId
    )

    if (isErr(paymentsResult)) {
      return err(`Failed to move candidate payments: ${paymentsResult.error}`)
    }

    return ok({ success: true })
  } catch (error) {
    return err(
      `Error while moving candidate: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
})
