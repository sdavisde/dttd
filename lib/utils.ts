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
  if (isNil(phoneNumber) || phoneNumber === '') return '-'

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

const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}

/** The community's timezone — all event and record times are shown in CT. */
export const COMMUNITY_TIMEZONE = 'America/Chicago'

/**
 * The numeric American date format (MM/DD/YYYY) used by every date input
 * component, so a field reads identically whether it is being edited or just
 * displayed. Pass it to {@link formatDate} for ISO strings, or use
 * {@link formatDateNumeric} for a `Date` you already hold.
 */
export const NUMERIC_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric',
}

/**
 * Formats a date-only value (e.g. "2026-09-03") for display — no time, no
 * timezone conversion. This is the default helper for rendering any date column.
 *
 * Date-only columns (start_date, end_date, date_of_birth, ...) represent a
 * calendar day, not an instant. Parsing them with `new Date()` interprets the
 * string as UTC midnight, which renders a day early for any viewer behind UTC
 * (e.g. all US timezones) — the classic off-by-one. Routing through
 * `toLocalDateFromISO` builds the date in local time and avoids the shift.
 *
 * For real timestamps where the clock time matters (event datetimes), use
 * `formatDateTime` instead, which applies an explicit timezone.
 *
 * @example formatDate('2026-09-03') // "Sep 3, 2026"
 * @example formatDate('2026-09-03', { year: undefined }) // "Sep 3"
 * @example formatDate('2026-09-03', { weekday: 'long', month: 'long' }) // "Thursday, September 3, 2026"
 */
export const formatDate = (
  dateString?: string | null,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = toLocalDateFromISO(dateString)
  if (isNil(date)) return 'Date TBD'

  return date.toLocaleDateString('en-US', {
    ...DEFAULT_DATE_FORMAT,
    ...options,
  })
}

/**
 * Formats a date-only range (e.g. "Sep 3 - Sep 6, 2026"). The start label omits
 * the year by default to avoid repetition; pass `options` to customize both
 * ends. Returns 'Dates TBD' if either side is missing or invalid.
 */
export const formatDateRange = (
  start?: string | null,
  end?: string | null,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (isNil(toLocalDateFromISO(start)) || isNil(toLocalDateFromISO(end))) {
    return 'Dates TBD'
  }

  const startLabel = formatDate(start, { year: undefined, ...options })
  const endLabel = formatDate(end, options)

  return `${startLabel} - ${endLabel}`
}

/**
 * Long-form date-only formatter (e.g. "Thursday, September 3, 2026").
 * Thin wrapper over {@link formatDate}; prefer `formatDate` for new code.
 */
export const formatDateOnly = (dateString: string | null): string =>
  formatDate(dateString, { weekday: 'long', month: 'long' })

/**
 * Formats a datetime string with timezone conversion to Chicago time.
 * Use this for events where the actual time matters.
 */
export const formatDateTime = (datetime: string | null): FormattedDateTime => {
  if (isNil(datetime) || datetime === '') return 'Date TBD'

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
      timeZone: COMMUNITY_TIMEZONE,
    })
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: COMMUNITY_TIMEZONE,
    })

    return { dateStr, timeStr: `${timeStr} CT` }
  } catch {
    return 'Invalid Date'
  }
}

/**
 * Formats a `Date` as MM/DD/YYYY. Use this for values already held as `Date`
 * (date inputs, pickers); for date-only ISO strings prefer
 * `formatDate(value, NUMERIC_DATE_FORMAT)`, which avoids the UTC off-by-one.
 *
 * @example formatDateNumeric(new Date(2026, 8, 3)) // "09/03/2026"
 */
export const formatDateNumeric = (date: Date): string =>
  date.toLocaleDateString('en-US', NUMERIC_DATE_FORMAT)

/**
 * Formats a timestamp (a real instant, e.g. `created_at`/`updated_at`) as the
 * MM/DD/YYYY calendar day it fell on in community time. Returns '-' when the
 * value is missing or unparseable, which is what table cells want.
 *
 * Distinct from {@link formatDate}, which is for date-only columns: this parses
 * the full instant rather than taking the literal date portion, so a file
 * uploaded at 02:00 UTC is reported on the previous CT day, as it should be.
 *
 * @example formatTimestampDate('2026-09-03T14:30:00Z') // "09/03/2026"
 */
export const formatTimestampDate = (datetime?: string | null): string => {
  if (isNil(datetime) || datetime === '') return '-'

  const date = new Date(datetime)
  if (isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('en-US', {
    ...NUMERIC_DATE_FORMAT,
    timeZone: COMMUNITY_TIMEZONE,
  })
}

/**
 * Serializes a `Date` to a "YYYY-MM-DD" string using its local calendar day.
 *
 * `toISOString().split('T')[0]` looks equivalent but converts to UTC first, so
 * a local midnight in any UTC-positive zone serializes to the previous day.
 * Reading those values back through `toLocalDateFromISO` is what keeps a
 * date-only round trip stable.
 */
export const toISODateString = (date: Date): string => {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const setDatetimeToMidnight = (date: Date) => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

export const toLocalDateFromISO = (dateString?: string | null): Date | null => {
  if (isNil(dateString) || dateString === '') {
    return null
  }

  const isoPortion = dateString.split('T')[0]
  const [yearStr, monthStr, dayStr] = isoPortion.split('-')

  if (yearStr === undefined || monthStr === undefined || dayStr === undefined) {
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
