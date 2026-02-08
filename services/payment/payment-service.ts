import 'server-only'

import { stripe } from '@/lib/stripe'
import { err, isErr, ok, Result, Results } from '@/lib/results'
import { PaymentRecord } from '@/lib/payments/types'
import * as PaymentRepository from './repository'
import { RawTeamPayment } from './repository'
import type Stripe from 'stripe'
import { isNil } from 'lodash'
import {
  PriceInfo,
  ServiceOptions,
  CreatePaymentInput,
  CreatePaymentSchema,
  BackfillStripeDataInput,
  BackfillStripeDataSchema,
  RawPaymentTransaction,
  PaymentTransactionDTO,
  PaymentTransactionRow,
  TargetType,
  PaymentType,
  PaymentMethod,
} from './types'

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
 * Checks if payment_owner contains an actual name vs a category value.
 * Currently, payment_owner stores 'candidate', 'sponsor', or 'unknown' as categories,
 * not actual names. This helper identifies those category values.
 */
function isPaymentOwnerCategory(paymentOwner: string | null): boolean {
  if (!paymentOwner) return true
  const categories = ['candidate', 'sponsor', 'unknown']
  return categories.includes(paymentOwner.toLowerCase())
}

/**
 * Normalizes a raw payment transaction into a PaymentTransactionDTO.
 *
 * Payer info logic:
 * - payment_owner currently stores 'candidate', 'sponsor', or 'unknown' as category values
 * - When payment_owner is 'sponsor', the actual payer is the candidate's sponsor (name not stored in payment)
 * - When payment_owner is 'candidate', the payer is the candidate themselves
 * - For team payments, the team member is assumed to have paid for themselves
 * - We derive name/email from the target (candidate or roster member) as a fallback
 *
 * Note: If payment_owner contains an actual name in the future, that will take precedence.
 */
function normalizePaymentTransaction(
  raw: RawPaymentTransaction
): PaymentTransactionDTO {
  let payerName: string | null = null
  let payerEmail: string | null = null

  // First, check if payment_owner contains an actual name (not a category)
  if (raw.payment_owner && !isPaymentOwnerCategory(raw.payment_owner)) {
    payerName = raw.payment_owner
    // Note: We don't have payer email when payment_owner stores a name
  }

  // Fall back to deriving payer info from the target
  // This is an approximation - the actual payer may differ (e.g., sponsor paying for candidate)
  if (!payerName) {
    if (raw.target_type === 'candidate' && raw.candidates) {
      payerName = `${raw.candidates.first_name} ${raw.candidates.last_name}`
      payerEmail = raw.candidates.email
    } else if (raw.target_type === 'weekend_roster' && raw.weekend_roster) {
      payerName = `${raw.weekend_roster.users.first_name} ${raw.weekend_roster.users.last_name}`
      payerEmail = raw.weekend_roster.users.email
    }
  }

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
    payer_email: payerEmail,
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
// Legacy Service Functions (for backward compatibility during migration)
// ============================================================================

/**
 * Normalizes a raw team payment record into a PaymentRecord DTO.
 * @deprecated Will be removed after migration to payment_transaction table
 */
function normalizeTeamPayment(raw: RawTeamPayment): PaymentRecord {
  return {
    id: raw.id,
    type: 'team_fee',
    payment_amount: raw.payment_amount ?? 0,
    payment_method: raw.payment_method ?? 'stripe',
    payment_intent_id: raw.payment_intent_id,
    created_at: raw.created_at,
    notes: raw.notes ?? undefined,
    payer_name: `${raw.weekend_roster.users.first_name} ${raw.weekend_roster.users.last_name}`,
    payer_email: raw.weekend_roster.users.email,
    stripe_fee: raw.stripe_fee,
    net_amount: raw.net_amount,
    deposited_at: raw.deposited_at,
    payout_id: raw.payout_id,
  }
}

/**
 * Checks if a team member has made any payment for the given weekend roster.
 * @param weekendRosterId - The weekend roster ID to check
 * @returns True if a payment exists, false otherwise
 * @deprecated Use hasPaymentForTarget('weekend_roster', weekendRosterId) instead
 */
export async function hasTeamPayment(
  weekendRosterId: string
): Promise<Result<string, boolean>> {
  const result =
    await PaymentRepository.getTeamPaymentByRosterId(weekendRosterId)
  if (isErr(result)) {
    return result
  }
  return ok(!isNil(result.data) && result.data.length > 0)
}

/**
 * Retrieves all payment records (team fees and candidate fees) from legacy tables.
 * @returns Array of payment records sorted by creation date (newest first)
 * @deprecated Use getAllPayments() from the new payment_transaction table instead
 */
export async function getAllPaymentsDeprecated(): Promise<
  Result<string, PaymentRecord[]>
> {
  const teamPaymentsResult = await PaymentRepository.getAllTeamPayments()
  if (isErr(teamPaymentsResult)) {
    return teamPaymentsResult
  }

  // TODO: Implement candidate payments display in admin payments page
  // The candidate_payments table exists but candidate payment flow may need:
  // 1. Review of candidate payment method field (currently missing payment_method column)
  // 2. Verify candidate relationship join works correctly
  // 3. Test payment_owner field population vs candidate name fallback
  // 4. Ensure candidate payment records are being created in the payment flow

  const combinedPayments: PaymentRecord[] =
    teamPaymentsResult.data.map(normalizeTeamPayment)

  // Sort by creation date (newest first)
  combinedPayments.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return ok(combinedPayments)
}
