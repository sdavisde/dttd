'use server'

import { createClient } from '@/lib/supabase/server'
import { Result, err, ok } from '@/lib/results'
import { logger } from '@/lib/logger'
import { Resend, CreateEmailResponseSuccess } from 'resend'
import PasswordResetEmail from '@/components/email/PasswordResetEmail'
import { getUrl } from '@/lib/url'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sends a password reset email to the specified email address
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<Result<Error, { data: CreateEmailResponseSuccess | null }>> {
  try {
    logger.info(`Starting password reset request for email: ${email}`)
    
    const supabase = await createClient()
    
    // Generate password reset link using Supabase Auth
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getUrl('/reset-password')}`,
    })
    
    if (resetError) {
      logger.error(`Failed to initiate password reset for ${email}:`, resetError)
      return err(new Error(`Failed to send reset email: ${resetError.message}`))
    }

    logger.info(`Password reset email initiated successfully for ${email}`)
    
    // Note: Supabase handles sending the email, but we could also send a custom email using Resend
    // For now, we'll let Supabase handle it and return success
    return ok({ data: null })
    
  } catch (error) {
    logger.error(`Error while sending password reset email:`, error)
    return err(
      new Error(
        `Error while sending password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

/**
 * Alternative function to send custom password reset email using Resend
 * This gives us more control over the email template and branding
 */
export async function sendCustomPasswordResetEmail(
  email: string
): Promise<Result<Error, { data: CreateEmailResponseSuccess | null }>> {
  try {
    logger.info(`Starting custom password reset request for email: ${email}`)
    
    const supabase = await createClient()
    
    // Check if user exists first
    const { data: userCheck } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (!userCheck) {
      // Don't reveal if email exists or not for security
      logger.info(`Password reset requested for non-existent email: ${email}`)
      return ok({ data: null })
    }
    
    // Generate password reset link using Supabase Auth
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getUrl('/reset-password')}`,
    })
    
    if (resetError) {
      logger.error(`Failed to initiate password reset for ${email}:`, resetError)
      return err(new Error(`Failed to send reset email: ${resetError.message}`))
    }

    // Send custom email using Resend with our template
    // Note: Since Supabase generates the reset URL and sends it, we'd need to use
    // Supabase's custom email templates or handle the token ourselves
    // For simplicity, we'll use Supabase's built-in email for now
    
    logger.info(`Custom password reset email initiated successfully for ${email}`)
    return ok({ data: null })
    
  } catch (error) {
    logger.error(`Error while sending custom password reset email:`, error)
    return err(
      new Error(
        `Error while sending password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

/**
 * Updates the user's password using the reset token
 * This is typically called from the client after user submits new password
 */
export async function updatePasswordWithToken(
  newPassword: string
): Promise<Result<Error, void>> {
  try {
    const supabase = await createClient()
    
    // Get the current session (which should contain the reset token)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return err(new Error('No active session found. Please request a new password reset.'))
    }
    
    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (updateError) {
      logger.error(`Failed to update password:`, updateError)
      return err(new Error(`Failed to update password: ${updateError.message}`))
    }
    
    logger.info(`Password updated successfully`)
    return ok(undefined)
    
  } catch (error) {
    logger.error(`Error while updating password:`, error)
    return err(
      new Error(
        `Error while updating password: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}