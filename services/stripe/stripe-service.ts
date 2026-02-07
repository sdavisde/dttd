import 'server-only'

import { stripe } from '@/lib/stripe'
import { err, ok, Result } from '@/lib/results'
import { logger } from '@/lib/logger'

/**
 * Fee data retrieved from a Stripe payment
 */
export type TransactionData = {
  /** Total amount charged in dollars (gross) */
  grossAmount: number
  /** Stripe processing fee in dollars */
  stripeFee: number
  /** Net amount after fee deduction in dollars */
  netAmount: number
  /** Stripe charge ID */
  chargeId: string
  /** Stripe balance transaction ID */
  balanceTransactionId: string
}

/**
 * Transaction data from a payout
 */
export type PayoutTransaction = {
  /** Stripe charge ID */
  chargeId: string
  /** Stripe payment intent ID */
  paymentIntentId: string | null
  /** Stripe balance transaction ID */
  balanceTransactionId: string
  /** Gross amount in cents */
  grossAmount: number
  /** Stripe fee in cents */
  stripeFee: number
  /** Net amount in cents */
  netAmount: number
}

/**
 * Retrieves transaction data via the PaymentIntent -> Charge -> BalanceTransaction chain.
 *
 * Flow:
 * 1. Retrieve PaymentIntent to get the latest charge ID
 * 2. Retrieve Charge to get the balance_transaction ID
 * 3. Retrieve BalanceTransaction to get the fee amount
 *
 * @param paymentIntentId - The Stripe payment intent ID (e.g., 'pi_xxx')
 * @returns Fee data including stripe_fee, net_amount, and IDs for tracking
 */
export async function getTransactionData(
  paymentIntentId: string
): Promise<Result<string, TransactionData>> {
  try {
    // 1. Get the PaymentIntent to find the latest charge
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (!paymentIntent.latest_charge) {
      logger.warn(
        { paymentIntentId },
        'PaymentIntent has no charge yet - fee data not available'
      )
      return err('Payment has not been charged yet')
    }

    const chargeId =
      typeof paymentIntent.latest_charge === 'string'
        ? paymentIntent.latest_charge
        : paymentIntent.latest_charge.id

    // 2. Get the Charge to find the balance transaction
    const charge = await stripe.charges.retrieve(chargeId)

    if (!charge.balance_transaction) {
      logger.warn(
        { chargeId },
        'Charge has no balance_transaction yet - fee data not available'
      )
      return err('Charge has no balance transaction yet')
    }

    const balanceTransactionId =
      typeof charge.balance_transaction === 'string'
        ? charge.balance_transaction
        : charge.balance_transaction.id

    // 3. Get the BalanceTransaction to get fee details
    const balanceTransaction =
      await stripe.balanceTransactions.retrieve(balanceTransactionId)

    // Stripe amounts are in cents, convert to dollars
    const grossAmount = balanceTransaction.amount / 100
    const stripeFee = balanceTransaction.fee / 100
    const netAmount = balanceTransaction.net / 100

    logger.info(
      {
        paymentIntentId,
        chargeId,
        balanceTransactionId,
        grossAmount,
        stripeFee,
        netAmount,
      },
      'Successfully retrieved payment fee data'
    )

    return ok({
      grossAmount,
      stripeFee,
      netAmount,
      chargeId,
      balanceTransactionId,
    })
  } catch (error) {
    logger.error(
      { error, paymentIntentId },
      'Failed to retrieve payment fee data'
    )
    return err(
      `Failed to retrieve fee data: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Lists all transactions (charges) included in a Stripe payout.
 *
 * When Stripe pays out funds to your bank account, multiple charges may be
 * included in a single payout. This function retrieves all those transactions
 * so we can mark them as deposited.
 *
 * @param payoutId - The Stripe payout ID (e.g., 'po_xxx')
 * @returns Array of transaction data with charge IDs and payment intent IDs
 */
export async function getPayoutTransactions(
  payoutId: string
): Promise<Result<string, PayoutTransaction[]>> {
  try {
    const transactions: PayoutTransaction[] = []

    // List all balance transactions for this payout
    // We need to paginate in case there are many transactions
    let hasMore = true
    let startingAfter: string | undefined

    while (hasMore) {
      const params: {
        payout: string
        type: 'charge'
        limit: number
        starting_after?: string
      } = {
        payout: payoutId,
        type: 'charge', // Only get charges (not fees, refunds, etc.)
        limit: 100,
      }

      if (startingAfter) {
        params.starting_after = startingAfter
      }

      const balanceTransactions = await stripe.balanceTransactions.list(params)

      for (const bt of balanceTransactions.data) {
        // The source of a charge balance transaction is the charge ID
        if (bt.source && typeof bt.source === 'string') {
          // Retrieve the charge to get the payment_intent
          const charge = await stripe.charges.retrieve(bt.source)

          transactions.push({
            chargeId: bt.source,
            paymentIntentId:
              typeof charge.payment_intent === 'string'
                ? charge.payment_intent
                : (charge.payment_intent?.id ?? null),
            balanceTransactionId: bt.id,
            // Include fee data from balance transaction (amounts in cents)
            grossAmount: bt.amount,
            stripeFee: bt.fee,
            netAmount: bt.net,
          })
        }
      }

      hasMore = balanceTransactions.has_more
      if (balanceTransactions.data.length > 0) {
        startingAfter =
          balanceTransactions.data[balanceTransactions.data.length - 1].id
      }
    }

    logger.info(
      { payoutId, transactionCount: transactions.length },
      'Successfully retrieved payout transactions'
    )

    return ok(transactions)
  } catch (error) {
    logger.error({ error, payoutId }, 'Failed to retrieve payout transactions')
    return err(
      `Failed to retrieve payout transactions: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
