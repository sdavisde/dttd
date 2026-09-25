import 'server-only'

import { defineCachedRead } from '@/lib/cache/cached-read'
import { TAGS } from '@/lib/cache/tags'
import * as SettingsService from './settings-service'

// Every settings write calls updateTag; the day is a safety net.
const DAY_SECONDS = 60 * 60 * 24

/** {@link SettingsService.getPrayerWheelUrls}, shared across requests. */
export const getCachedPrayerWheelUrls = defineCachedRead(
  'prayer-wheel-urls',
  (client) => SettingsService.getPrayerWheelUrls({ client }),
  { tags: () => [TAGS.settings], revalidateSeconds: DAY_SECONDS }
)

/**
 * {@link SettingsService.getPrayerWheelUrlForGender}, shared across requests.
 * Keyed by gender, not by viewer.
 */
export const getCachedPrayerWheelUrlForGender = defineCachedRead(
  'prayer-wheel-url-for-gender',
  (client, gender: string | null) =>
    SettingsService.getPrayerWheelUrlForGender(gender, { client }),
  { tags: () => [TAGS.settings], revalidateSeconds: DAY_SECONDS }
)
