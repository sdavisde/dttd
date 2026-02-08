import 'server-only'

import Stripe from 'stripe'
import { ok, isErr, Results } from '@/lib/results'
import { logger } from '@/lib/logger'
import { Tables } from '@/database.types'
import { getWeekendRosterRecord } from '@/services/weekend'
import {
  notifyAssistantHeadForTeamPayment,
  notifyCandidatePaymentReceivedAdmin,
} from '@/services/notifications'
import { isNil } from 'lodash'
import { getTransactionData } from '../stripe-service'
import {
  WebhookHandler,
  WebhookHandlerContext,
  WebhookErrorCodes,
  HandlerSuccess,
  WebhookError,
} from './types'
import { webhookErr } from '../webhook-context'

/**
 * Handler for checkout.session.completed events.
 * Processes both candidate and team payments.
 */
export const checkoutSessionCompletedHandler: WebhookHandler<Stripe.CheckoutSessionCompletedEvent> =
  {
    eventType: 'checkout.session.completed',
    handle: async (event, ctx) => {
      const session = event.data.object

      if (
        !session.payment_intent ||
        typeof session.payment_intent !== 'string'
      ) {
        return webhookErr(
          WebhookErrorCodes.MISSING_PAYMENT_INTENT,
          'Missing payment intent in session',
          'validation',
          'error',
          ctx.paymentContext
        )
      }

      ctx.updateContext({
        paymentIntentId: session.payment_intent,
        amount: session.amount_total ? session.amount_total / 100 : undefined,
      })

      logger.info(
        { sessionId: session.id, paymentIntentId: session.payment_intent },
        'Processing completed checkout session'
      )

      const priceId = session.metadata?.price_id

      // Route based on price ID
      switch (priceId) {
        case process.env.CANDIDATE_FEE_PRICE_ID:
          return handleCandidatePayment(session, ctx)

        case process.env.TEAM_FEE_PRICE_ID:
          return handleTeamPayment(session, ctx)

        default:
          logger.warn(
            { priceId },
            'Unknown price ID in checkout session - ignoring'
          )
          // Return success but not processed - unknown price IDs are not an error
          return ok({ processed: false })
      }
    },
  }

/**
 * Handles candidate payment processing.
 */
async function handleCandidatePayment(
  session: Stripe.Checkout.Session,
  ctx: WebhookHandlerContext
): Promise<ReturnType<WebhookHandler['handle']>> {
  const candidateId = session.metadata?.candidateId ?? null

  if (isNil(candidateId)) {
    return webhookErr(
      WebhookErrorCodes.MISSING_CANDIDATE_ID,
      'Missing candidate ID in session metadata',
      'validation',
      'error',
      ctx.paymentContext
    )
  }

  ctx.updateContext({ candidateId })
  logger.info({ candidateId }, 'Processing candidate payment')

  // Verify candidate is awaiting payment
  const awaitingResult = await candidateIsAwaitingPayment(
    candidateId,
    ctx.adminClient
  )
  if (isErr(awaitingResult)) {
    return webhookErr(
      WebhookErrorCodes.CANDIDATE_NOT_AWAITING_PAYMENT,
      awaitingResult.error,
      'database_lookup',
      'error',
      ctx.paymentContext
    )
  }

  logger.info({ candidateId }, 'Candidate found and is awaiting payment')

  // Record the payment
  const paymentResult = await recordCandidatePayment(
    candidateId,
    session,
    ctx.adminClient
  )
  if (isErr(paymentResult)) {
    return webhookErr(
      WebhookErrorCodes.PAYMENT_RECORD_FAILED,
      paymentResult.error,
      'payment_recording',
      'error',
      ctx.paymentContext
    )
  }

  logger.info(
    { candidateId, paymentId: paymentResult.data.id },
    'Successfully recorded candidate payment'
  )

  // Update candidate status to confirmed
  const confirmResult = await confirmCandidate(candidateId, ctx.adminClient)
  if (isErr(confirmResult)) {
    return webhookErr(
      WebhookErrorCodes.STATUS_UPDATE_FAILED,
      confirmResult.error,
      'status_update',
      'error',
      ctx.paymentContext
    )
  }

  logger.info({ candidateId }, 'Successfully confirmed candidate')

  // Notify pre-weekend couple (don't fail webhook if email fails)
  const paymentAmount = session.amount_total ? session.amount_total / 100 : 0
  const notifyResult = await notifyCandidatePaymentReceivedAdmin(
    candidateId,
    paymentAmount,
    'card'
  )
  if (isErr(notifyResult)) {
    logger.error(
      { candidateId, error: notifyResult.error },
      'Failed to notify pre-weekend couple of candidate payment'
    )
  } else {
    logger.info(
      { candidateId },
      'Successfully notified pre-weekend couple of candidate payment'
    )
  }

  return ok({
    processed: true,
    entityType: 'candidate_payment',
    entityId: paymentResult.data.id,
    details: {
      candidateId,
      paymentAmount,
    },
  })
}

