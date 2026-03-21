import 'server-only'

import { stripe } from '@/lib/stripe'
import type { Result } from '@/lib/results'
import { err, isErr, isOk, ok, unwrapOr } from '@/lib/results'
import * as PaymentRepository from './repository'
import * as WeekendRepository from '@/services/weekend/repository'
import * as GroupMemberRepository from '@/services/weekend-group-member/repository'
import {
  getCandidateCountByWeekend,
  getCandidateIdsByWeekend,
  getCandidateNamesByWeekend,
} from '@/services/candidates/actions'
import {
  computeActiveWeekendFinancials,
  type ActiveWeekendFinancials,
  type PersonInfo,
} from '@/lib/payments/compute-totals'
import type Stripe from 'stripe'
import { isNil } from 'lodash'
import type { Weekend } from '@/lib/weekend/types'
import type {
  PriceInfo,
  ServiceOptions,
  CreatePaymentInput,
  BackfillStripeDataInput,
  PaymentTransactionDTO,
  PaymentTransactionRow,
  PaymentTransactionWithWeekend,
  TargetType,
  PaymentType,
  PaymentMethod,
} from './types'
import { CreatePaymentSchema, BackfillStripeDataSchema } from './types'

// ============================================================================
// Stripe Price Functions
// ============================================================================

/**
 * Converts a Stripe Price object to a plain PriceInfo object.
 * This is necessary because Stripe objects have methods and cannot
 * be serialized when passed from server to client components.
 */
function toPriceInfo(price: Stripe.Price): PriceInfo {
  return {
    id: price.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
  }
}

/**
 * Retrieves a Stripe price object by its ID.
 * Used to fetch pricing information for checkout flows.
 * @param priceId - The Stripe price ID (e.g., 'price_xxx')
 * @returns The full Stripe Price object containing amount, currency, and product details
 * @throws Stripe.errors.StripeInvalidRequestError if the price ID is invalid
 */
export async function retrievePrice(priceId: string): Promise<Stripe.Price> {
  return await stripe.prices.retrieve(priceId)
}

/**
 * Retrieves a Stripe price and wraps it in a Result type.
 * @param priceId - The Stripe price ID to retrieve
 * @returns Result containing a plain PriceInfo object or an error message
 */
export async function getPrice(
  priceId: string
): Promise<Result<string, PriceInfo>> {
  try {
    const price = await retrievePrice(priceId)
    return ok(toPriceInfo(price))
  } catch {
    return err('Failed to retrieve price information')
  }
}

/**
 * Retrieves the team fee price from Stripe.
 * Uses the TEAM_FEE_PRICE_ID environment variable.
 * @returns Result containing a plain PriceInfo object or an error message
 */
export async function getTeamFee(): Promise<Result<string, PriceInfo>> {
  const priceId = process.env.TEAM_FEE_PRICE_ID
  if (isNil(priceId)) {
    return err('Team fee price ID is not configured')
  }
  return getPrice(priceId)
}

/**
 * Retrieves the candidate fee price from Stripe.
 * Uses the CANDIDATE_FEE_PRICE_ID environment variable.
 * @returns Result containing a plain PriceInfo object or an error message
 */
export async function getCandidateFee(): Promise<Result<string, PriceInfo>> {
  const priceId = process.env.CANDIDATE_FEE_PRICE_ID
  if (isNil(priceId)) {
    return err('Candidate fee price ID is not configured')
  }
  return getPrice(priceId)
}

// ============================================================================
// Payment Transaction Normalization
// ============================================================================

/**
 * Normalizes a payment transaction row into a PaymentTransactionDTO.
 *
 * Payer info logic:
 * - payment_owner stores the payer's name directly (e.g., "John Smith")
 * - This name is set during payment creation from Stripe checkout metadata
 * - For team payments, this is the team member's name
 * - For candidate payments, this is typically the sponsor's name or the candidate's name
 *
 * Note: We cannot use FK joins to look up payer info because target_id is a polymorphic
 * UUID without FK constraints. The payment_owner field serves as the source of truth.
 */
function normalizePaymentTransaction(
  raw: PaymentTransactionWithWeekend
): PaymentTransactionDTO {
  // payment_owner contains the actual payer name (set during payment creation)
  const payerName = raw.payment_owner

  return {
    id: raw.id,
    type: raw.type as PaymentType,
    target_type: raw.target_type as TargetType,
    target_id: raw.target_id,
    weekend_id: raw.weekend_id,
    payment_intent_id: raw.payment_intent_id,
    gross_amount: raw.gross_amount,
    net_amount: raw.net_amount,
    stripe_fee: raw.stripe_fee,
    payment_method: raw.payment_method as PaymentMethod,
    payment_owner: raw.payment_owner,
    notes: raw.notes,
    charge_id: raw.charge_id,
    balance_transaction_id: raw.balance_transaction_id,
    created_at: raw.created_at ?? new Date().toISOString(),
    payer_name: payerName,
    payer_email: null, // Email not stored in payment_transaction; would require separate lookup
    weekend_title: raw.weekends?.title ?? null,
    weekend_type: (raw.weekends?.type as 'MENS' | 'WOMENS') ?? null,
  }
}

