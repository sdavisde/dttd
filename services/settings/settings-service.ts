import 'server-only'

import { isNil } from 'lodash'
import type { Result } from '@/lib/results'
import { err, ok, isErr, isOk } from '@/lib/results'
import { logger } from '@/lib/logger'
import { getLoggedInUser } from '@/services/identity/user'
import type { SiteSetting, PrayerWheelUrls } from './types'
import { MENS_PRAYER_WHEEL_URL, WOMENS_PRAYER_WHEEL_URL } from './types'
import type {
  NotificationToggleKey,
  NotificationToggles,
} from './site-settings'
import {
  NOTIFICATION_TOGGLE_KEYS,
  NOTIFY_NEW_SPONSORSHIPS_KEY,
  NOTIFY_PAYMENT_RECEIPTS_KEY,
  SYSTEM_EMAIL_ADDRESS_KEY,
  formatSystemEmailFrom,
  parseToggleValue,
  resolveSystemEmailAddress,
  toToggleValue,
  validateSystemEmailAddress,
} from './site-settings'
import * as SettingsRepository from './repository'

function normalizeSetting(raw: {
  key: string
  value: string
  updated_at: string | null
  updated_by_user_id: string | null
}): SiteSetting {
  return {
    key: raw.key,
    value: raw.value,
    updatedAt: !isNil(raw.updated_at) ? new Date(raw.updated_at) : new Date(),
    updatedBy: raw.updated_by_user_id,
  }
}

export async function getSetting(
  key: string
): Promise<Result<string, SiteSetting | null>> {
  const result = await SettingsRepository.getSettingByKey(key)

  if (isErr(result)) {
    return err(`Failed to get setting: ${result.error}`)
  }

  if (result.data === null) {
    return ok(null)
  }

  return ok(normalizeSetting(result.data))
}

export async function getPrayerWheelUrls(): Promise<
  Result<string, PrayerWheelUrls>
> {
  const result = await SettingsRepository.getSettingsByKeys([
    MENS_PRAYER_WHEEL_URL,
    WOMENS_PRAYER_WHEEL_URL,
  ])

  if (isErr(result)) {
    return err(`Failed to get prayer wheel URLs: ${result.error}`)
  }

  const mens =
    result.data.find((s) => s.key === MENS_PRAYER_WHEEL_URL)?.value ?? ''
  const womens =
    result.data.find((s) => s.key === WOMENS_PRAYER_WHEEL_URL)?.value ?? ''

  return ok({ mens, womens })
}

/**
 * Returns the prayer wheel URL for the opposite gender.
 * Men sign up for the women's prayer wheel and vice versa.
 */
export async function getPrayerWheelUrlForGender(
  gender: string | null
): Promise<Result<string, string | null>> {
  const key =
    gender === 'male' ? WOMENS_PRAYER_WHEEL_URL : MENS_PRAYER_WHEEL_URL

  const result = await SettingsRepository.getSettingByKey(key)

  if (isErr(result)) {
    return err(`Failed to get prayer wheel URL: ${result.error}`)
  }

  return ok(result.data?.value ?? null)
}

/**
 * Reads a setting the server consults on its own behalf. Tries the admin
 * client first (webhooks and anonymous form posts have no session, and the
 * table's read policy is `authenticated`-only), then the session client.
 * Returns null rather than an error so every caller can fall back to a default.
 */
async function readSystemSetting(key: string): Promise<string | null> {
  const adminResult = await SettingsRepository.getSettingByKeyAdmin(key)

  if (isOk(adminResult)) {
    return adminResult.data?.value ?? null
  }

  const sessionResult = await SettingsRepository.getSettingByKey(key)

  if (isErr(sessionResult)) {
    logger.warn(
      `Failed to read site setting "${key}" (${sessionResult.error}); falling back to its default`
    )
    return null
  }

  return sessionResult.data?.value ?? null
}

/**
 * The address every transactional email is sent from. Falls back to the
 * historical hardcoded address when the setting has never been written.
 *
 * This is the single lookup for the system sender — {@link getSystemEmailFrom}
 * is a thin display-name wrapper around it.
 */
export async function getSystemEmailAddress(): Promise<string> {
  return resolveSystemEmailAddress(
    await readSystemSetting(SYSTEM_EMAIL_ADDRESS_KEY)
  )
}

/**
 * The system sender in the `Name <address>` form every `from:` already used.
 */
export async function getSystemEmailFrom(): Promise<string> {
  return formatSystemEmailFrom(await getSystemEmailAddress())
}

/**
 * Whether a notification category is still switched on. Unset means on, and any
 * read failure also means on — a settings outage must never silently stop mail.
 */
export async function isNotificationEnabled(
  key: NotificationToggleKey
): Promise<boolean> {
  return parseToggleValue(await readSystemSetting(key))
}

/**
 * Every notification toggle, for rendering the settings page.
 */
export async function getNotificationToggles(): Promise<NotificationToggles> {
  const result = await SettingsRepository.getSettingsByKeys([
    ...NOTIFICATION_TOGGLE_KEYS,
  ])

  const stored = isErr(result) ? [] : result.data

  const valueFor = (key: NotificationToggleKey) =>
    parseToggleValue(stored.find((setting) => setting.key === key)?.value)

  return {
    [NOTIFY_PAYMENT_RECEIPTS_KEY]: valueFor(NOTIFY_PAYMENT_RECEIPTS_KEY),
    [NOTIFY_NEW_SPONSORSHIPS_KEY]: valueFor(NOTIFY_NEW_SPONSORSHIPS_KEY),
  }
}

/**
 * Stores a new system email address, refusing anything the email provider
 * would reject outright (bad shape, or a domain it has not verified).
 */
export async function updateSystemEmailAddress(
  address: string
): Promise<Result<string, SiteSetting>> {
  const validation = validateSystemEmailAddress(address)

  if (!validation.valid) {
    return err(validation.reason)
  }

  return updateSetting(SYSTEM_EMAIL_ADDRESS_KEY, address.trim())
}

/**
 * Turns a notification category on or off.
 */
export async function setNotificationToggle(
  key: NotificationToggleKey,
  enabled: boolean
): Promise<Result<string, SiteSetting>> {
  return updateSetting(key, toToggleValue(enabled))
}

export async function updateSetting(
  key: string,
  value: string
): Promise<Result<string, SiteSetting>> {
  const userResult = await getLoggedInUser()
  if (isErr(userResult)) {
    return err('Failed to get current user')
  }

  const result = await SettingsRepository.upsertSetting(
    key,
    value,
    userResult.data.id
  )

  if (isErr(result)) {
    return err(`Failed to update setting: ${result.error}`)
  }

  return ok(normalizeSetting(result.data))
}
