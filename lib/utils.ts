import { clsx, type ClassValue } from 'clsx'
import { isNil } from 'lodash'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--
  }

  return age
}

// Format phone number to xxx-xxx-xxxx format
export const formatPhoneNumber = (
  phoneNumber: string | null | undefined
): string => {
  if (!phoneNumber) return '-'

  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '')

  // Check if it's a valid US phone number (10 digits)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  // If it's 11 digits and starts with 1, format as US number
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  // Otherwise, return the original
  return phoneNumber
}

export type FormattedDateTime =
  | {
      dateStr: string
      timeStr: string
    }
  | string

/**
 * Formats a date-only string (YYYY-MM-DD or datetime stored as midnight UTC).
 * Use this for weekend start/end dates where only the date matters, not the time.
 * Does NOT apply timezone conversion to avoid date shifting.
 */
export const formatDateOnly = (dateString: string | null): string => {
  if (!dateString) return 'Date TBD'

  try {
    const date = toLocalDateFromISO(dateString)
    if (isNil(date)) {
      return 'Invalid Date'
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'Invalid Date'
  }
}

/**
 * Formats a datetime string with timezone conversion to Chicago time.
 * Use this for events where the actual time matters.
 */
export const formatDateTime = (datetime: string | null): FormattedDateTime => {
  if (!datetime) return 'Date TBD'

  try {
    const date = new Date(datetime)
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }

    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Chicago',
    })
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Chicago',
    })

    return { dateStr, timeStr: `${timeStr} CT` }
  } catch {
    return 'Invalid Date'
  }
}

export const setDatetimeToMidnight = (date: Date) => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

export const toLocalDateFromISO = (dateString?: string | null): Date | null => {
  if (!dateString) {
    return null
  }

  const isoPortion = dateString.split('T')[0]
  const [yearStr, monthStr, dayStr] = isoPortion.split('-')

  if (!yearStr || !monthStr || !dayStr) {
    return null
  }

  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null
  }

  return setDatetimeToMidnight(new Date(year, month - 1, day))
}

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
