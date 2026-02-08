import 'server-only'

import * as Sentry from '@sentry/nextjs'
import { err, Result } from '@/lib/results'
import { logger } from '@/lib/logger'
import {
  WebhookError,
  WebhookPaymentContext,
  ProcessingStage,
  WebhookErrorCode,
  HandlerSuccess,
  WebhookHandlerContext,
} from './handlers/types'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Creates a structured WebhookError with consistent formatting.
 */
export function createWebhookError(
  code: WebhookErrorCode,
  message: string,
  stage: ProcessingStage,
  severity: 'warning' | 'error' | 'fatal',
  context: Partial<WebhookPaymentContext>,
  cause?: unknown
): WebhookError {
  return {
    message,
    code,
    stage,
    severity,
    context,
    cause,
  }
}

/**
 * Creates an error Result with a WebhookError.
 */
export function webhookErr(
  code: WebhookErrorCode,
  message: string,
  stage: ProcessingStage,
  severity: 'warning' | 'error' | 'fatal',
  context: Partial<WebhookPaymentContext>,
  cause?: unknown
): Result<WebhookError, never> {
  return err(createWebhookError(code, message, stage, severity, context, cause))
}

/**
 * Wraps a webhook handler execution with an isolated Sentry scope.
 * Sets tags and context for payment tracking.
 */
export async function withWebhookScope<T>(
  paymentContext: WebhookPaymentContext,
  handler: () => Promise<Result<WebhookError, T>>
): Promise<Result<WebhookError, T>> {
  return Sentry.withScope(async (scope) => {
    // Set tags for filtering in Sentry
    scope.setTag('webhook.event_type', paymentContext.eventType)
    scope.setTag('webhook.event_id', paymentContext.eventId)

    if (paymentContext.paymentIntentId) {
      scope.setTag('payment_intent_id', paymentContext.paymentIntentId)
    }
    if (paymentContext.candidateId) {
      scope.setTag('candidate_id', paymentContext.candidateId)
    }
    if (paymentContext.userId) {
      scope.setTag('user_id', paymentContext.userId)
    }
    if (paymentContext.weekendId) {
      scope.setTag('weekend_id', paymentContext.weekendId)
    }

    // Set context for detailed information
    scope.setContext('payment', {
      eventId: paymentContext.eventId,
      eventType: paymentContext.eventType,
      paymentIntentId: paymentContext.paymentIntentId,
      chargeId: paymentContext.chargeId,
      candidateId: paymentContext.candidateId,
      userId: paymentContext.userId,
      weekendId: paymentContext.weekendId,
      weekendRosterId: paymentContext.weekendRosterId,
      amount: paymentContext.amount,
    })

    try {
      const result = await handler()
      return result
    } catch (error) {
      // Capture unexpected errors
      Sentry.captureException(error, {
        extra: { paymentContext },
      })
      throw error
    }
  })
}

/**
 * Reports a webhook error to Sentry with full context.
 */
export function reportWebhookError(error: WebhookError): void {
  Sentry.withScope((scope) => {
    // Set tags
    scope.setTag('webhook.error_code', error.code)
    scope.setTag('webhook.stage', error.stage)
    scope.setTag('webhook.severity', error.severity)

    if (error.context.eventType) {
      scope.setTag('webhook.event_type', error.context.eventType)
    }
    if (error.context.paymentIntentId) {
      scope.setTag('payment_intent_id', error.context.paymentIntentId)
    }
    if (error.context.candidateId) {
      scope.setTag('candidate_id', error.context.candidateId)
    }

    // Set context
    scope.setContext('webhook_error', {
      code: error.code,
      stage: error.stage,
      severity: error.severity,
      message: error.message,
    })
    scope.setContext('payment', error.context)

    // Set level based on severity
    switch (error.severity) {
      case 'warning':
        scope.setLevel('warning')
        break
      case 'error':
        scope.setLevel('error')
        break
      case 'fatal':
        scope.setLevel('fatal')
        break
    }

    // Capture the error
    if (error.cause instanceof Error) {
      Sentry.captureException(error.cause, {
        extra: { webhookError: error },
      })
    } else {
      Sentry.captureMessage(error.message, {
        extra: { webhookError: error },
      })
    }
  })

  // Also log to Pino
  logger.error(
    {
      code: error.code,
      stage: error.stage,
      severity: error.severity,
      context: error.context,
      cause: error.cause,
    },
    error.message
  )
}

/**
 * Creates a WebhookHandlerContext for use in handlers.
 */
export function createHandlerContext(
  paymentContext: WebhookPaymentContext
): WebhookHandlerContext {
  return {
    adminClient: createAdminClient(),
    paymentContext,
    updateContext: (updates) => {
      Object.assign(paymentContext, updates)
    },
  }
}

/**
 * Logs successful webhook processing.
 */
export function logWebhookSuccess(
  success: HandlerSuccess,
  context: WebhookPaymentContext
): void {
  logger.info(
    {
      eventId: context.eventId,
      eventType: context.eventType,
      processed: success.processed,
      entityType: success.entityType,
      entityId: success.entityId,
      details: success.details,
    },
    `Webhook processed successfully: ${context.eventType}`
  )
}