/**
 * Handles team member payment processing.
 */
async function handleTeamPayment(
  session: Stripe.Checkout.Session,
  ctx: WebhookHandlerContext
): Promise<ReturnType<WebhookHandler['handle']>> {
  const teamUserId = session.metadata?.user_id ?? null
  const weekendId = session.metadata?.weekend_id ?? null

  if (isNil(teamUserId)) {
    return webhookErr(
      WebhookErrorCodes.MISSING_USER_ID,
      'Missing user_id in session metadata',
      'validation',
      'error',
      ctx.paymentContext
    )
  }

  if (isNil(weekendId)) {
    return webhookErr(
      WebhookErrorCodes.MISSING_WEEKEND_ID,
      'Missing weekend_id in session metadata',
      'validation',
      'error',
      ctx.paymentContext
    )
  }

  ctx.updateContext({ userId: teamUserId, weekendId })
  logger.info({ teamUserId, weekendId }, 'Processing team payment')

  // Get weekend roster record
  const weekendRosterRecord = await getWeekendRosterRecord(
    teamUserId,
    weekendId
  )
  if (isErr(weekendRosterRecord)) {
    return webhookErr(
      WebhookErrorCodes.WEEKEND_ROSTER_NOT_FOUND,
      weekendRosterRecord.error,
      'database_lookup',
      'error',
      ctx.paymentContext
    )
  }

  const weekendRosterId = weekendRosterRecord.data.id!
  ctx.updateContext({ weekendRosterId })

  logger.info({ teamUserId, weekendRosterId }, 'Found weekend roster record')

  // Record the payment
  const paymentResult = await recordWeekendRosterPayment(
    weekendRosterId,
    session,
    ctx.adminClient
  )
  if (isErr(paymentResult)) {
    return webhookErr(
      WebhookErrorCodes.PAYMENT_RECORD_FAILED,
      paymentResult.error,
      'payment_recording',
      'error',
      ctx.paymentContext
    )
  }

  logger.info(
    { weekendRosterId, paymentId: paymentResult.data.id },
    'Successfully recorded weekend roster payment'
  )

  // Mark team member as paid
  const paidResult = await markTeamMemberAsPaid(
    weekendRosterId,
    ctx.adminClient
  )
  if (isErr(paidResult)) {
    return webhookErr(
      WebhookErrorCodes.STATUS_UPDATE_FAILED,
      paidResult.error,
      'status_update',
      'error',
      ctx.paymentContext
    )
  }

  logger.info({ weekendRosterId }, 'Successfully marked team member as paid')

  // Notify assistant head (don't fail webhook if email fails)
  const paymentAmount = session.amount_total ? session.amount_total / 100 : 0
  const notifyResult = await notifyAssistantHeadForTeamPayment(
    teamUserId,
    weekendId,
    paymentAmount
  )
  if (isErr(notifyResult)) {
    logger.error(
      { teamUserId, weekendId, error: notifyResult.error },
      'Failed to notify assistant head of team payment'
    )
  } else {
    logger.info(
      { teamUserId, weekendId },
      'Successfully notified assistant head of team payment'
    )
  }

  return ok({
    processed: true,
    entityType: 'team_payment',
    entityId: paymentResult.data.id,
    details: {
      userId: teamUserId,
      weekendId,
      weekendRosterId,
      paymentAmount,
    },
  })
}

/**
 * Checks if a candidate is in the awaiting_payment status.
 */
async function candidateIsAwaitingPayment(
  candidateId: string,
  adminClient: WebhookHandlerContext['adminClient']
): Promise<
  ReturnType<typeof ok<true>> | ReturnType<typeof Results.err<string>>
