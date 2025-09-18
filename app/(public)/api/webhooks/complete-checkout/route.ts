import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { Result, ok, err, isErr } from '@/lib/results'
import Stripe from 'stripe'
import { Tables } from '@/database.types'
import { getWeekendRosterRecord } from '@/actions/weekend'
import { notifyAssistantHeadForTeamPayment } from '@/actions/emails'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

if (!webhookSecret) {
  throw new Error('Missing Stripe webhook secret')
}

export async function POST(request: NextRequest) {
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
      logger.error('Webhook signature verification failed:', err)
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
        session.payment_intent,
        '💢 Missing payment intent in session'
      )
      return NextResponse.json(
        { error: 'Missing payment intent' },
        { status: 400 }
      )
    }

    const paymentIntentId = session.payment_intent

    logger.info({ session }, 'Processing completed checkout session')

    const priceId = session.metadata?.price_id

    // Check if this is a candidate payment
    switch (priceId) {
      case process.env.CANDIDATE_FEE_PRICE_ID:
        const candidateId = session.metadata?.candidate_id ?? null
        logger.info(
          `Processing candidate payment for candidate: ${candidateId}`
        )

        const candidateRecordResult = await getCandidateRecord(candidateId)
        if (isErr(candidateRecordResult)) {
          logger.error(
            candidateRecordResult.error,
            '💢 Failed to fetch candidate record'
          )
          return NextResponse.json(
            { error: candidateRecordResult.error },
            { status: 400 }
          )
        }

        const candidate = candidateRecordResult.data

        const candidatePaymentRecordedResult = await candidatePaymentAlreadyRecorded(
          paymentIntentId
        )
        if (isErr(candidatePaymentRecordedResult)) {
          logger.error(
            candidatePaymentRecordedResult.error,
            '💢 Failed to check for existing candidate payment record'
          )
          return NextResponse.json(
            { error: candidatePaymentRecordedResult.error },
            { status: 500 }
          )
        }

        if (!candidatePaymentRecordedResult.data) {
          if (candidate.status !== 'awaiting_payment') {
            const errorMessage = `💢 Candidate ${candidateId} not in awaiting_payment status`
            logger.error(errorMessage)
            return NextResponse.json({ error: errorMessage }, { status: 400 })
          }

          const recordCandidatePaymentResult = await recordCandidatePayment(
            candidate.id,
            session
          )
          if (isErr(recordCandidatePaymentResult)) {
            logger.error(
              recordCandidatePaymentResult.error,
              '💢 Failed to record candidate payment'
            )
            return NextResponse.json(
              { error: recordCandidatePaymentResult.error },
              { status: 400 }
            )
          }

          logger.info(
            `✅ Successfully recorded candidate_payment ${recordCandidatePaymentResult.data.id} for candidate id ${candidateId}`
          )
        }

        if (candidate.status !== 'confirmed') {
          const confirmCandidateResult = await confirmCandidate(candidate.id)
          if (isErr(confirmCandidateResult)) {
            logger.error(
              confirmCandidateResult.error,
              '💢 Failed to confirm candidate'
            )
            return NextResponse.json(
              { error: confirmCandidateResult.error },
              { status: 400 }
            )
          }

          logger.info(`✅ Successfully confirmed candidate ${candidateId}`)
        } else {
          logger.info(`Candidate ${candidateId} already confirmed`)
        }
        break
      case process.env.TEAM_FEE_PRICE_ID:
        const teamUserId = session.metadata?.user_id ?? null
        const weekendId = session.metadata?.weekend_id ?? null
        logger.info(`Processing team payment for team: ${teamUserId}`)

        const teamPaymentRecordedResult = await teamPaymentAlreadyRecorded(
          paymentIntentId
        )
        if (isErr(teamPaymentRecordedResult)) {
          logger.error(
            teamPaymentRecordedResult.error,
            '💢 Failed to check for existing team payment record'
          )
          return NextResponse.json(
            { error: teamPaymentRecordedResult.error },
            { status: 500 }
          )
        }

        const teamPaymentExists = teamPaymentRecordedResult.data

        const weekendRosterRecordResult = teamPaymentExists
          ? await getWeekendRosterRecordAnyStatus(teamUserId, weekendId)
          : await getWeekendRosterRecord(teamUserId, weekendId)

        if (isErr(weekendRosterRecordResult)) {
          logger.error(
            weekendRosterRecordResult.error,
            '💢 Failed to get weekend_roster record'
          )
          return NextResponse.json(
            { error: weekendRosterRecordResult.error },
            { status: 400 }
          )
        }

        const weekendRosterRecord = weekendRosterRecordResult.data

        if (!teamPaymentExists) {
          const weekendRosterPaymentRecord = await recordWeekendRosterPayment(
            weekendRosterRecord.id!,
            session
          )
          if (isErr(weekendRosterPaymentRecord)) {
            logger.error(
              weekendRosterPaymentRecord.error,
              '💢 Failed to record weekend_roster_payment'
            )
            return NextResponse.json(
              { error: weekendRosterPaymentRecord.error },
              { status: 400 }
            )
          }

          logger.info(
            `✅ Successfully recorded weekend_roster_payment ${weekendRosterPaymentRecord.data.id} for weekend_roster_id ${weekendRosterRecord.id}`
          )
        } else {
          logger.info(
            `Team payment already recorded for intent ${paymentIntentId}, skipping insert`
          )
        }

        let shouldNotifyAssistantHead = !teamPaymentExists

        if (weekendRosterRecord.status !== 'paid') {
          const markTeamMemberAsPaidResult = await markTeamMemberAsPaid(
            weekendRosterRecord.id
          )
          if (isErr(markTeamMemberAsPaidResult)) {
            logger.error(
              markTeamMemberAsPaidResult.error,
              '💢 Failed to mark team member as paid'
            )
            return NextResponse.json(
              { error: markTeamMemberAsPaidResult.error },
              { status: 400 }
            )
          }

          logger.info(`✅ Successfully marked team member ${teamUserId} as paid`)
          shouldNotifyAssistantHead = true
        } else {
          logger.info(`Team member ${teamUserId} already marked as paid`)
        }

        if (shouldNotifyAssistantHead) {
          const paymentAmount = session.amount_total ? session.amount_total / 100 : 0

          const notifyAssistantHeadResult = await notifyAssistantHeadForTeamPayment(
            teamUserId,
            weekendId,
            paymentAmount
          )
          if (isErr(notifyAssistantHeadResult)) {
            logger.error(
              notifyAssistantHeadResult.error,
              '💢 Failed to notify assistant head of team payment'
            )
            // Don't return error here as the payment was processed successfully
          } else {
            logger.info(`✅ Successfully notified assistant head of team payment`)
          }
        } else {
          logger.info(
            `Skipping assistant head notification for duplicate payment intent ${paymentIntentId}`
          )
        }
        break
      default:
        const errorMessage = `Unknown price id: ${priceId}`
        logger.error(`💢 Error during webhook processing: ${errorMessage}`)
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        )
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('💢 Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Fetches a candidate record for payment processing
 */
async function getCandidateRecord(
  candidateId: string | null
): Promise<Result<string, Tables<'candidates'>>> {
  if (!candidateId) {
    return err('💢 Candidate ID is null')
  }

  const supabase = await createClient()

  const { data: candidate, error: fetchError } = await supabase
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

  return ok(candidate)
}

async function candidatePaymentAlreadyRecorded(
  paymentIntentId: string
): Promise<Result<string, boolean>> {
  const supabase = await createClient()

  const { data: paymentRecords, error } = await supabase
    .from('candidate_payments')
    .select('id')
    .eq('payment_intent_id', paymentIntentId)
    .limit(1)

  if (error) {
    return err(error.message)
  }

  return ok(!!paymentRecords && paymentRecords.length > 0)
}

/**
 * Records a candidate payment in the candidate_payments table
 */
async function recordCandidatePayment(
  candidateId: string,
  session: Stripe.Checkout.Session
): Promise<Result<string, Tables<'candidate_payments'>>> {
  const supabase = await createClient()

  const { data: paymentRecord, error: paymentRecordError } = await supabase
    .from('candidate_payments')
    .insert({
      candidate_id: candidateId,
      payment_amount: session.amount_total ? session.amount_total / 100 : null, // Convert from cents
      payment_owner: session.metadata?.payment_owner ?? 'unknown',
      payment_intent_id: session.payment_intent as string, // This type assertion is safe because we check payment_intent in the webhook route
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
  const supabase = await createClient()

  // Update candidate status to confirmed
  const { error: updateError } = await supabase
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
  const supabase = await createClient()

  const { data: weekendRosterPaymentRecord, error: paymentRecordError } =
    await supabase
      .from('weekend_roster_payments')
      .insert({
        weekend_roster_id: weekendRosterRecordId,
        payment_amount: session.amount_total
          ? session.amount_total / 100
          : null,
        payment_intent_id: session.payment_intent as string,
      })
      .select()
      .single()

  if (paymentRecordError) {
    return err(paymentRecordError.message)
  }

  return ok(weekendRosterPaymentRecord)
}

async function teamPaymentAlreadyRecorded(
  paymentIntentId: string
): Promise<Result<string, boolean>> {
  const supabase = await createClient()

  const { data: paymentRecords, error } = await supabase
    .from('weekend_roster_payments')
    .select('id')
    .eq('payment_intent_id', paymentIntentId)
    .limit(1)

  if (error) {
    return err(error.message)
  }

  return ok(!!paymentRecords && paymentRecords.length > 0)
}

async function getWeekendRosterRecordAnyStatus(
  teamUserId: string | null,
  weekendId: string | null
): Promise<Result<string, Tables<'weekend_roster'>>> {
  if (!teamUserId || !weekendId) {
    return err('💢 Team user ID or weekend ID is null')
  }

  const supabase = await createClient()

  const { data: weekendRosterRecord, error: fetchError } = await supabase
    .from('weekend_roster')
    .select('*')
    .eq('user_id', teamUserId)
    .eq('weekend_id', weekendId)
    .single()

  if (fetchError) {
    return err(fetchError.message)
  }

  if (!weekendRosterRecord) {
    return err('💢 Weekend roster record not found')
  }

  return ok(weekendRosterRecord)
}

async function markTeamMemberAsPaid(
  weekendRosterId: string
): Promise<Result<string, true>> {
  const supabase = await createClient()

  const { error: updateError } = await supabase
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
