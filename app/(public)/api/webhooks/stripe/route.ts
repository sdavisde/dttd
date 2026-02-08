import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { logger } from '@/lib/logger'
import { isErr } from '@/lib/results'
import Stripe from 'stripe'
import { isNil } from 'lodash'
import {
  routeWebhookEvent,
  WebhookErrorCodes,
} from '@/services/stripe/handlers'
import {
  withWebhookScope,
  reportWebhookError,
  logWebhookSuccess,
} from '@/services/stripe/webhook-context'

/**
 * Unified Stripe webhook endpoint.
 *
 * Handles all Stripe events through a modular handler architecture.
 * Currently supports:
 * - checkout.session.completed - Payment completion for candidates and team members
 * - charge.updated - Fee data backfill (within ~1 hour of payment)
 * - payout.paid - Deposit tracking and fee backfill
 *
 * Events are routed to the appropriate handler based on event type.
 * Unsupported events are acknowledged (200) but not processed.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (isNil(webhookSecret)) {
    logger.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (isNil(signature)) {
      logger.error('Missing Stripe signature in webhook request')
      return NextResponse.json(
        {
          error: 'Missing signature',
          code: WebhookErrorCodes.MISSING_SIGNATURE,
        },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      logger.error(err, 'Webhook signature verification failed')
      return NextResponse.json(
        {
          error: 'Invalid signature',
          code: WebhookErrorCodes.INVALID_SIGNATURE,
        },
        { status: 400 }
      )
    }

    // Create initial payment context for Sentry
    const paymentContext = {
      eventId: event.id,
      eventType: event.type,
    }

    // Process event within Sentry scope
    const result = await withWebhookScope(paymentContext, () =>
      routeWebhookEvent(event)
    )

    if (isErr(result)) {
      const error = result.error

      // Report to Sentry
      reportWebhookError(error)

      // Determine HTTP status based on severity
      // - warning/error: Return 400 so Stripe retries
      // - fatal: Return 400 so Stripe retries
      const status = error.severity === 'warning' ? 200 : 400

      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          stage: error.stage,
        },
        { status }
      )
    }

    // Log success
    logWebhookSuccess(result.data, paymentContext)

    return NextResponse.json({
      received: true,
      processed: result.data.processed,
      entityType: result.data.entityType,
      entityId: result.data.entityId,
    })
  } catch (error) {
    logger.error(error, 'Webhook processing error')
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        code: WebhookErrorCodes.PROCESSING_ERROR,
      },
      { status: 500 }
    )
  }
}
