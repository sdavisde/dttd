import { logger } from '@/lib/logger'
import { toast } from 'sonner'

/**
 * Shows a user-friendly toast error and logs the raw error for debugging.
 * Use this instead of `toast.error(result.error)` to avoid exposing
 * raw database/server errors to users.
 *
 * @param userMessage - Friendly message shown to the user via toast
 * @param context - Optional object logged alongside the message (pino style)
 */
export function toastError(
  userMessage: string,
  context?: Record<string, unknown>
) {
  logger.error(context ?? {}, userMessage)
  toast.error(userMessage)
}
