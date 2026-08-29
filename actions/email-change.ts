'use server'

import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/results'
import { err, ok } from '@/lib/results'
import { isNil } from 'lodash'
import { logger } from '@/lib/logger'
import { getUrl } from '@/lib/url'
import EmailChangeNotificationEmail from '@/components/email/EmailChangeNotificationEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Requests a change of the logged-in user's email address.
 *
 * The user must re-authenticate with their current password. Supabase then
 * stages the change and sends a confirmation link to the new address; the
 * change takes effect once that link is clicked (/auth/confirm). The current
 * address receives a courtesy notification so an unauthorized change can be
 * caught.
 */
export async function requestEmailChange(
  newEmail: string,
  currentPassword: string
): Promise<Result<string, void>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (isNil(user) || isNil(user.email)) {
      return err('You must be logged in to change your email.')
    }

    logger.info(`Starting email change request for user ${user.id}`)

    if (user.email.toLowerCase() === newEmail.toLowerCase()) {
      return err('This is already the email on your account.')
    }

    // Re-authenticate with the current password before allowing the change.
    // Uses a throwaway non-persisting client so the check cannot touch the
    // caller's session cookies.
    const authCheckClient = createSupabaseJsClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
    const { error: passwordError } =
      await authCheckClient.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

    if (!isNil(passwordError)) {
      logger.warn(
        `Email change re-authentication failed for user ${user.id}: ${passwordError.message}`
      )
      return err('The current password you entered is incorrect.')
    }

    const { error: updateError } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: `${getUrl('/auth/confirm')}?next=/profile` }
    )

    if (!isNil(updateError)) {
      if (updateError.code === 'email_exists') {
        return err('An account with that email address already exists.')
      }
      if (updateError.code === 'over_email_send_rate_limit') {
        return err(
          'Too many emails have been sent recently. Please wait a while and try again.'
        )
      }
      logger.error(`Email change request failed: ${updateError.message}`)
      return err(
        'Unable to request an email change right now. Please try again later.'
      )
    }

    // Courtesy notification to the current address. Non-fatal: the change
    // itself has been staged successfully.
    const { error: notifyError } = await resend.emails.send({
      from: 'Dusty Trails Tres Dias <noreply@dustytrailstresdias.org>',
      to: [user.email],
      subject: 'Your account email is being changed',
      react: EmailChangeNotificationEmail({
        oldEmail: user.email,
        newEmail,
      }),
    })
    if (!isNil(notifyError)) {
      logger.error(
        notifyError,
        `Failed to send email change notification to previous address for user ${user.id}`
      )
    }

    logger.info(`Email change confirmation initiated for user ${user.id}`)
    return ok(undefined)
  } catch (error) {
    logger.error(
      `Error while requesting email change: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
    return err(
      'Unable to request an email change right now. Please try again later.'
    )
  }
}