> {
  const { data: candidate, error: fetchError } = await adminClient
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single()

  if (fetchError) {
    return Results.err(fetchError.message)
  }

  if (!candidate) {
    return Results.err(`Candidate not found with id: ${candidateId}`)
  }

  if (candidate.status !== 'awaiting_payment') {
    return Results.err(
      `Candidate not in awaiting_payment status (current: ${candidate.status})`
    )
  }

  return ok(true)
}

/**
 * Records a candidate payment in the candidate_payments table.
 */
async function recordCandidatePayment(
  candidateId: string,
  session: Stripe.Checkout.Session,
  adminClient: WebhookHandlerContext['adminClient']
): Promise<
  | ReturnType<typeof ok<Tables<'candidate_payments'>>>
  | ReturnType<typeof Results.err<string>>
> {
  const paymentIntentId = session.payment_intent as string

  // Fetch fee data from Stripe
  const transactionResult = await getTransactionData(paymentIntentId)
  if (isErr(transactionResult)) {
    logger.warn(
      { candidateId, error: transactionResult.error },
      'Transaction data not available at checkout time - will be backfilled at charge.updated or payout'
    )
  }
  const transaction = Results.unwrapOr(transactionResult, null)

  const { data: paymentRecord, error: paymentRecordError } = await adminClient
    .from('candidate_payments')
    .insert({
      candidate_id: candidateId,
      payment_amount: session.amount_total ? session.amount_total / 100 : null,
      payment_owner: session.metadata?.payment_owner ?? 'unknown',
      payment_intent_id: paymentIntentId,
      payment_method: 'card',
      stripe_fee: transaction?.stripeFee ?? null,
      net_amount: transaction?.netAmount ?? null,
      charge_id: transaction?.chargeId ?? null,
      balance_transaction_id: transaction?.balanceTransactionId ?? null,
    })
    .select()
    .single()

  if (paymentRecordError) {
    return Results.err(paymentRecordError.message)
  }

  if (!paymentRecord) {
    return Results.err('Failed to record payment')
  }

  return ok(paymentRecord)
}

/**
 * Confirms a candidate by updating their status to confirmed.
 */
async function confirmCandidate(
  candidateId: string,
  adminClient: WebhookHandlerContext['adminClient']
): Promise<
  ReturnType<typeof ok<true>> | ReturnType<typeof Results.err<string>>
> {
  const { error: updateError } = await adminClient
    .from('candidates')
    .update({ status: 'confirmed' })
    .eq('id', candidateId)

  if (updateError) {
    return Results.err(
      `Failed to update candidate status to confirmed: ${updateError.message}`
    )
  }

  return ok(true)
}

/**
 * Records a weekend roster payment in the weekend_roster_payments table.
 */
async function recordWeekendRosterPayment(
  weekendRosterRecordId: string,
  session: Stripe.Checkout.Session,
  adminClient: WebhookHandlerContext['adminClient']
): Promise<
  | ReturnType<typeof ok<Tables<'weekend_roster_payments'>>>
  | ReturnType<typeof Results.err<string>>
> {
  const paymentIntentId = session.payment_intent as string

  // Fetch fee data from Stripe
  const transactionResult = await getTransactionData(paymentIntentId)
  if (isErr(transactionResult)) {
    logger.warn(
      { weekendRosterRecordId, error: transactionResult.error },
      'Transaction data not available at checkout time - will be backfilled at charge.updated or payout'
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
        stripe_fee: transaction?.stripeFee ?? null,
        net_amount: transaction?.netAmount ?? null,
        charge_id: transaction?.chargeId ?? null,
        balance_transaction_id: transaction?.balanceTransactionId ?? null,
      })
      .select()
      .single()

  if (paymentRecordError) {
    return Results.err(paymentRecordError.message)
  }

  return ok(weekendRosterPaymentRecord)
}

/**
 * Marks a team member as paid in the weekend_roster table.
 */
async function markTeamMemberAsPaid(
  weekendRosterId: string,
  adminClient: WebhookHandlerContext['adminClient']
): Promise<
  ReturnType<typeof ok<true>> | ReturnType<typeof Results.err<string>>
> {
  const { error: updateError } = await adminClient
    .from('weekend_roster')
    .update({ status: 'paid' })
    .eq('id', weekendRosterId)

  if (updateError) {
    return Results.err(
      `Failed to update weekend_roster record to paid: ${updateError.message}`
    )
  }

  return ok(true)
}
