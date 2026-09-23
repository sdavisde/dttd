import 'server-only'

import { isNil } from 'lodash'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/results'
import { err, ok } from '@/lib/results'
import type { Tables } from '@/database.types'

export async function getContactInformation(
  contactId: string
): Promise<Result<string, Tables<'contact_information'>>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contact_information')
    .select('*')
    .eq('id', contactId)
    .single()

  if (!isNil(error)) {
    return err(`Failed to fetch contact information: ${error.message}`)
  }

  if (isNil(data)) {
    return err(`Contact information not found for id: ${contactId}`)
  }

  return ok(data)
}

/**
 * Admin version for use in webhook contexts where there is no user session.
 * Bypasses RLS policies.
 */
export async function getContactInformationAdmin(
  contactId: string
): Promise<Result<string, Tables<'contact_information'>>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('contact_information')
    .select('*')
    .eq('id', contactId)
    .single()

  if (!isNil(error)) {
    return err(`Failed to fetch contact information: ${error.message}`)
  }

  if (isNil(data)) {
    return err(`Contact information not found for id: ${contactId}`)
  }

  return ok(data)
}

export type EmailLogEntry = {
  template: string
  subject: string
  recipients: string[]
  status: 'sent' | 'failed'
  resendMessageId: string | null
  errorSummary: string | null
  sentByUserId: string | null
}

/**
 * Records an email send attempt.
 *
 * Uses the admin client on purpose: sends originate from anonymous public
 * forms and from Stripe webhooks as well as from logged-in sessions, and
 * `email_log` grants no INSERT to anon or authenticated.
 */
export async function insertEmailLog(
  entry: EmailLogEntry
): Promise<Result<string, true>> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('email_log').insert({
    template: entry.template,
    subject: entry.subject,
    recipients: entry.recipients,
    recipient_count: entry.recipients.length,
    status: entry.status,
    resend_message_id: entry.resendMessageId,
    error_summary: entry.errorSummary,
    sent_by_user_id: entry.sentByUserId,
  })

  if (!isNil(error)) {
    return err(`Failed to insert email log entry: ${error.message}`)
  }

  return ok(true)
}

/**
 * Counts successfully sent emails within a date range. Reads through the
 * caller's client, so the admin-only RLS read policy still applies.
 */
export async function countSentEmailsBetween(
  start: Date,
  end: Date
): Promise<Result<string, number>> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('email_log')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  if (!isNil(error)) {
    return err(`Failed to count sent emails: ${error.message}`)
  }

  return ok(count ?? 0)
}

export async function updateContactInformation(
  contactId: string,
  emailAddress: string
): Promise<Result<string, Tables<'contact_information'>>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contact_information')
    .update({ email_address: emailAddress })
    .eq('id', contactId)
    .select()
    .single()

  if (!isNil(error)) {
    return err(`Failed to update contact information: ${error.message}`)
  }

  if (isNil(data)) {
    return err(`Contact information not found for id: ${contactId}`)
  }

  return ok(data)
}
