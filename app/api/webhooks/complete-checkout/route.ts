import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { Result, ok, err, isErr } from '@/lib/results'
import Stripe from 'stripe'
import { Tables } from '@/database.types'

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

    console.log('Received webhook event:', event)

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const checkoutCompletedEvent = event as Stripe.CheckoutSessionCompletedEvent
      const session = checkoutCompletedEvent.data.object

      console.log(`Processing completed checkout session:`, session)

      const priceId = session.metadata?.price_id

      // Check if this is a candidate payment
      switch (priceId) {
        case process.env.CANDIDATE_FEE_PRICE_ID:
          const candidateId = session.metadata?.candidate_id ?? null
          logger.info(`Processing candidate payment for candidate: ${candidateId}`)

          const candidateIsAwaitingPaymentResult = await candidateIsAwaitingPayment(candidateId)
          if (isErr(candidateIsAwaitingPaymentResult)) {
            logger.error(candidateIsAwaitingPaymentResult.error)
            return NextResponse.json({ error: candidateIsAwaitingPaymentResult.error }, { status: 400 })
          }

          logger.info(`✅ Found candidate tied to payment, and they are awaiting payment`)

          // This non-null assertion is safe because we check for id existance in the function above
          const recordCandidatePaymentResult = await recordCandidatePayment(candidateId!, session)
          if (isErr(recordCandidatePaymentResult)) {
            logger.error(recordCandidatePaymentResult.error)
            return NextResponse.json({ error: recordCandidatePaymentResult.error }, { status: 400 })
          }

          logger.info(
            `✅ Successfully recorded candidate_payment ${recordCandidatePaymentResult.data.id} for candidate id ${candidateId}`
          )

          const confirmCandidateResult = await confirmCandidate(candidateId!)
          if (isErr(confirmCandidateResult)) {
            logger.error(confirmCandidateResult.error)
            return NextResponse.json({ error: confirmCandidateResult.error }, { status: 400 })
          }

          logger.info(`✅ Successfully confirmed candidate ${candidateId}`)
          break
        case process.env.TEAM_FEE_PRICE_ID:
          const teamUserId = session.metadata?.user_id
          logger.info(`Processing team payment for team: ${teamUserId}`)

          // const teamIsAwaitingPayment = await teamIsAwaitingPayment(teamUserId)
          // if (isErr(teamIsAwaitingPayment)) {
          //   logger.error(teamIsAwaitingPayment.error)
          //   return NextResponse.json({ error: teamIsAwaitingPayment.error }, { status: 400 })
          // }

          break
        default:
          logger.error(`Unknown price id: ${priceId}`)
          break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

/**
 * Checks if a candidate is in the awaiting_payment status
 */
async function candidateIsAwaitingPayment(candidateId: string | null): Promise<Result<string, true>> {
  if (!candidateId) {
    return err('💢 Candidate ID is null')
  }

  const supabase = await createClient()

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
  const supabase = await createClient()

  const { data: paymentRecord, error: paymentRecordError } = await supabase
    .from('candidate_payments')
    .insert({
      candidate_id: candidateId,
      payment_amount: session.amount_total ? session.amount_total / 100 : null, // Convert from cents
      payment_owner: session.metadata?.payment_owner ?? 'unknown',
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
async function confirmCandidate(candidateId: string): Promise<Result<string, true>> {
  const supabase = await createClient()

  // Update candidate status to confirmed
  const { error: updateError } = await supabase.from('candidates').update({ status: 'confirmed' }).eq('id', candidateId)

  if (updateError) {
    return err(`💢 Failed to update candidate status to confirmed: ${updateError.message}`)
  }

  return ok(true)
}
