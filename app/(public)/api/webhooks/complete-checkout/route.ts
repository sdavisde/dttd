import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { Result, ok, err, isErr, isOk, Results } from '@/lib/results'
import Stripe from 'stripe'
import { Tables } from '@/database.types'
import { getWeekendRosterRecord } from '@/services/weekend'
import {
  notifyAssistantHeadForTeamPayment,
  notifyCandidatePaymentReceivedAdmin,
} from '@/services/notifications'
import { isNil } from 'lodash'
import { getTransactionData } from '@/services/stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

if (!webhookSecret) {
  throw new Error('Missing Stripe webhook secret')
}

// Admin client for webhook operations - bypasses RLS since webhooks have no user session
let adminClient: ReturnType<typeof createAdminClient>

export async function POST(request: NextRequest) {
  // Initialize admin client for this request
  adminClient = createAdminClient()

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      logger.error('Missing Stripe signature in webhook request')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: any

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      logger.error(err, `Webhook signature verification failed`)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // This route should only accept checkout.session.completed events
    if (event.type !== 'checkout.session.completed') {
      logger.info(
        `💢 Ignoring webhook event: ${event.type} - Event type not supported`
      )
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const checkoutCompletedEvent = event as Stripe.CheckoutSessionCompletedEvent
    const session = checkoutCompletedEvent.data.object

    if (!session.payment_intent || typeof session.payment_intent !== 'string') {
      logger.error(
        `💢 Missing payment intent in session: ${session.payment_intent}`
      )
      return NextResponse.json(
        { error: 'Missing payment intent' },
        { status: 400 }
      )
    }

    logger.info(session, `Processing completed checkout session`)

    const priceId = session.metadata?.price_id

    // Check if this is a candidate payment
    switch (priceId) {
      case process.env.CANDIDATE_FEE_PRICE_ID:
        const candidateId = session.metadata?.candidateId ?? null
        if (isNil(candidateId)) {
          logger.error(`💢 Missing candidate ID in session`)
          return NextResponse.json(
            { error: 'Missing candidate ID' },
            { status: 400 }
          )
        }

        logger.info(
          `Processing candidate payment for candidate: ${candidateId}`
        )

        const candidateIsAwaitingPaymentResult =
          await candidateIsAwaitingPayment(candidateId)
        if (isErr(candidateIsAwaitingPaymentResult)) {
          logger.error(
            candidateIsAwaitingPaymentResult,
            `💢 Candidate is not awaiting payment`
          )
          return NextResponse.json(
            { error: candidateIsAwaitingPaymentResult.error },
            { status: 400 }
          )
        }

        logger.info(
          `✅ Found candidate tied to payment, and they are awaiting payment`
        )

        // This non-null assertion is safe because we check for id existance in the function above
        const recordCandidatePaymentResult = await recordCandidatePayment(
          candidateId!,
          session
        )
        if (isErr(recordCandidatePaymentResult)) {
          logger.error(
            `💢 Failed to record candidate payment ${recordCandidatePaymentResult.error}`
          )
          return NextResponse.json(
            { error: recordCandidatePaymentResult.error },
            { status: 400 }
          )
        }

        logger.info(
          `✅ Successfully recorded candidate_payment ${recordCandidatePaymentResult.data.id} for candidate id ${candidateId}`
        )

        const confirmCandidateResult = await confirmCandidate(candidateId!)
        if (isErr(confirmCandidateResult)) {
          logger.error(
            `💢 Failed to confirm candidate ${candidateId} ${confirmCandidateResult.error}`
          )
          return NextResponse.json(
            { error: confirmCandidateResult.error },
            { status: 400 }
          )
        }

        logger.info(`✅ Successfully confirmed candidate ${candidateId}`)

        // Notify pre-weekend couple of payment (don't fail webhook if email fails)
        const candidatePaymentAmount = session.amount_total
          ? session.amount_total / 100
          : 0
        const notifyPreWeekendResult =
          await notifyCandidatePaymentReceivedAdmin(
            candidateId!,
            candidatePaymentAmount,
            'card'
          )
        if (isErr(notifyPreWeekendResult)) {
          logger.error(
            notifyPreWeekendResult,
            `💢 Failed to notify pre-weekend couple of candidate payment`
          )
        } else {
          logger.info(
            `✅ Successfully notified pre-weekend couple of candidate payment`
          )
        }
        break
      case process.env.TEAM_FEE_PRICE_ID:
        const teamUserId = session.metadata?.user_id ?? null
        const weekendId = session.metadata?.weekend_id ?? null
        logger.info(`Processing team payment for team: ${teamUserId}`)

        const weekendRosterRecord = await getWeekendRosterRecord(
          teamUserId,
          weekendId
        )
        if (isErr(weekendRosterRecord)) {
          logger.error(
            weekendRosterRecord,
            `💢 Failed to get weekend_roster record`
          )
          return NextResponse.json(
            { error: weekendRosterRecord.error },
            { status: 400 }
          )
        }

        logger.info(
          `✅ Found weekend_roster record for team member: ${teamUserId}`
        )

        const weekendRosterPaymentRecord = await recordWeekendRosterPayment(
          weekendRosterRecord.data.id!,
          session
        )
        if (isErr(weekendRosterPaymentRecord)) {
          logger.error(
            weekendRosterPaymentRecord,
            `💢 Failed to record weekend_roster_payment`
          )
          return NextResponse.json(
            { error: weekendRosterPaymentRecord.error },
            { status: 400 }
          )
        }

        logger.info(
          `✅ Successfully recorded weekend_roster_payment ${weekendRosterPaymentRecord.data.id} for weekend_roster_id ${weekendRosterRecord.data.id}`
        )

        const markTeamMemberAsPaidResult = await markTeamMemberAsPaid(
          weekendRosterRecord.data.id
        )
        if (isErr(markTeamMemberAsPaidResult)) {
          logger.error(
            markTeamMemberAsPaidResult,
            `💢 Failed to mark team member as paid`
          )
          return NextResponse.json(
            { error: markTeamMemberAsPaidResult.error },
            { status: 400 }
          )
        }

        logger.info(`✅ Successfully marked team member as paid`)

        const paymentAmount = session.amount_total
          ? session.amount_total / 100
          : 0

        const notifyAssistantHeadResult =
          await notifyAssistantHeadForTeamPayment(
            teamUserId,
            weekendId,
            paymentAmount
          )
        if (isErr(notifyAssistantHeadResult)) {
          logger.error(
            notifyAssistantHeadResult,
            `💢 Failed to notify assistant head of team payment`
          )
          // The payment was processed successfully, so we don't return an error here
        } else {
          logger.info(`✅ Successfully notified assistant head of team payment`)
        }
        break
      default:
        logger.error(
          `💢 Error during webhook processing: Unknown price id: ${priceId}`
        )
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error(error, `💢 Webhook processing error`)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Checks if a candidate is in the awaiting_payment status
 */
async function candidateIsAwaitingPayment(
  candidateId: string | null
): Promise<Result<string, true>> {
  if (!candidateId) {
    return err('💢 Candidate ID is null')
  }

  // Verify the candidate exists and is in awaiting_payment status
  const { data: candidate, error: fetchError } = await adminClient
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single()

  if (fetchError) {
    return err(fetchError.message)
  }

  if (!candidate) {
    return err(`💢 Candidate not found with id: ${candidateId}`)
  }

  if (candidate.status !== 'awaiting_payment') {
    return err('💢 Candidate not in awaiting_payment status')
  }

  return ok(true)
}

/**
 * Records a candidate payment in the candidate_payments table
 */
async function recordCandidatePayment(
  candidateId: string,
  session: Stripe.Checkout.Session
): Promise<Result<string, Tables<'candidate_payments'>>> {
  const paymentIntentId = session.payment_intent as string

  // Fetch fee data from Stripe
  const transactionResult = await getTransactionData(paymentIntentId)
  if (isErr(transactionResult)) {
    logger.warn(
      { candidateId, error: transactionResult.error },
      'Transaction data not available at checkout time - will be backfilled at payout'
    )
  }
  const transaction = Results.unwrapOr(transactionResult, null)

  // insert candidate payment record, including fee information if it exists
  const { data: paymentRecord, error: paymentRecordError } = await adminClient
    .from('candidate_payments')
    .insert({
      candidate_id: candidateId,
      payment_amount: session.amount_total ? session.amount_total / 100 : null, // Convert from cents
      payment_owner: session.metadata?.payment_owner ?? 'unknown',
      payment_intent_id: paymentIntentId,
      payment_method: 'card',
      // Fee tracking fields
      stripe_fee: transaction?.stripeFee ?? null,
      net_amount: transaction?.netAmount ?? null,
      charge_id: transaction?.chargeId ?? null,
      balance_transaction_id: transaction?.balanceTransactionId ?? null,
    })
    .select()
    .single()

  if (paymentRecordError) {
    return err(paymentRecordError.message)
  }

  if (!paymentRecord) {
    return err('💢 Failed to record payment')
  }

  return ok(paymentRecord)
}

/**
 * Confirms a candidate by updating their status to confirmed
 */
async function confirmCandidate(
  candidateId: string
): Promise<Result<string, true>> {
  // Update candidate status to confirmed
  const { error: updateError } = await adminClient
    .from('candidates')
    .update({ status: 'confirmed' })
    .eq('id', candidateId)

  if (updateError) {
    return err(
      `💢 Failed to update candidate status to confirmed: ${updateError.message}`
    )
  }

  return ok(true)
}

async function recordWeekendRosterPayment(
  weekendRosterRecordId: string,
  session: Stripe.Checkout.Session
): Promise<Result<string, Tables<'weekend_roster_payments'>>> {
  const paymentIntentId = session.payment_intent as string

  // Fetch fee data from Stripe
  const transactionResult = await getTransactionData(paymentIntentId)
  if (isErr(transactionResult)) {
    logger.warn(
      { weekendRosterRecordId, error: transactionResult.error },
      'Transaction data not available at checkout time - will be backfilled at payout'
    )
  }
  const transaction = Results.unwrapOr(transactionResult, null)

  const { data: weekendRosterPaymentRecord, error: paymentRecordError } =
    await adminClient
      .from('weekend_roster_payments')
      .insert({
        weekend_roster_id: weekendRosterRecordId,
        payment_intent_id: paymentIntentId,
        payment_amount: session.amount_total
          ? session.amount_total / 100
          : null,
        payment_method: 'card',
        // Fee tracking fields
        stripe_fee: transaction?.stripeFee ?? null,
        net_amount: transaction?.netAmount ?? null,
        charge_id: transaction?.chargeId ?? null,
        balance_transaction_id: transaction?.balanceTransactionId ?? null,
      })
      .select()
      .single()

  if (paymentRecordError) {
    return err(paymentRecordError.message)
  }

  return ok(weekendRosterPaymentRecord)
}

async function markTeamMemberAsPaid(
  weekendRosterId: string
): Promise<Result<string, true>> {
  const { error: updateError } = await adminClient
    .from('weekend_roster')
    .update({ status: 'paid' })
    .eq('id', weekendRosterId)

  if (updateError) {
    return err(
      `💢 Failed to update weekend_roster record to paid: ${updateError.message}`
    )
  }

  return ok(true)
}
