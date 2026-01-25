'use server'

import { authorizedAction } from '@/lib/actions/authorized-action'
import { Permission } from '@/lib/security'
import { PaymentRecord } from '@/lib/payments/types'
import * as PaymentService from './payment-service'

/**
 * Retrieves a Stripe price by its ID.
 * This is a public action that does not require authentication.
 */
export async function getPrice(priceId: string) {
  return await PaymentService.getPrice(priceId)
}

/**
 * Checks if a team member has made any payment for the given weekend roster.
 * This is a public action used during the payment flow.
 */
export async function hasTeamPayment(weekendRosterId: string) {
  return await PaymentService.hasTeamPayment(weekendRosterId)
}

/**
 * Retrieves all payment records (team fees and candidate fees).
 * Requires READ_PAYMENTS permission.
 */
export const getAllPayments = authorizedAction<void, PaymentRecord[]>(
  Permission.READ_PAYMENTS,
  async () => {
    return await PaymentService.getAllPayments()
  }
)

/**
 * Retrieves the team fee price from Stripe.
 * This is a public action used during the payment flow.
 * Cached with max lifetime since Stripe prices rarely change.
 */
export async function getTeamFee() {
  return await PaymentService.getTeamFee()
}

/**
 * Retrieves the candidate fee price from Stripe.
 * This is a public action used during the payment flow.
 * Cached with max lifetime since Stripe prices rarely change.
 */
export async function getCandidateFee() {
  return await PaymentService.getCandidateFee()
}
