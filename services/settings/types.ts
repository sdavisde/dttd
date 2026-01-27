export type SiteSetting = {
  key: string
  value: string
  updatedAt: Date
  updatedBy: string | null
}

export const MENS_PRAYER_WHEEL_URL = 'mens_prayer_wheel_url'
export const WOMENS_PRAYER_WHEEL_URL = 'womens_prayer_wheel_url'

export type PrayerWheelUrls = {
  mens: string
  womens: string
}
