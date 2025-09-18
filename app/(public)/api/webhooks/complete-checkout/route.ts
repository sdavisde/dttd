import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { Result, ok, err, isErr } from '@/lib/results'
import Stripe from 'stripe'
import { Tables } from '@/database.types'
import { getWeekendRosterRecord } from '@/actions/weekend'
import { notifyAssistantHeadForTeamPayment } from '@/actions/emails'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>
type PaymentProcessingResult = Result<string, true>

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

    console.log(`Processing completed checkout session:`, session)

    const priceId = session.metadata?.price_id
    const supabase = await createClient()

    switch (priceId) {
      case process.env.CANDIDATE_FEE_PRICE_ID: {
        const candidateResult = await processCandidatePayment(supabase, session)
        if (isErr(candidateResult)) {
          return NextResponse.json(
            { error: candidateResult.error },
            { status: 400 }
          )
        }
        break
      }
      case process.env.TEAM_FEE_PRICE_ID: {
        const teamResult = await processTeamPayment(supabase, session)
        if (isErr(teamResult)) {
          return NextResponse.json({ error: teamResult.error }, { status: 400 })
        }
        break
      }
      default:
        logger.error(
          `💢 Error during webhook processing: Unknown price id: ${priceId}`
        )
        break
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

async function processCandidatePayment(
  supabase: SupabaseServerClient,
  session: Stripe.Checkout.Session
): Promise<PaymentProcessingResult> {
  const candidateId = session.metadata?.candidate_id ?? null

  logger.info(`Processing candidate payment for candidate: ${candidateId}`)

  if (!candidateId) {
    logger.error('💢 Candidate ID is null for checkout session')
    return err('💢 Candidate ID is null')
  }

  const candidateIsAwaitingPaymentResult = await candidateIsAwaitingPayment(
    supabase,
    candidateId
  )
  if (isErr(candidateIsAwaitingPaymentResult)) {
    logger.error(
      candidateIsAwaitingPaymentResult.error,
      '💢 Candidate is not awaiting payment'
    )
    return err(candidateIsAwaitingPaymentResult.error)
  }

  logger.info(
    `✅ Found candidate tied to payment and eligible for processing`
  )

  const recordCandidatePaymentResult = await recordCandidatePayment(
    supabase,
    candidateId,
    session
  )
  if (isErr(recordCandidatePaymentResult)) {
    logger.error(
      recordCandidatePaymentResult.error,
      '💢 Failed to record candidate payment'
    )
    return err(recordCandidatePaymentResult.error)
  }

  const candidatePaymentRecord = recordCandidatePaymentResult.data
  if (candidatePaymentRecord.created) {
    logger.info(
      `✅ Successfully recorded candidate_payment ${candidatePaymentRecord.record.id} for candidate id ${candidateId}`
    )
  } else {
    logger.info(
      `🔁 Candidate payment for intent ${session.payment_intent} already recorded`
    )
  }

  const confirmCandidateResult = await confirmCandidate(supabase, candidateId)
  if (isErr(confirmCandidateResult)) {
    logger.error(
      confirmCandidateResult.error,
      '💢 Failed to confirm candidate'
    )
    return err(confirmCandidateResult.error)
  }

  logger.info(`✅ Successfully confirmed candidate ${candidateId}`)

  return ok(true)
}

async function processTeamPayment(
  supabase: SupabaseServerClient,
  session: Stripe.Checkout.Session
): Promise<PaymentProcessingResult> {
  const teamUserId = session.metadata?.user_id ?? null
  const weekendId = session.metadata?.weekend_id ?? null

  logger.info(`Processing team payment for team: ${teamUserId}`)

  if (!teamUserId || !weekendId) {
    logger.error(
      JSON.stringify({ teamUserId, weekendId }),
      '💢 Missing team payment metadata'
    )
    return err('💢 Missing team payment metadata')
  }

  const weekendRosterRecord = await getWeekendRosterRecord(teamUserId, weekendId)
  if (isErr(weekendRosterRecord)) {
    logger.error(
      weekendRosterRecord.error,
      '💢 Failed to get weekend_roster record'
    )
    return err(weekendRosterRecord.error)
  }

  logger.info(
    `✅ Found weekend_roster record for team member: ${teamUserId}`
  )

  const weekendRosterPaymentRecordResult = await recordWeekendRosterPayment(
    supabase,
    weekendRosterRecord.data.id!,
    session
  )
  if (isErr(weekendRosterPaymentRecordResult)) {
    logger.error(
      weekendRosterPaymentRecordResult.error,
      '💢 Failed to record weekend_roster_payment'
    )
    return err(weekendRosterPaymentRecordResult.error)
  }

  const weekendRosterPaymentRecord = weekendRosterPaymentRecordResult.data
  if (weekendRosterPaymentRecord.created) {
    logger.info(
      `✅ Successfully recorded weekend_roster_payment ${weekendRosterPaymentRecord.record.id} for weekend_roster_id ${weekendRosterRecord.data.id}`
    )
  } else {
    logger.info(
      `🔁 Weekend roster payment for intent ${session.payment_intent} already recorded`
    )
  }

  if (weekendRosterRecord.data.status !== 'paid') {
    const markTeamMemberAsPaidResult = await markTeamMemberAsPaid(
      supabase,
      weekendRosterRecord.data.id
    )
    if (isErr(markTeamMemberAsPaidResult)) {
      logger.error(
        markTeamMemberAsPaidResult.error,
        '💢 Failed to mark team member as paid'
      )
      return err(markTeamMemberAsPaidResult.error)
    }

    logger.info(`✅ Successfully marked team member as paid`)
  } else {
    logger.info(
      `🔁 Weekend roster already marked as paid for roster id ${weekendRosterRecord.data.id}`
    )
  }

  const paymentAmount = toDollarAmount(session.amount_total) ?? 0

  if (weekendRosterPaymentRecord.created) {
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
      // The payment was processed successfully, so we don't return an error here
    } else {
      logger.info(`✅ Successfully notified assistant head of team payment`)
    }
  } else {
    logger.info(
      `🔁 Skipping assistant head notification; payment already processed`
    )
  }

  return ok(true)
}

