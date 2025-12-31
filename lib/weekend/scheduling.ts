import { isNil } from 'lodash'
import { formatWeekendTitle } from '.'
import { WeekendGroupWithId, Weekend } from '@/lib/weekend/types'
import { setDatetimeToMidnight, toLocalDateFromISO } from '@/lib/utils'

export type DateRange = {
  start: Date
  end: Date
}

export type MonthOption = {
  label: string
  value: string
}

export type WeekendOption = DateRange & {
  label: string
  key: string
}

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000

export const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

export const formatDateLabel = (
  date: Date,
  options?: Intl.DateTimeFormatOptions
) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  })

export const formatDateForApi = (date: Date) => date.toISOString().split('T')[0]

export const getNextThursdayRange = (reference = new Date()): DateRange => {
  const next = setDatetimeToMidnight(reference)
  let daysAhead = (4 - next.getDay() + 7) % 7
  if (daysAhead === 0) {
    daysAhead = 7
  }
  const start = addDays(next, daysAhead)
  const end = addDays(start, 3)
  return { start, end }
}

export const getMensWeekendDateRange = (
  group: WeekendGroupWithId | null
): { range: DateRange } => {
  if (isNil(group) || isNil(group.weekends.MENS)) {
    const nextRange = getNextThursdayRange()
    return { range: nextRange }
  }

  const mensWeekend = group.weekends.MENS
  const womensWeekend = group.weekends.WOMENS

  const womensStartDate = toLocalDateFromISO(womensWeekend?.start_date)

  const mensStart =
    toLocalDateFromISO(mensWeekend.start_date) ??
    (womensStartDate ? addDays(womensStartDate, -7) : null)
  const mensEnd =
    toLocalDateFromISO(mensWeekend.end_date) ??
    (mensStart ? addDays(mensStart, 3) : null)

  if (mensStart && mensEnd) {
    return {
      range: {
        start: setDatetimeToMidnight(mensStart),
        end: setDatetimeToMidnight(mensEnd),
      },
    }
  }

  const nextRange = getNextThursdayRange()
  return {
    range: nextRange,
  }
}

export const buildMonthOptions = (
  startDate: Date,
  count = 12
): MonthOption[] => {
  const options: MonthOption[] = []
  for (let offset = 0; offset < count; offset++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + offset, 1)
    const label = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    options.push({
      label,
      value: getMonthKey(date),
    })
  }
  return options
}

export const generateWeekendOptionsForMonth = (
  key: string
): WeekendOption[] => {
  const [yearStr, monthStr] = key.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr) - 1
  const firstOfMonth = new Date(year, month, 1)
  const firstThursday = new Date(firstOfMonth)
  while (firstThursday.getDay() !== 4) {
    firstThursday.setDate(firstThursday.getDate() + 1)
  }

  const options: WeekendOption[] = []
  let cursor = setDatetimeToMidnight(firstThursday)

  while (cursor.getMonth() === month) {
    const start = new Date(cursor)
    const end = addDays(start, 3)
    const keyValue = `${start.toISOString().slice(0, 10)}_${end
      .toISOString()
      .slice(0, 10)}`
    options.push({
      start,
      end,
      key: keyValue,
      label: `${formatDateLabel(start)} - ${formatDateLabel(end)}`,
    })
    cursor = addDays(cursor, 7)
  }

  return options
}

export const isSameDay = (a: Date, b: Date) =>
  Math.abs(
    setDatetimeToMidnight(a).getTime() - setDatetimeToMidnight(b).getTime()
  ) < MILLISECONDS_IN_DAY

export const getWeekendTitle = (weekend: Weekend | null) => {
  if (isNil(weekend)) {
    return ''
  }

  if (!isNil(weekend.title)) {
    return formatWeekendTitle(weekend)
  }

  if (typeof weekend.number === 'number') {
    return `Weekend #${weekend.number}`
  }

  return ''
}
