import { WeekendGroupWithId, Weekend } from './types'

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

export const normalizeDate = (date: Date) => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

export const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

export const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export const formatDateForApi = (date: Date) =>
  date.toISOString().split('T')[0]

export const toLocalDateFromISO = (
  dateString?: string | null
): Date | null => {
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

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return null
  }

  return normalizeDate(new Date(year, month - 1, day))
}

export const getNextThursdayRange = (reference = new Date()): DateRange => {
  const next = normalizeDate(reference)
  let daysAhead = (4 - next.getDay() + 7) % 7
  if (daysAhead === 0) {
    daysAhead = 7
  }
  const start = addDays(next, daysAhead)
  const end = addDays(start, 3)
  return { start, end }
}

export const inferMensWeekendFromGroup = (
  group: WeekendGroupWithId | null
): { title: string; range: DateRange } => {
  if (!group) {
    const nextRange = getNextThursdayRange()
    return { title: '', range: nextRange }
  }

  const mensWeekend = group.weekends.MENS
  const womensWeekend = group.weekends.WOMENS

  const womensStartDate = toLocalDateFromISO(womensWeekend?.start_date)
  const womensEndDate = toLocalDateFromISO(womensWeekend?.end_date)

  const mensStart =
    toLocalDateFromISO(mensWeekend?.start_date) ??
    (womensStartDate ? addDays(womensStartDate, -7) : null)
  const mensEnd =
    toLocalDateFromISO(mensWeekend?.end_date) ??
    (womensEndDate ? addDays(womensEndDate, -7) : null)

  if (mensStart && mensEnd) {
    return {
      title: mensWeekend?.title ?? womensWeekend?.title ?? '',
      range: {
        start: normalizeDate(mensStart),
        end: normalizeDate(mensEnd),
      },
    }
  }

  const nextRange = getNextThursdayRange()
  return {
    title: mensWeekend?.title ?? womensWeekend?.title ?? '',
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
  let cursor = normalizeDate(firstThursday)

  while (cursor.getMonth() === month) {
    const start = new Date(cursor)
    const end = addDays(start, 3)
    const keyValue = `${start.toISOString().slice(0, 10)}_${end.toISOString().slice(
      0,
      10
    )}`
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
  Math.abs(normalizeDate(a).getTime() - normalizeDate(b).getTime()) <
  MILLISECONDS_IN_DAY

export const getWeekendTitle = (weekend: Weekend | null) => {
  if (!weekend) {
    return ''
  }

  if (weekend.title) {
    return weekend.title
  }

  if (typeof weekend.number === 'number') {
    return `Weekend #${weekend.number}`
  }

  return ''
}