/**
 * Checks if a candidate is in the awaiting_payment status
 */
async function candidateIsAwaitingPayment(
  supabase: SupabaseServerClient,
  candidateId: string | null
): Promise<Result<string, true>> {
  if (!candidateId) {
    return err('💢 Candidate ID is null')
  }

  // Verify the candidate exists and is in awaiting_payment status
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

  if (candidate.status === 'confirmed') {
    logger.info(
      `🔁 Candidate ${candidateId} already confirmed; treating webhook as idempotent`
    )
    return ok(true)
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
  supabase: SupabaseServerClient,
  candidateId: string,
  session: Stripe.Checkout.Session
): Promise<
  Result<
    string,
    {
      record: Tables<'candidate_payments'>
      created: boolean
    }
  >
> {
  const paymentIntentId = session.payment_intent as string

  const { data: existingPayment, error: existingPaymentError } = await supabase
    .from('candidate_payments')
    .select('*')
    .eq('payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (existingPaymentError) {
    return err(existingPaymentError.message)
  }

  if (existingPayment) {
    return ok({ record: existingPayment, created: false })
  }

  const { data: paymentRecord, error: paymentRecordError } = await supabase
    .from('candidate_payments')
    .insert({
      candidate_id: candidateId,
      payment_amount: toDollarAmount(session.amount_total),
      payment_owner: session.metadata?.payment_owner ?? 'unknown',
      payment_intent_id: session.payment_intent as string, // This type assertion is safe because we check payment_intent in the webhook route
    })
    .select()
    .single()

  if (paymentRecordError) {
    if (paymentRecordError.code === '23505') {
      logger.info(
        `🔁 Candidate payment for intent ${paymentIntentId} already exists (unique constraint)`
      )
      const { data: duplicatePayment, error: duplicateFetchError } = await supabase
        .from('candidate_payments')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .maybeSingle()

      if (duplicateFetchError) {
        return err(duplicateFetchError.message)
      }

      if (duplicatePayment) {
        return ok({ record: duplicatePayment, created: false })
      }

      return err('💢 Payment already exists but could not be retrieved')
    }
    return err(paymentRecordError.message)
  }

  if (!paymentRecord) {
    return err('💢 Failed to record payment')
  }

  return ok({ record: paymentRecord, created: true })
}

/**
 * Confirms a candidate by updating their status to confirmed
 */
async function confirmCandidate(
  supabase: SupabaseServerClient,
  candidateId: string
): Promise<Result<string, true>> {
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
  supabase: SupabaseServerClient,
  weekendRosterRecordId: string,
  session: Stripe.Checkout.Session
): Promise<
  Result<
    string,
    {
      record: Tables<'weekend_roster_payments'>
      created: boolean
    }
  >
> {
  const paymentIntentId = session.payment_intent as string

  const { data: existingPayment, error: existingPaymentError } = await supabase
    .from('weekend_roster_payments')
    .select('*')
    .eq('payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (existingPaymentError) {
    return err(existingPaymentError.message)
  }

  if (existingPayment) {
    return ok({ record: existingPayment, created: false })
  }

  const { data: weekendRosterPaymentRecord, error: paymentRecordError } =
    await supabase
      .from('weekend_roster_payments')
      .insert({
        weekend_roster_id: weekendRosterRecordId,
        payment_amount: toDollarAmount(session.amount_total),
        payment_intent_id: session.payment_intent as string,
      })
      .select()
      .single()

  if (paymentRecordError) {
    if (paymentRecordError.code === '23505') {
      logger.info(
        `🔁 Weekend roster payment for intent ${paymentIntentId} already exists (unique constraint)`
      )
      const { data: duplicatePayment, error: duplicateFetchError } = await supabase
        .from('weekend_roster_payments')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .maybeSingle()

      if (duplicateFetchError) {
        return err(duplicateFetchError.message)
      }

      if (duplicatePayment) {
        return ok({ record: duplicatePayment, created: false })
      }

      return err('💢 Weekend roster payment already exists but could not be retrieved')
    }
    return err(paymentRecordError.message)
  }

  return ok({ record: weekendRosterPaymentRecord, created: true })
}

async function markTeamMemberAsPaid(
  supabase: SupabaseServerClient,
  weekendRosterId: string
): Promise<Result<string, true>> {
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

function toDollarAmount(amount: number | null | undefined): number | null {
  if (typeof amount !== 'number') {
    return null
  }

  return amount / 100
}
