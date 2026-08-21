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
} from '@/services/candidates/actions'
import {
  computeActiveWeekendFinancials,
  type ActiveWeekendFinancials,
} from '@/lib/payments/compute-totals'
import type Stripe from 'stripe'
import { isNil } from 'lodash'
import type { Weekend } from '@/lib/weekend/types'
import type {
  PriceInfo,
  ServiceOptions,
  TargetIdentity,
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
 * Key for the target identity map. target_id alone is not unique across the
 * different tables target_type can point at.
 */
function targetKey(
  targetType: string | null,
  targetId: string | null
): string | null {
  if (isNil(targetType) || isNil(targetId)) return null
  return `${targetType}:${targetId}`
}

/**
 * Resolves the person each payment was made *for* (its target).
 *
 * target_id is a polymorphic UUID with no FK constraint, so it cannot be
 * joined in the payment query. Instead we bucket the IDs by target_type and
 * issue one lookup per bucket, then index the results by `type:id`.
 *
 * Note this is distinct from payment_owner, which records who *paid* — for a
 * candidate whose sponsor covers the fee, those are two different people.
 */
async function buildTargetIdentityMap(
  rows: PaymentTransactionWithWeekend[],
  options?: ServiceOptions
): Promise<Map<string, TargetIdentity>> {
  const idsByType = new Map<string, Set<string>>()
  for (const row of rows) {
    if (isNil(row.target_type) || isNil(row.target_id)) continue
    const ids = idsByType.get(row.target_type) ?? new Set<string>()
    ids.add(row.target_id)
    idsByType.set(row.target_type, ids)
  }

  const idsFor = (targetType: string) => [
    ...(idsByType.get(targetType) ?? new Set<string>()),
  ]

  const [candidates, groupMembers, rosterMembers] = await Promise.all([
    PaymentRepository.getCandidateIdentities(idsFor('candidate'), options),
    PaymentRepository.getGroupMemberIdentities(
      idsFor('weekend_group_member'),
      options
    ),
    PaymentRepository.getRosterIdentities(idsFor('weekend_roster'), options),
  ])

  const identities = new Map<string, TargetIdentity>()
  const collect = (
    targetType: string,
    result: Result<string, TargetIdentity[]>
  ) => {
    for (const identity of unwrapOr(result, [])) {
      const key = targetKey(targetType, identity.id)
      if (!isNil(key)) identities.set(key, identity)
    }
  }

  collect('candidate', candidates)
  collect('weekend_group_member', groupMembers)
  collect('weekend_roster', rosterMembers)

  return identities
}

/**
 * Normalizes a payment transaction row into a PaymentTransactionDTO.
 *
 * Two different people are tracked on a payment:
 * - `payment_owner` is who paid (set during payment creation from Stripe
 *   checkout metadata or the manual-entry form). For a candidate whose
 *   sponsor covers the fee, this is the sponsor.
 * - `target_name` is who the payment was for, resolved from target_type +
 *   target_id via `buildTargetIdentityMap`. Null when the payment has no
 *   target (donations) or the target record no longer exists.
 */
function normalizePaymentTransaction(
  raw: PaymentTransactionWithWeekend,
  targetIdentities: Map<string, TargetIdentity>
): PaymentTransactionDTO {
  const key = targetKey(raw.target_type, raw.target_id)
  const identity = isNil(key) ? undefined : targetIdentities.get(key)

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
    target_name: identity?.name ?? null,
    target_email: identity?.email ?? null,
    weekend_number: raw.weekends?.weekend_groups?.number ?? null,
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
 * Reassigns all of a target's payment transactions to a different weekend.
 * Used when a candidate is moved between weekends so their payments follow them.
 *
 * @param targetType - The type of target ('candidate' or 'weekend_roster')
 * @param targetId - The ID of the target entity
 * @param weekendId - The weekend to reassign the payments to
 * @param options - Service options including RLS bypass flag
 * @returns Result containing the updated payment transactions
 */
export async function movePaymentsToWeekend(
  targetType: NonNullable<TargetType>,
  targetId: string,
  weekendId: string,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow[]>> {
  return PaymentRepository.updatePaymentsWeekendByTarget(
    targetType,
    targetId,
    weekendId,
    options
  )
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

  const targetIdentities = await buildTargetIdentityMap(result.data, options)
  const normalizedPayments = result.data.map((raw) =>
    normalizePaymentTransaction(raw, targetIdentities)
  )

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

  return ok(
    computeActiveWeekendFinancials(
      payments,
      { MENS: mensWeekend.id, WOMENS: womensWeekend.id },
      rosterCounts,
      candidateCounts,
      teamFee,
      candidateFee,
      activeTeamTargetIds,
      activeCandidateTargetIds
    )
  )
}
