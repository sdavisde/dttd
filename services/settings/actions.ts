'use server'

import { authorizedAction } from '@/lib/actions/authorized-action'
import * as SettingsService from './settings-service'
import { Permission } from '@/lib/security'
import { SiteSetting } from './types'

/**
 * Get the prayer wheel URLs for men's and women's weekends.
 * Public read - no auth required (used on admin settings page).
 */
export async function getPrayerWheelUrls() {
  return await SettingsService.getPrayerWheelUrls()
}

/**
 * Get the prayer wheel URL for a user based on their gender.
 * Men get the women's prayer wheel and vice versa.
 */
export async function getPrayerWheelUrlForGender(gender: string | null) {
  return await SettingsService.getPrayerWheelUrlForGender(gender)
}

type UpdateSettingRequest = {
  key: string
  value: string
}

/**
 * Update a site setting. Requires WRITE_SETTINGS permission.
 */
export const updateSetting = authorizedAction<
  UpdateSettingRequest,
  SiteSetting
>(Permission.WRITE_SETTINGS, async ({ key, value }) => {
  return await SettingsService.updateSetting(key, value)
})
