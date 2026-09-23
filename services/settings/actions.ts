'use server'

import { authorizedAction } from '@/lib/actions/authorized-action'
import * as SettingsService from './settings-service'
import { Permission } from '@/lib/security'
import type { SiteSetting } from './types'
import type { NotificationToggleKey } from './site-settings'

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

/**
 * Update the address every transactional email is sent from.
 * Requires WRITE_SETTINGS permission.
 */
export const updateSystemEmailAddress = authorizedAction<string, SiteSetting>(
  Permission.WRITE_SETTINGS,
  async (address) => {
    return await SettingsService.updateSystemEmailAddress(address)
  }
)

type SetNotificationToggleRequest = {
  key: NotificationToggleKey
  enabled: boolean
}

/**
 * Turn a notification category on or off.
 * Requires WRITE_SETTINGS permission.
 */
export const setNotificationToggle = authorizedAction<
  SetNotificationToggleRequest,
  SiteSetting
>(Permission.WRITE_SETTINGS, async ({ key, enabled }) => {
  return await SettingsService.setNotificationToggle(key, enabled)
})
