import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { isErr, isOk, Results } from '@/lib/results'
import Stripe from 'stripe'
import {
  getPayoutTransactions,
  getTransactionData,
  PayoutTransaction,
} from '@/services/stripe'
import { isNil } from 'lodash'

const webhookSecret = process.env.STRIPE_PAYOUT_WEBHOOK_SECRET

if (!webhookSecret) {
  logger.warn(
    'STRIPE_PAYOUT_WEBHOOK_SECRET is not configured - payout tracking will not work'
  )
}

// Admin client for webhook operations - bypasses RLS since webhooks have no user session
let adminClient: ReturnType<typeof createAdminClient>

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    logger.error(
      'Payout webhook called but STRIPE_PAYOUT_WEBHOOK_SECRET is not configured'
    )
    return NextResponse.json(
      { error: 'Payout webhook not configured' },
      { status: 500 }
    )
  }

  // Initialize admin client for this request
  adminClient = createAdminClient()

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      logger.error('Missing Stripe signature in payout webhook request')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      logger.error(err, 'Payout webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // This route only handles payout.paid events
    if (event.type !== 'payout.paid') {
      logger.info(
        `Ignoring payout webhook event: ${event.type} - Event type not supported`
      )
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const payoutEvent = event as Stripe.PayoutPaidEvent
    const payout = payoutEvent.data.object

    logger.info(
      { payoutId: payout.id, amount: payout.amount / 100 },
      'Processing payout.paid event'
    )

    // Get all transactions in this payout
    const transactionsResult = await getPayoutTransactions(payout.id)
    if (isErr(transactionsResult)) {
      logger.error(
        { error: transactionsResult.error, payoutId: payout.id },
        'Failed to get payout transactions'
      )
      // Return 200 so Stripe doesn't retry - we'll handle this manually if needed
      return NextResponse.json({ received: true, warning: 'Failed to process' })
    }

    const transactions = transactionsResult.data
    logger.info(
      { payoutId: payout.id, transactionCount: transactions.length },
      'Found transactions in payout'
    )

    const depositedAt = payout.arrival_date
      ? new Date(payout.arrival_date * 1000).toISOString()
      : new Date().toISOString()

    // 1. Create the payout record
    const payoutRecord = await createPayoutRecord(payout, transactions.length)
    if (!payoutRecord) {
      logger.error({ payoutId: payout.id }, 'Failed to create payout record')
      return NextResponse.json({
        received: true,
        warning: 'Failed to create payout record',
      })
    }

    // 2. Process each transaction
    let candidatePaymentsUpdated = 0
    let teamPaymentsUpdated = 0
    let transactionsRecorded = 0

    for (const transaction of transactions) {
      // Find matching payment records
      // Note: candidate_payments.id is INTEGER, weekend_roster_payments.id is UUID
      let candidatePaymentId: number | null = null
      let weekendRosterPaymentId: string | null = null

      if (transaction.paymentIntentId) {
        // Try to update candidate_payments and get the ID
        const candidateResult = await updateCandidatePaymentDeposit(
          transaction.paymentIntentId,
          payout.id,
          depositedAt,
          transaction.chargeId,
          transaction.balanceTransactionId
        )
        if (candidateResult) {
          candidatePaymentId = candidateResult
          candidatePaymentsUpdated++
        } else {
          // Try to update weekend_roster_payments and get the ID
          const teamResult = await updateTeamPaymentDeposit(
            transaction.paymentIntentId,
            payout.id,
            depositedAt,
            transaction.chargeId,
            transaction.balanceTransactionId
          )
          if (teamResult) {
            weekendRosterPaymentId = teamResult
            teamPaymentsUpdated++
          } else {
            // Transaction didn't match any payment record - might be from another system
            logger.debug(
              { paymentIntentId: transaction.paymentIntentId },
              'Transaction did not match any payment record'
            )
          }
        }
      } else {
        logger.warn(
          { chargeId: transaction.chargeId },
          'Transaction has no payment intent ID'
        )
      }

      // 3. Record the transaction in online_payment_payout_transactions
      const transactionRecorded = await createPayoutTransactionRecord(
        payoutRecord.id,
        transaction,
        candidatePaymentId,
        weekendRosterPaymentId
      )
      if (transactionRecorded) {
        transactionsRecorded++
      }
    }

    logger.info(
      {
        payoutId: payout.id,
        payoutRecordId: payoutRecord.id,
        candidatePaymentsUpdated,
        teamPaymentsUpdated,
        transactionsRecorded,
        totalTransactions: transactions.length,
      },
      'Payout processing complete'
    )

    return NextResponse.json({
      received: true,
      processed: {
        payoutRecordId: payoutRecord.id,
        candidatePayments: candidatePaymentsUpdated,
        teamPayments: teamPaymentsUpdated,
        transactionsRecorded,
      },
    })
  } catch (error) {
    logger.error(error, 'Payout webhook processing error')
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Creates a record in the online_payment_payouts table
 * @returns The created payout record, or null if creation failed
 */
async function createPayoutRecord(
  payout: Stripe.Payout,
  transactionCount: number
): Promise<{ id: string } | null> {
  const arrivalDate = payout.arrival_date
    ? new Date(payout.arrival_date * 1000).toISOString()
    : null

  const { data, error } = await adminClient
    .from('online_payment_payouts')
    .insert({
      payout_id: payout.id,
      amount: payout.amount,
      currency: payout.currency,
      status: payout.status,
      arrival_date: arrivalDate,
      transaction_count: transactionCount,
    })
    .select('id')
    .single()

  if (error) {
    // Check if this is a duplicate (payout already processed)
    if (error.code === '23505') {
      logger.info(
        { payoutId: payout.id },
        'Payout already recorded - fetching existing record'
      )
      // Fetch the existing record
      const { data: existing } = await adminClient
        .from('online_payment_payouts')
        .select('id')
        .eq('payout_id', payout.id)
        .single()
      return existing
    }
    logger.error(
      { error: error.message, payoutId: payout.id },
      'Error creating payout record'
    )
    return null
  }

  logger.info(
    { payoutRecordId: data.id, payoutId: payout.id },
    'Created payout record'
  )
  return data
}

/**
 * Creates a record in the online_payment_payout_transactions table
 * @returns true if record was created, false otherwise
 */
async function createPayoutTransactionRecord(
  payoutRecordId: string,
  transaction: PayoutTransaction,
  candidatePaymentId: number | null,
  weekendRosterPaymentId: string | null
): Promise<boolean> {
  const { error } = await adminClient
    .from('online_payment_payout_transactions')
    .insert({
      online_payment_payout_id: payoutRecordId,
      payment_intent_id: transaction.paymentIntentId,
      charge_id: transaction.chargeId,
      balance_transaction_id: transaction.balanceTransactionId,
      gross_amount: transaction.grossAmount,
      stripe_fee: transaction.stripeFee,
      net_amount: transaction.netAmount,
      candidate_payment_id: candidatePaymentId,
      weekend_roster_payment_id: weekendRosterPaymentId,
    })

  if (error) {
    // Check if this is a duplicate (transaction already recorded)
    if (error.code === '23505') {
      logger.debug(
        { balanceTransactionId: transaction.balanceTransactionId },
        'Transaction already recorded'
      )
      return true
    }
    logger.error(
      { error: error.message, chargeId: transaction.chargeId },
      'Error creating payout transaction record'
    )
    return false
  }

  return true
}

/**
 * Updates a candidate payment record with deposit information.
 * Also backfills fee data if it was missing at checkout time.
 * @returns The payment ID (number) if a record was updated, null otherwise
 */
async function updateCandidatePaymentDeposit(
  paymentIntentId: string,
  payoutId: string,
  depositedAt: string,
  chargeId: string,
  balanceTransactionId: string
): Promise<number | null> {
  // First check if this payment exists and needs updating
  const { data: existingPayment, error: fetchError } = await adminClient
    .from('candidate_payments')
    .select('id, stripe_fee, net_amount, charge_id, balance_transaction_id')
    .eq('payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (fetchError) {
    logger.error(
      { error: fetchError.message, paymentIntentId },
      'Error fetching candidate payment'
    )
    return null
  }

  if (!existingPayment) {
    return null
  }

  // Build the update object
  const updateData: Record<string, unknown> = {
    deposited_at: depositedAt,
    payout_id: payoutId,
  }

  // Backfill fee data if missing
  if (isNil(existingPayment.stripe_fee) || isNil(existingPayment.net_amount)) {
    const transactionResult = await getTransactionData(paymentIntentId)
    if (isOk(transactionResult)) {
      updateData.stripe_fee = transactionResult.data.stripeFee
      updateData.net_amount = transactionResult.data.netAmount
      updateData.charge_id = transactionResult.data.chargeId
      updateData.balance_transaction_id =
        transactionResult.data.balanceTransactionId
      logger.info(
        { paymentIntentId, feeData: transactionResult.data },
        'Backfilling fee data for candidate payment'
      )
    }
  } else {
    // Just update the charge_id and balance_transaction_id if they're not set
    if (isNil(existingPayment.charge_id)) {
      updateData.charge_id = chargeId
    }
    if (isNil(existingPayment.balance_transaction_id)) {
      updateData.balance_transaction_id = balanceTransactionId
    }
  }

  const { error: updateError } = await adminClient
    .from('candidate_payments')
    .update(updateData)
    .eq('id', existingPayment.id)

  if (updateError) {
    logger.error(
      { error: updateError.message, paymentId: existingPayment.id },
      'Error updating candidate payment deposit'
    )
    return null
  }

  logger.info(
    { paymentId: existingPayment.id, paymentIntentId, payoutId },
    'Updated candidate payment with deposit info'
  )
  return existingPayment.id
}

/**
 * Updates a weekend roster payment record with deposit information.
 * Also backfills fee data if it was missing at checkout time.
 * @returns The payment ID if a record was updated, null otherwise
 */
async function updateTeamPaymentDeposit(
  paymentIntentId: string,
  payoutId: string,
  depositedAt: string,
  chargeId: string,
  balanceTransactionId: string
): Promise<string | null> {
  // First check if this payment exists and needs updating
  const { data: existingPayment, error: fetchError } = await adminClient
    .from('weekend_roster_payments')
    .select('id, stripe_fee, net_amount, charge_id, balance_transaction_id')
    .eq('payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (fetchError) {
    logger.error(
      { error: fetchError.message, paymentIntentId },
      'Error fetching team payment'
    )
    return null
  }

  if (!existingPayment) {
    return null
  }

  // Build the update object
  const updateData: Record<string, unknown> = {
    deposited_at: depositedAt,
    payout_id: payoutId,
  }

  // Backfill fee data if missing
  if (isNil(existingPayment.stripe_fee) || isNil(existingPayment.net_amount)) {
    const transactionResult = await getTransactionData(paymentIntentId)
    if (isOk(transactionResult)) {
      updateData.stripe_fee = transactionResult.data.stripeFee
      updateData.net_amount = transactionResult.data.netAmount
      updateData.charge_id = transactionResult.data.chargeId
      updateData.balance_transaction_id =
        transactionResult.data.balanceTransactionId
      logger.info(
        { paymentIntentId, feeData: transactionResult.data },
        'Backfilling fee data for team payment'
      )
    }
  } else {
    // Just update the charge_id and balance_transaction_id if they're not set
    if (isNil(existingPayment.charge_id)) {
      updateData.charge_id = chargeId
    }
    if (isNil(existingPayment.balance_transaction_id)) {
      updateData.balance_transaction_id = balanceTransactionId
    }
  }

  const { error: updateError } = await adminClient
    .from('weekend_roster_payments')
    .update(updateData)
    .eq('id', existingPayment.id)

  if (updateError) {
    logger.error(
      { error: updateError.message, paymentId: existingPayment.id },
      'Error updating team payment deposit'
    )
    return null
  }

  logger.info(
    { paymentId: existingPayment.id, paymentIntentId, payoutId },
    'Updated team payment with deposit info'
  )
  return existingPayment.id
}
