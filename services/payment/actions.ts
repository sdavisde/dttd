'use server'

import { revalidatePath } from 'next/cache'
import { authorizedAction } from '@/lib/actions/authorized-action'
import { Permission } from '@/lib/security'
import { PaymentRecord } from '@/lib/payments/types'
import * as PaymentService from './payment-service'
import type {
  PaymentTargetOption,
  PaymentTransactionDTO,
  PaymentTransactionRow,
  ReassignPaymentInput,
  UpdatePaymentDetailsInput,
  VoidPaymentInput,
} from './types'
import type { Weekend } from '@/lib/weekend/types'
import { getGroupMemberByRosterId } from '@/services/weekend-group-member/repository'
import { isErr, isOk, ok } from '@/lib/results'

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
 * Retrieves all payment records including voided ones, for the admin payments
 * table. Voided payments never reach a total — see getAllPayments for every
 * other caller. Requires READ_PAYMENTS permission.
 */
export const getAllPaymentsIncludingVoided = authorizedAction<
  void,
  PaymentTransactionDTO[]
>(Permission.READ_PAYMENTS, async () => {
  return await PaymentService.getAllPaymentsIncludingVoided()
})

/**
 * Lists the candidates and team members a payment can be reassigned to.
 * Requires WRITE_PAYMENTS permission.
 */
export const getPaymentTargetOptions = authorizedAction<
  void,
  PaymentTargetOption[]
>(Permission.WRITE_PAYMENTS, async () => {
  return await PaymentService.getPaymentTargetOptions()
})

/**
 * Reassigns a payment to a different candidate or team member, moving its
 * weekend with it. Requires WRITE_PAYMENTS permission.
 */
export const reassignPayment = authorizedAction<
  ReassignPaymentInput,
  PaymentTransactionRow
>(Permission.WRITE_PAYMENTS, async (input) => {
  const result = await PaymentService.reassignPayment(input)
  if (isOk(result)) revalidatePaymentViews()
  return result
})

/**
 * Voids a payment without deleting it. Requires WRITE_PAYMENTS permission.
 */
export const voidPayment = authorizedAction<
  VoidPaymentInput,
  PaymentTransactionRow
>(Permission.WRITE_PAYMENTS, async (input) => {
  const result = await PaymentService.voidPayment(input)
  if (isOk(result)) revalidatePaymentViews()
  return result
})

/**
 * Corrects a payment's amount, method, payer, or notes.
 * Requires WRITE_PAYMENTS permission.
 */
export const updatePaymentDetails = authorizedAction<
  UpdatePaymentDetailsInput,
  PaymentTransactionRow
>(Permission.WRITE_PAYMENTS, async (input) => {
  const result = await PaymentService.updatePaymentDetails(input)
  if (isOk(result)) revalidatePaymentViews()
  return result
})

/**
 * Refreshes every server-rendered view whose numbers a correction can move:
 * the payments table and report, and the candidate list where balances show.
 */
function revalidatePaymentViews() {
  revalidatePath('/admin/payments')
  revalidatePath('/admin/payments/summary')
  revalidatePath('/review-candidates')
}

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

/**
 * Computes financial health metrics for the active weekend group.
 * Requires READ_PAYMENTS permission.
 */
export async function getActiveWeekendFinancials(
  payments: PaymentTransactionDTO[],
  activeWeekends: Record<'MENS' | 'WOMENS', Weekend>
) {
  return await PaymentService.getActiveWeekendFinancials(
    payments,
    activeWeekends
  )
}
