import 'server-only'

import Stripe from 'stripe'
import { ok, isErr, isOk, Results } from '@/lib/results'
import { logger } from '@/lib/logger'
import { isNil } from 'lodash'
import { getTransactionData } from '../stripe-service'
import {
  WebhookHandler,
  WebhookHandlerContext,
  WebhookErrorCodes,
} from './types'
import { webhookErr } from '../webhook-context'

/**
 * Handler for charge.updated events.
 *
 * Backfills fee data (stripe_fee, net_amount, charge_id, balance_transaction_id)
 * for payments that didn't have it available at checkout time.
 *
 * Stripe guarantees balance_transaction is available within 1 hour of charge creation.
 * This handler catches those updates to populate fee data before the payout.
 */
export const chargeUpdatedHandler: WebhookHandler<Stripe.ChargeUpdatedEvent> = {
  eventType: 'charge.updated',
  handle: async (event, ctx) => {
    const charge = event.data.object

    // Only process if balance_transaction is now present
    if (!charge.balance_transaction) {
      logger.debug(
        { chargeId: charge.id },
        'charge.updated: No balance_transaction yet, skipping'
      )
      return ok({ processed: false })
    }

    // Get the payment_intent to look up our payment records
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id

    if (!paymentIntentId) {
      logger.debug(
        { chargeId: charge.id },
        'charge.updated: No payment_intent, skipping'
      )
      return ok({ processed: false })
    }

    ctx.updateContext({
      paymentIntentId,
      chargeId: charge.id,
      amount: charge.amount / 100,
    })

    logger.info(
      { chargeId: charge.id, paymentIntentId },
      'Processing charge.updated for fee backfill'
    )

    // Try to backfill candidate payment
    const candidateResult = await backfillCandidatePaymentFees(
      paymentIntentId,
      ctx.adminClient
    )

    if (candidateResult.updated) {
      logger.info(
        { paymentIntentId, paymentId: candidateResult.paymentId },
        'Backfilled fee data for candidate payment'
      )
      return ok({
        processed: true,
        entityType: 'fee_backfill',
        entityId: candidateResult.paymentId,
        details: {
          paymentType: 'candidate',
          paymentIntentId,
        },
      })
    }

    // Try to backfill team payment
    const teamResult = await backfillTeamPaymentFees(
      paymentIntentId,
      ctx.adminClient
    )

    if (teamResult.updated) {
      logger.info(
        { paymentIntentId, paymentId: teamResult.paymentId },
        'Backfilled fee data for team payment'
      )
      return ok({
        processed: true,
        entityType: 'fee_backfill',
        entityId: teamResult.paymentId,
        details: {
          paymentType: 'team',
          paymentIntentId,
        },
      })
    }

    // No payment found for this charge - might be from another system
    logger.debug(
      { paymentIntentId, chargeId: charge.id },
      'charge.updated: No matching payment record found'
    )

    return ok({ processed: false })
  },
}

type BackfillResult = {
  updated: boolean
  paymentId?: number | string
}

/**
 * Backfills fee data for a candidate payment if it's missing.
 */
async function backfillCandidatePaymentFees(
  paymentIntentId: string,
  adminClient: WebhookHandlerContext['adminClient']
): Promise<BackfillResult> {
  // Check if payment exists and needs fee data
  const { data: existingPayment, error: fetchError } = await adminClient
    .from('candidate_payments')
    .select('id, stripe_fee, net_amount, charge_id, balance_transaction_id')
    .eq('payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (fetchError) {
    logger.error(
      { error: fetchError.message, paymentIntentId },
      'Error fetching candidate payment for fee backfill'
    )
    return { updated: false }
  }

  if (!existingPayment) {
    return { updated: false }
  }

  // Check if fee data is already populated
  if (
    !isNil(existingPayment.stripe_fee) &&
    !isNil(existingPayment.net_amount) &&
    !isNil(existingPayment.charge_id) &&
    !isNil(existingPayment.balance_transaction_id)
  ) {
    logger.debug(
      { paymentId: existingPayment.id },
      'Candidate payment already has fee data'
    )
    return { updated: false }
  }

  // Fetch fee data from Stripe
  const transactionResult = await getTransactionData(paymentIntentId)
  if (isErr(transactionResult)) {
    logger.warn(
      { paymentIntentId, error: transactionResult.error },
      'Failed to fetch fee data for candidate payment backfill'
    )
    return { updated: false }
  }

  const feeData = transactionResult.data

  // Update the payment record
  const { error: updateError } = await adminClient
    .from('candidate_payments')
    .update({
      stripe_fee: feeData.stripeFee,
      net_amount: feeData.netAmount,
      charge_id: feeData.chargeId,
      balance_transaction_id: feeData.balanceTransactionId,
    })
    .eq('id', existingPayment.id)

  if (updateError) {
    logger.error(
      { error: updateError.message, paymentId: existingPayment.id },
      'Error updating candidate payment with fee data'
    )
    return { updated: false }
  }

  return { updated: true, paymentId: existingPayment.id }
}

/**
 * Backfills fee data for a team payment if it's missing.
 */
async function backfillTeamPaymentFees(
  paymentIntentId: string,
  adminClient: WebhookHandlerContext['adminClient']
): Promise<BackfillResult> {
  // Check if payment exists and needs fee data
  const { data: existingPayment, error: fetchError } = await adminClient
    .from('weekend_roster_payments')
    .select('id, stripe_fee, net_amount, charge_id, balance_transaction_id')
    .eq('payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (fetchError) {
    logger.error(
      { error: fetchError.message, paymentIntentId },
      'Error fetching team payment for fee backfill'
    )
    return { updated: false }
  }

  if (!existingPayment) {
    return { updated: false }
  }

  // Check if fee data is already populated
  if (
    !isNil(existingPayment.stripe_fee) &&
    !isNil(existingPayment.net_amount) &&
    !isNil(existingPayment.charge_id) &&
    !isNil(existingPayment.balance_transaction_id)
  ) {
    logger.debug(
      { paymentId: existingPayment.id },
      'Team payment already has fee data'
    )
    return { updated: false }
  }

  // Fetch fee data from Stripe
  const transactionResult = await getTransactionData(paymentIntentId)
  if (isErr(transactionResult)) {
    logger.warn(
      { paymentIntentId, error: transactionResult.error },
      'Failed to fetch fee data for team payment backfill'
    )
    return { updated: false }
  }

  const feeData = transactionResult.data

  // Update the payment record
  const { error: updateError } = await adminClient
    .from('weekend_roster_payments')
    .update({
      stripe_fee: feeData.stripeFee,
      net_amount: feeData.netAmount,
      charge_id: feeData.chargeId,
      balance_transaction_id: feeData.balanceTransactionId,
    })
    .eq('id', existingPayment.id)

  if (updateError) {
    logger.error(
      { error: updateError.message, paymentId: existingPayment.id },
      'Error updating team payment with fee data'
    )
    return { updated: false }
  }

  return { updated: true, paymentId: existingPayment.id }
}
