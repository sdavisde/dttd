import 'server-only'

import { isNil } from 'lodash'
import type { CreateEmailOptions, CreateEmailResponseSuccess } from 'resend'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/results'
import { err, isErr, ok } from '@/lib/results'
import { logger } from '@/lib/logger'
import * as NotificationRepository from './repository'

export const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Short identifier for which email a log row belongs to. Kept as a union so a
 * typo can't quietly create a new "template" in the usage metrics.
 */
export type EmailTemplate =
  | 'candidate-forms'
  | 'candidate-forms-completed'
  | 'candidate-payment-completed'
  | 'email-change-notification'
  | 'payment-request'
  | 'sponsorship-notification'
  | 'team-payment-notification'

/**
 * Sends an email through Resend and records the attempt in `email_log`.
 *
 * Returns the Resend success payload, or the Resend error message. Logging is
 * strictly best-effort: a failure to write the log row is pino-logged and
 * swallowed so it can never block or fail an email.
 *
 * Exceptions thrown by Resend itself are logged and then rethrown, so callers'
 * existing try/catch handling is unchanged.
 */
export async function sendEmail(
  template: EmailTemplate,
  options: CreateEmailOptions
): Promise<Result<string, CreateEmailResponseSuccess | null>> {
  let response

  try {
    response = await resend.emails.send(options)
  } catch (error) {
    await recordSendAttempt(template, options, {
      status: 'failed',
      resendMessageId: null,
      errorSummary: error instanceof Error ? error.message : String(error),
    })
    throw error
  }

  const { data, error } = response

  if (!isNil(error)) {
    await recordSendAttempt(template, options, {
      status: 'failed',
      resendMessageId: null,
      errorSummary: error.message,
    })
    return err(error.message)
  }

  await recordSendAttempt(template, options, {
    status: 'sent',
    resendMessageId: data?.id ?? null,
    errorSummary: null,
  })

  return ok(data)
}

type SendOutcome = {
  status: 'sent' | 'failed'
  resendMessageId: string | null
  errorSummary: string | null
}

/**
 * Writes an `email_log` row. Never throws -- every failure path is pino-logged
 * and swallowed, because the email has already been handed to Resend by the
 * time this runs and losing the audit row must not surface to the user.
 */
async function recordSendAttempt(
  template: EmailTemplate,
  options: CreateEmailOptions,
  outcome: SendOutcome
): Promise<void> {
  try {
    const result = await NotificationRepository.insertEmailLog({
      template,
      subject: options.subject ?? '',
      recipients: toRecipientList(options.to),
      status: outcome.status,
      resendMessageId: outcome.resendMessageId,
      errorSummary: outcome.errorSummary,
      sentByUserId: await resolveTriggeringUserId(),
    })

    if (isErr(result)) {
      logger.error(`Failed to record email log entry: ${result.error}`)
    }
  } catch (error) {
    logger.error(error, `Failed to record email log entry for ${template}`)
  }
}

function toRecipientList(to: CreateEmailOptions['to']): string[] {
  if (isNil(to)) {
    return []
  }

  return Array.isArray(to) ? to : [to]
}

/**
 * Best-effort lookup of the session that triggered the send. Webhook and
 * anonymous public-form sends legitimately have no user, and `cookies()` is
 * unavailable in some server contexts, so any problem here resolves to null.
 */
async function resolveTriggeringUserId(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user?.id ?? null
  } catch {
    return null
  }
}
