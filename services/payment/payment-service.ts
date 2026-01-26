import 'server-only'

import { stripe } from '@/lib/stripe'
import { err, isErr, ok, Result } from '@/lib/results'
import { PaymentRecord } from '@/lib/payments/types'
import * as PaymentRepository from './repository'
import { RawTeamPayment } from './repository'
import type Stripe from 'stripe'
import { isNil } from 'lodash'
import { PriceInfo } from './types'

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
 * Normalizes a raw team payment record into a PaymentRecord DTO.
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
 * Checks if a team member has made any payment for the given weekend roster.
 * @param weekendRosterId - The weekend roster ID to check
 * @returns True if a payment exists, false otherwise
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
 * Retrieves all payment records (team fees and candidate fees).
 * @returns Array of payment records sorted by creation date (newest first)
 */
export async function getAllPayments(): Promise<
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
