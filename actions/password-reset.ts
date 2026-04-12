'use server'

import { createClient } from '@/lib/supabase/server'
import type { Result } from '@/lib/results'
import { err, ok } from '@/lib/results'
import { isNil } from 'lodash'
import { logger } from '@/lib/logger'
import type { CreateEmailResponseSuccess } from 'resend'
import { Resend } from 'resend'
import PasswordResetEmail from '@/components/email/PasswordResetEmail'
import { getUrl } from '@/lib/url'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sends a password reset email to the specified email address
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<Result<string, { data: CreateEmailResponseSuccess | null }>> {
  try {
    logger.info(`Starting password reset request for email: ${email}`)

    const supabase = await createClient()

    // Generate password reset link using Supabase Auth
    // Route through /auth/callback for PKCE code exchange, then forward to /reset-password
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${getUrl('/auth/callback')}?next=/reset-password`,
      }
    )

    if (!isNil(resetError)) {
      return err(`Failed to send reset email: ${resetError.message}`)
    }

    logger.info(`Password reset email initiated successfully for ${email}`)
    return ok({ data: null })
  } catch (error) {
    return err(
      `Error while sending password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Alternative function to send custom password reset email using Resend
 * This gives us more control over the email template and branding
 */
export async function sendCustomPasswordResetEmail(
  email: string
): Promise<Result<string, { data: CreateEmailResponseSuccess | null }>> {
  try {
    logger.info(`Starting custom password reset request for email: ${email}`)

    const supabase = await createClient()

    // No user existence check needed -- Supabase's resetPasswordForEmail
    // already handles non-existent emails silently (no error, no email sent),
    // which is the correct behavior to prevent email enumeration.

    // Generate password reset link using Supabase Auth
    // Route through /auth/callback for PKCE code exchange, then forward to /reset-password
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${getUrl('/auth/callback')}?next=/reset-password`,
      }
    )

    if (!isNil(resetError)) {
      return err(`Failed to send reset email: ${resetError.message}`)
    }

    logger.info(
      `Custom password reset email initiated successfully for ${email}`
    )
    return ok({ data: null })
  } catch (error) {
    return err(
      `Error while sending password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Updates the user's password using the reset token
 * This is typically called from the client after user submits new password
 */
export async function updatePasswordWithToken(
  newPassword: string
): Promise<Result<string, void>> {
  try {
    const supabase = await createClient()

    // Get the current session (which should contain the reset token)
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (isNil(session)) {
      return err(
        'No active session found. Please request a new password reset.'
      )
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (!isNil(updateError)) {
      return err(`Failed to update password: ${updateError.message}`)
    }

    logger.info(`Password updated successfully`)
    return ok(undefined)
  } catch (error) {
    return err(
      `Error while updating password: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
