'use server'

import { authorizedAction } from '@/lib/actions/authorized-action'
import { Permission } from '@/lib/security'
import { PaymentRecord } from '@/lib/payments/types'
import * as PaymentService from './payment-service'
import { PaymentTransactionDTO } from './types'
import { getGroupMemberByRosterId } from '@/services/weekend-group-member/repository'
import { isErr, ok } from '@/lib/results'

/**
 * Retrieves a Stripe price by its ID.
 * This is a public action that does not require authentication.
 */
export async function getPrice(priceId: string) {
  return await PaymentService.getPrice(priceId)
}

/**
 * Checks if a team member has made any payment.
 * Accepts either a rosterId (bridges to groupMemberId) or a groupMemberId directly.
 * This is a public action used during the payment flow and homepage TODO check.
 */
export async function hasTeamPayment(rosterOrGroupMemberId: string) {
  // Try to resolve as a rosterId first (bridge for pre-task-4 callers passing teamMemberInfo.id)
  const groupMemberResult = await getGroupMemberByRosterId(
    rosterOrGroupMemberId
  )
  const groupMemberId = isErr(groupMemberResult)
    ? rosterOrGroupMemberId // fall back: assume it's already a groupMemberId
    : groupMemberResult.data.id

  return await PaymentService.hasPaymentForTarget(
    'weekend_group_member',
    groupMemberId
  )
}

/**
 * Retrieves all payment records from the new payment_transaction table.
 * Requires READ_PAYMENTS permission.
 */
export const getAllPayments = authorizedAction<void, PaymentTransactionDTO[]>(
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