// ============================================================================
// Payment Transaction Service Functions
// ============================================================================

/**
 * Records a new payment transaction with validation.
 * This is the primary function for creating payments from webhooks and manual entry.
 *
 * @param data - The payment data to validate and insert
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the created payment transaction or a validation/database error
 */
export async function recordPayment(
  data: CreatePaymentInput,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow>> {
  // Validate input using Zod schema
  const parseResult = CreatePaymentSchema.safeParse(data)
  if (!parseResult.success) {
    return err(parseResult.error.message)
  }

  const validatedData = parseResult.data

  // Create the payment transaction
  return PaymentRepository.createPayment(
    {
      type: validatedData.type,
      target_type: validatedData.target_type,
      target_id: validatedData.target_id,
      weekend_id: validatedData.weekend_id,
      payment_intent_id: validatedData.payment_intent_id ?? null,
      gross_amount: validatedData.gross_amount,
      net_amount: validatedData.net_amount ?? null,
      stripe_fee: validatedData.stripe_fee ?? null,
      payment_method: validatedData.payment_method,
      payment_owner: validatedData.payment_owner ?? null,
      notes: validatedData.notes ?? null,
      charge_id: validatedData.charge_id ?? null,
      balance_transaction_id: validatedData.balance_transaction_id ?? null,
    },
    options
  )
}

/**
 * Gets all payments for a specific target (candidate or weekend roster member).
 *
 * @param targetType - The type of target ('candidate' or 'weekend_roster')
 * @param targetId - The ID of the target entity
 * @param options - Service options including RLS bypass flag
 * @returns Result containing array of payment transactions or an error
 */
export async function getPaymentForTarget(
  targetType: NonNullable<TargetType>,
  targetId: string,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow[]>> {
  return PaymentRepository.getPaymentsByTargetId(targetType, targetId, options)
}

/**
 * Checks if any payment exists for a specific target.
 *
 * @param targetType - The type of target ('candidate' or 'weekend_roster')
 * @param targetId - The ID of the target entity
 * @param options - Service options including RLS bypass flag
 * @returns Result containing boolean indicating if payment exists
 */
export async function hasPaymentForTarget(
  targetType: NonNullable<TargetType>,
  targetId: string,
  options?: ServiceOptions
): Promise<Result<string, boolean>> {
  const result = await PaymentRepository.getPaymentsByTargetId(
    targetType,
    targetId,
    options
  )
  if (isErr(result)) {
    return result
  }
  return ok(result.data.length > 0)
}

/**
 * Gets all payment transactions with normalized DTOs for frontend display.
 *
 * @param options - Service options including RLS bypass flag
 * @returns Result containing array of normalized payment DTOs sorted by date
 */
export async function getAllPayments(
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionDTO[]>> {
  const result = await PaymentRepository.getAllPayments(options)
  if (isErr(result)) {
    return result
  }

  const normalizedPayments = result.data.map(normalizePaymentTransaction)

  // Sort by creation date (newest first) - already sorted by repository but ensure consistency
  normalizedPayments.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return ok(normalizedPayments)
}

/**
 * Backfills Stripe data onto an existing payment transaction.
 * Used by charge.updated webhook to add fee information after initial payment.
 *
 * @param paymentIntentId - The Stripe payment intent ID to find the payment
 * @param stripeData - The Stripe data to backfill (net_amount, stripe_fee, charge_id, balance_transaction_id)
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the updated payment transaction or an error
 */
export async function backfillStripeData(
  paymentIntentId: string,
  stripeData: BackfillStripeDataInput,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow>> {
  // Validate input
  const parseResult = BackfillStripeDataSchema.safeParse(stripeData)
  if (!parseResult.success) {
    return err(parseResult.error.message)
  }

  const validatedData = parseResult.data

  // Update the payment by payment intent ID
  return PaymentRepository.updatePaymentByPaymentIntentId(
    paymentIntentId,
    {
      net_amount: validatedData.net_amount ?? undefined,
      stripe_fee: validatedData.stripe_fee ?? undefined,
      charge_id: validatedData.charge_id ?? undefined,
      balance_transaction_id: validatedData.balance_transaction_id ?? undefined,
    },
    options
  )
}

// ============================================================================
// Active Weekend Financial Health
// ============================================================================

/**
 * Computes financial health metrics for the active weekend group.
 * Fetches roster counts, candidate counts, group members, and fee prices,
 * then computes expected vs received totals per weekend.
 */
export async function getActiveWeekendFinancials(
  payments: PaymentTransactionDTO[],
  activeWeekends: Record<'MENS' | 'WOMENS', Weekend>
): Promise<Result<string, ActiveWeekendFinancials>> {
  const mensWeekend = activeWeekends.MENS
  const womensWeekend = activeWeekends.WOMENS
  const groupId = mensWeekend.groupId

  const [
    mensRoster,
    womensRoster,
    mensCandidateCount,
    womensCandidateCount,
    mensCandidateIds,
    womensCandidateIds,
    mensCandidateNames,
    womensCandidateNames,
    groupMembersResult,
    teamFeeResult,
    candidateFeeResult,
  ] = await Promise.all([
    WeekendRepository.findWeekendRoster(mensWeekend.id),
    WeekendRepository.findWeekendRoster(womensWeekend.id),
    getCandidateCountByWeekend(mensWeekend.id),
    getCandidateCountByWeekend(womensWeekend.id),
    getCandidateIdsByWeekend(mensWeekend.id),
    getCandidateIdsByWeekend(womensWeekend.id),
    getCandidateNamesByWeekend(mensWeekend.id),
    getCandidateNamesByWeekend(womensWeekend.id),
    !isNil(groupId)
      ? GroupMemberRepository.findGroupMembersByGroupId(groupId)
      : Promise.resolve(null),
    getTeamFee(),
    getCandidateFee(),
  ])

  // findWeekendRoster excludes dropped members by default
  const activeMensRoster = unwrapOr(mensRoster, [])
  const activeWomensRoster = unwrapOr(womensRoster, [])

  const rosterCounts: Record<string, number> = {
    [mensWeekend.id]: activeMensRoster.length,
    [womensWeekend.id]: activeWomensRoster.length,
  }

  const candidateCounts: Record<string, number> = {
    [mensWeekend.id]: unwrapOr(mensCandidateCount, 0),
    [womensWeekend.id]: unwrapOr(womensCandidateCount, 0),
  }

  // Build set of active team target IDs (group member IDs for active roster users)
  // so paid counts only reflect active (non-dropped) members
  const activeUserIds = new Set([
    ...activeMensRoster.map((m) => m.user_id).filter(Boolean),
    ...activeWomensRoster.map((m) => m.user_id).filter(Boolean),
  ])
  const activeTeamTargetIds = new Set<string>()
  if (groupMembersResult !== null && isOk(groupMembersResult)) {
    for (const gm of groupMembersResult.data) {
      if (activeUserIds.has(gm.user_id)) {
        activeTeamTargetIds.add(gm.id)
      }
    }
  }

  // Build set of active candidate IDs so paid counts only reflect active candidates
  const activeCandidateTargetIds = new Set<string>([
    ...unwrapOr(mensCandidateIds, []),
    ...unwrapOr(womensCandidateIds, []),
  ])

  const teamFee =
    isOk(teamFeeResult) && !isNil(teamFeeResult.data.unitAmount)
      ? teamFeeResult.data.unitAmount / 100
      : 0
  const candidateFee =
    isOk(candidateFeeResult) && !isNil(candidateFeeResult.data.unitAmount)
      ? candidateFeeResult.data.unitAmount / 100
      : 0

  // Build team person info: map group member IDs to user names/roles from roster
  const groupMembers =
    groupMembersResult !== null && isOk(groupMembersResult)
      ? groupMembersResult.data
      : []
  // Map user_id -> group_member_id for looking up target IDs
  const userIdToGroupMemberId = new Map<string, string>()
  for (const gm of groupMembers) {
    userIdToGroupMemberId.set(gm.user_id, gm.id)
  }

  function buildTeamPersonInfo(roster: typeof activeMensRoster): PersonInfo[] {
    return roster
      .filter(
        (m) =>
          !isNil(m.user_id) &&
          m.user_id !== '' &&
          userIdToGroupMemberId.has(m.user_id)
      )
      .map((m) => {
        const fullName = [m.users?.first_name, m.users?.last_name]
          .filter((s) => !isNil(s) && s !== '')
          .join(' ')
        return {
          targetId: userIdToGroupMemberId.get(m.user_id!)!,
          name: fullName !== '' ? fullName : 'Unknown',
          role: m.cha_role ?? null,
        }
      })
  }

  const teamPersonInfo: Record<string, PersonInfo[]> = {
    [mensWeekend.id]: buildTeamPersonInfo(activeMensRoster),
    [womensWeekend.id]: buildTeamPersonInfo(activeWomensRoster),
  }

  // Build candidate person info from candidate names
  function buildCandidatePersonInfo(
    namesResult: typeof mensCandidateNames
  ): PersonInfo[] {
    if (isErr(namesResult)) return []
    return namesResult.data.map((c) => {
      const fullName = [c.first_name, c.last_name]
        .filter((s) => !isNil(s) && s !== '')
        .join(' ')
      return {
        targetId: c.id,
        name: fullName !== '' ? fullName : 'Unknown',
        role: null,
      }
    })
  }

  const candidatePersonInfo: Record<string, PersonInfo[]> = {
    [mensWeekend.id]: buildCandidatePersonInfo(mensCandidateNames),
    [womensWeekend.id]: buildCandidatePersonInfo(womensCandidateNames),
  }

  return ok(
    computeActiveWeekendFinancials(
      payments,
      { MENS: mensWeekend.id, WOMENS: womensWeekend.id },
      rosterCounts,
      candidateCounts,
      teamFee,
      candidateFee,
      activeTeamTargetIds,
      activeCandidateTargetIds,
      teamPersonInfo,
      candidatePersonInfo
    )
  )
}
