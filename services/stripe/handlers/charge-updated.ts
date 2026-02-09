import 'server-only'

import Stripe from 'stripe'
import { ok, isErr } from '@/lib/results'
import { logger } from '@/lib/logger'
import { getTransactionData } from '../stripe-service'
import { WebhookHandler } from './types'
import * as PaymentService from '@/services/payment/payment-service'

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

    // Fetch fee data from Stripe
    const transactionResult = await getTransactionData(paymentIntentId)
    if (isErr(transactionResult)) {
      logger.warn(
        { paymentIntentId, error: transactionResult.error },
        'Failed to fetch fee data for payment backfill'
      )
      return ok({ processed: false })
    }

    const feeData = transactionResult.data

    // Use PaymentService to backfill the payment transaction data
    const backfillResult = await PaymentService.backfillStripeData(
      paymentIntentId,
      {
        net_amount: feeData.netAmount,
        stripe_fee: feeData.stripeFee,
        charge_id: feeData.chargeId,
        balance_transaction_id: feeData.balanceTransactionId,
      },
      { dangerouslyBypassRLS: true }
    )

    if (isErr(backfillResult)) {
      // Payment not found in payment_transaction table - might be legacy or from another system
      logger.debug(
        { paymentIntentId, chargeId: charge.id, error: backfillResult.error },
        'charge.updated: No matching payment_transaction record found'
      )
      return ok({ processed: false })
    }

    logger.info(
      { paymentIntentId, paymentId: backfillResult.data.id },
      'Backfilled fee data for payment transaction'
    )

    return ok({
      processed: true,
      entityType: 'fee_backfill',
      entityId: backfillResult.data.id,
      details: {
        paymentType: backfillResult.data.target_type,
        paymentIntentId,
      },
    })
  },
}
