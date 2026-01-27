import 'server-only'

import { Result, err, ok, isErr } from '@/lib/results'
import { getLoggedInUser } from '@/services/identity/user'
import {
  SiteSetting,
  PrayerWheelUrls,
  MENS_PRAYER_WHEEL_URL,
  WOMENS_PRAYER_WHEEL_URL,
} from './types'
import * as SettingsRepository from './repository'

function normalizeSetting(raw: {
  key: string
  value: string
  updated_at: string
  updated_by_user_id: string | null
}): SiteSetting {
  return {
    key: raw.key,
    value: raw.value,
    updatedAt: new Date(raw.updated_at),
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
