/**
 * Pure helpers for the site-wide values stored in the `site_settings`
 * key/value table.
 *
 * Deliberately free of `server-only` imports so the settings service, the
 * server actions, and the admin UI all share one copy of the keys, the
 * defaults, and the validation rules.
 */

/**
 * The address every transactional email was hardcoded to before it became
 * configurable. Doubles as the fallback when the setting is unset and as the
 * source of the verified sending domain.
 */
export const DEFAULT_SYSTEM_EMAIL_ADDRESS = 'noreply@dustytrailstresdias.org'

/** Display name Resend puts in front of the system address. */
export const SYSTEM_EMAIL_DISPLAY_NAME = 'Dusty Trails Tres Dias'

export const SYSTEM_EMAIL_ADDRESS_KEY = 'system_email_address'
export const NOTIFY_PAYMENT_RECEIPTS_KEY = 'notify_payment_receipts'
export const NOTIFY_NEW_SPONSORSHIPS_KEY = 'notify_new_sponsorships'

export const NOTIFICATION_TOGGLE_KEYS = [
  NOTIFY_PAYMENT_RECEIPTS_KEY,
  NOTIFY_NEW_SPONSORSHIPS_KEY,
] as const

export type NotificationToggleKey = (typeof NOTIFICATION_TOGGLE_KEYS)[number]

export type NotificationToggles = Record<NotificationToggleKey, boolean>

/**
 * The only domain Resend will accept mail from. Derived from the default
 * address so the two can never drift apart.
 */
export const VERIFIED_SENDING_DOMAIN =
  DEFAULT_SYSTEM_EMAIL_ADDRESS.split('@')[1]

/** Falls back to the historical hardcoded address when nothing is stored. */
export function resolveSystemEmailAddress(
  stored: string | null | undefined
): string {
  const trimmed = stored?.trim() ?? ''
  return trimmed === '' ? DEFAULT_SYSTEM_EMAIL_ADDRESS : trimmed
}

/**
 * Wraps a bare address in the display-name form Resend expects
 * (`Dusty Trails Tres Dias <noreply@...>`), which is what every existing
 * `from:` used.
 */
export function formatSystemEmailFrom(address: string): string {
  return `${SYSTEM_EMAIL_DISPLAY_NAME} <${resolveSystemEmailAddress(address)}>`
}

// Deliberately simple: Resend does the authoritative validation. This only has
// to stop obvious typos before they are stored.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type SystemEmailValidation =
  | { valid: true }
  | { valid: false; reason: string }

/**
 * A system address must look like an email *and* sit on the domain Resend has
 * already verified — otherwise every send would start bouncing the moment it
 * was saved.
 */
export function validateSystemEmailAddress(
  value: string
): SystemEmailValidation {
  const trimmed = value.trim()

  if (trimmed === '') {
    return { valid: false, reason: 'Enter an email address.' }
  }

  if (!EMAIL_SHAPE.test(trimmed)) {
    return { valid: false, reason: 'Enter a valid email address.' }
  }

  const domain = trimmed.split('@')[1]?.toLowerCase() ?? ''

  if (domain !== VERIFIED_SENDING_DOMAIN.toLowerCase()) {
    return {
      valid: false,
      reason: `The address has to end in @${VERIFIED_SENDING_DOMAIN} — that's the only domain our email provider is allowed to send from.`,
    }
  }

  return { valid: true }
}

/**
 * Notification toggles default to ON when unset, so nothing silently stops
 * sending just because a row was never written.
 */
export function parseToggleValue(stored: string | null | undefined): boolean {
  if (stored === null || stored === undefined) {
    return true
  }

  const normalized = stored.trim().toLowerCase()

  if (normalized === 'false' || normalized === 'off' || normalized === '0') {
    return false
  }

  return true
}

export function toToggleValue(enabled: boolean): string {
  return enabled ? 'true' : 'false'
}

export function defaultNotificationToggles(): NotificationToggles {
  return {
    [NOTIFY_PAYMENT_RECEIPTS_KEY]: true,
    [NOTIFY_NEW_SPONSORSHIPS_KEY]: true,
  }
}
