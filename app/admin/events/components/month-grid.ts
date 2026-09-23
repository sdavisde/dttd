import { isNil } from 'lodash'
import type { Event } from '@/services/events'

/**
 * Shared month-grid arithmetic. The full Events calendar, the phone agenda
 * fallback, and the dashboard's mini calendar all lay days out the same way —
 * this is the one place that decides what a month looks like.
 */

export const CENTRAL_TIME = 'America/Chicago'

/** Column headers for the full desktop grid. */
export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Column headers for the dashboard's mini grid, where a word won't fit. */
export const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** Short month names, for the borrowed days at either end of a month grid. */
export const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** "YYYY-MM-DD" for an event's datetime, in the community's timezone. */
export function eventDayKey(datetime: string): string {
  return new Date(datetime).toLocaleDateString('en-CA', {
    timeZone: CENTRAL_TIME,
  })
}

/** "YYYY-MM-DD" for a calendar cell. `month` is zero-based. */
export function dayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Today in the community's timezone, with a zero-based month. */
export function todayInCommunityTz(): { year: number; month: number } {
  const parts = new Date()
    .toLocaleDateString('en-CA', { timeZone: CENTRAL_TIME })
    .split('-')
  return { year: Number(parts[0]), month: Number(parts[1]) - 1 }
}

/** Today as a `MonthCell.key`, so a grid can mark the current day. */
export function todayKeyInCommunityTz(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: CENTRAL_TIME })
}

/** Events bucketed by their community-timezone day, in input order. */
export function groupEventsByDay(events: Event[]): Map<string, Event[]> {
  const byDay = new Map<string, Event[]>()
  for (const event of events) {
    if (isNil(event.datetime)) continue
    const key = eventDayKey(event.datetime)
    byDay.set(key, [...(byDay.get(key) ?? []), event])
  }
  return byDay
}

export interface MonthCell {
  day: number
  /** False for the leading/trailing days borrowed from the neighbouring month. */
  inMonth: boolean
  key: string
  /**
   * What the cell prints for its date. Days in the month print the bare
   * number; the first borrowed day at either end carries its month, the way
   * the board reads "Aug 31" and then "Oct 1".
   */
  label: string
}

/**
 * Sunday-first cells covering the whole month, padded to full weeks.
 * `month` is zero-based.
 */
export function buildMonthCells(
  year: number,
  month: number
): { cells: MonthCell[]; weekCount: number } {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const weekCount = Math.ceil((firstDow + daysInMonth) / 7)

  const cells: MonthCell[] = []
  for (let i = 0; i < weekCount * 7; i++) {
    const offset = i - firstDow
    if (offset < 0) {
      const day = daysInPrevMonth + offset + 1
      const [y, m] = month === 0 ? [year - 1, 11] : [year, month - 1]
      cells.push({
        day,
        inMonth: false,
        key: dayKey(y, m, day),
        // Only the first borrowed day names its month.
        label: i === 0 ? `${MONTH_ABBR[m]} ${day}` : String(day),
      })
    } else if (offset >= daysInMonth) {
      const day = offset - daysInMonth + 1
      const [y, m] = month === 11 ? [year + 1, 0] : [year, month + 1]
      cells.push({
        day,
        inMonth: false,
        key: dayKey(y, m, day),
        label: offset === daysInMonth ? `${MONTH_ABBR[m]} ${day}` : String(day),
      })
    } else {
      cells.push({
        day: offset + 1,
        inMonth: true,
        key: dayKey(year, month, offset + 1),
        label: String(offset + 1),
      })
    }
  }
  return { cells, weekCount }
}

/**
 * How many chips a day cell shows before it starts hiding them. A busy day
 * must not stretch the whole week row, so past this count the cell keeps one
 * line for the "+N more" affordance.
 */
export const DAY_EVENT_LIMIT = 3

/**
 * Splits a day's events into the ones a cell shows and the count it hides.
 * Nothing is hidden while the cell is expanded, or while the day is at or
 * under the limit — hiding one event behind a "+1 more" would cost a line
 * and save none.
 */
export function splitDayEvents<T>(
  dayEvents: T[],
  isExpanded: boolean
): { visible: T[]; hiddenCount: number } {
  if (isExpanded || dayEvents.length <= DAY_EVENT_LIMIT) {
    return { visible: dayEvents, hiddenCount: 0 }
  }
  const visible = dayEvents.slice(0, DAY_EVENT_LIMIT - 1)
  return { visible, hiddenCount: dayEvents.length - visible.length }
}

/** Steps a `{ year, month }` view by whole months, rolling the year over. */
export function stepMonth(
  view: { year: number; month: number },
  delta: number
): { year: number; month: number } {
  const next = view.month + delta
  if (next < 0) return { year: view.year - 1, month: 11 }
  if (next > 11) return { year: view.year + 1, month: 0 }
  return { year: view.year, month: next }
}
