import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

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

    logger.info('Received webhook event:', { type: event.type, id: event.id })

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      logger.info(`Processing completed checkout session: ${session.id}`)

      // Check if this is a candidate payment
      if (session.metadata?.candidate_id) {
        const candidateId = session.metadata.candidate_id

        logger.info(`Processing candidate payment for candidate: ${candidateId}`)

        const supabase = await createClient()

        // Verify the candidate exists and is in awaiting_payment status
        const { data: candidate, error: fetchError } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', candidateId)
          .single()

        if (fetchError || !candidate || candidate.status !== 'awaiting_payment') {
          logger.error('Candidate not found or not in awaiting_payment status:')
          logger.error({
            candidateId,
            error: fetchError,
          })
          return NextResponse.json({ error: 'Candidate not found or invalid status' }, { status: 400 })
        }

        // Record payment in candidate_payments table first
        const { data: paymentRecord, error: paymentRecordError } = await supabase.from('candidate_payments').insert({
          candidate_id: candidateId,
          payment_amount: session.amount_total ? session.amount_total / 100 : null, // Convert from cents
          payment_owner: session.metadata.payment_owner || 'candidate',
        })

        if (paymentRecordError || !paymentRecord) {
          logger.error('Failed to record payment:', paymentRecordError)
          return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
        }

        logger.info(`Successfully recorded payment for candidate: ${candidateId}`, {
          paymentRecord,
        })

        // Update candidate status to confirmed
        const { data: updatedCandidate, error: updateError } = await supabase
          .from('candidates')
          .update({ status: 'confirmed' })
          .eq('id', candidateId)

        if (updateError || !updatedCandidate) {
          logger.error('Failed to update candidate status:', updateError)
          return NextResponse.json({ error: 'Failed to update candidate status' }, { status: 500 })
        }

        logger.info(`Successfully updated candidate status to confirmed: ${candidateId}`, {
          updatedCandidate,
        })
      } else {
        logger.info('Checkout completed but no candidate_id in metadata')
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
