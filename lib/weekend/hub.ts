import { isNil } from 'lodash'
import type { Event } from '@/services/events/types'
import { EventType } from '@/services/events/types'
import { COMMUNITY_TIMEZONE, toLocalDateFromISO } from '@/lib/utils'
import type { Weekend } from './types'
import { WeekendType } from './types'

// Pure helpers for the member Weekend Hub. No server imports so the whole
// module stays unit-testable in Jest.

/** The hub's section tabs, in board order. */
export type HubTab = 'overview' | 'schedule' | 'team' | 'candidates'

export const HUB_TABS: Array<{ tab: HubTab; label: string }> = [
  { tab: 'overview', label: 'Overview' },
  { tab: 'schedule', label: 'Schedule' },
  { tab: 'team', label: 'Team' },
  { tab: 'candidates', label: 'Candidates' },
]

/**
 * The legacy query-string key for Men's or Women's. Hub URLs now carry the
 * weekend as a path segment; only the group-root redirect still reads this,
 * so old links keep landing on the right weekend.
 */
export const WEEKEND_PARAM = 'weekend'

/** The path segment for each weekend: `/weekends/<group>/mens/team`. */
export type WeekendSlug = 'mens' | 'womens'

const SLUG_BY_TYPE: Record<WeekendType, WeekendSlug> = {
  [WeekendType.MENS]: 'mens',
  [WeekendType.WOMENS]: 'womens',
}

export function weekendSlug(weekendType: WeekendType): WeekendSlug {
  return SLUG_BY_TYPE[weekendType]
}

/** The weekend a path segment names, or null when it names neither. */
export function parseWeekendSlug(
  slug: string | null | undefined
): WeekendType | null {
  if (slug === 'mens') return WeekendType.MENS
  if (slug === 'womens') return WeekendType.WOMENS
  return null
}

/**
 * Builds a hub URL. The weekend is a path segment so the shared hub layout
 * (header, switch, tabs) can read it and stay mounted while tabs change.
 * Without a weekend it points at the group root, which redirects to the
 * viewer's own weekend.
 */
export function hubPath(
  groupId: string,
  tab: HubTab | 'review-candidates' = 'overview',
  weekendType?: WeekendType | null
): string {
  const root = `/weekends/${groupId}`
  if (isNil(weekendType)) return root
  const base = `${root}/${weekendSlug(weekendType)}`
  return tab === 'overview' ? base : `${base}/${tab}`
}

/**
 * Which hub tab a pathname is on, for the client-side tab row. Anything past
 * the weekend segment that isn't a tab (e.g. review-candidates) matches none.
 */
export function hubTabFromPath(pathname: string): HubTab | null {
  const [, weekends, , slug, section] = pathname.split('/')
  if (weekends !== 'weekends' || isNil(parseWeekendSlug(slug))) return null
  if (isNil(section) || section === '') return 'overview'
  return HUB_TABS.find(({ tab }) => tab === section)?.tab ?? null
}

/**
 * Which weekend a hub page shows: the requested one when it is valid,
 * otherwise the viewer's own weekend (men → Men's, women → Women's), otherwise
 * Men's, which always comes first.
 */
export function resolveWeekendType(
  param: string | string[] | null | undefined,
  gender: string | null | undefined
): WeekendType {
  const value = Array.isArray(param) ? param[0] : param
  if (value === WeekendType.MENS || value === WeekendType.WOMENS) return value
  if (gender === 'female') return WeekendType.WOMENS
  return WeekendType.MENS
}

const MONTH_DAY: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }

/**
 * The board's compact range for a weekend: "October 16–19" within one month,
 * "October 30 – November 2" across months, and both years only when the
 * range straddles a year boundary. Returns null when either side is missing.
 */
export function formatCompactDateRange(
  start?: string | null,
  end?: string | null
): string | null {
  const startDate = toLocalDateFromISO(start)
  const endDate = toLocalDateFromISO(end)
  if (isNil(startDate) || isNil(endDate)) return null

  const sameYear = startDate.getFullYear() === endDate.getFullYear()
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth()

  if (sameMonth) {
    const month = startDate.toLocaleDateString('en-US', { month: 'long' })
    return `${month} ${startDate.getDate()}–${endDate.getDate()}`
  }

  const withYear: Intl.DateTimeFormatOptions = sameYear
    ? MONTH_DAY
    : { ...MONTH_DAY, year: 'numeric' }
  const startLabel = startDate.toLocaleDateString('en-US', withYear)
  const endLabel = endDate.toLocaleDateString('en-US', withYear)
  return `${startLabel} – ${endLabel}`
}

/** "YYYY-MM-DD" for an instant, as the community's calendar sees it. */
export function communityDayKey(instant: Date): string {
  return instant.toLocaleDateString('en-CA', { timeZone: COMMUNITY_TIMEZONE })
}

/** Whole calendar days from `fromKey` to `toKey` (both "YYYY-MM-DD"). */
function daysBetween(fromKey: string, toKey: string): number {
  const from = toLocalDateFromISO(fromKey)
  const to = toLocalDateFromISO(toKey)
  if (isNil(from) || isNil(to)) return 0
  return Math.round((to.getTime() - from.getTime()) / 86_400_000)
}

/**
 * Does this event belong on the selected weekend's hub? Yes for the weekend's
 * own events, for group-level events (team meetings, the secuela), and for
 * community-wide events that carry no weekend or group at all.
 */
export function eventAppliesToWeekend(
  event: Event,
  weekend: Pick<Weekend, 'id' | 'groupId'>
): boolean {
  if (!isNil(event.weekendId)) return event.weekendId === weekend.id
  if (!isNil(event.weekendGroupId))
    return event.weekendGroupId === weekend.groupId
  return true
}

/**
 * Events for the selected weekend in date order. Undated events sort last so
 * a placeholder never hides a real gathering.
 */
export function eventsForWeekend(
  events: Event[],
  weekend: Pick<Weekend, 'id' | 'groupId'>
): Event[] {
  return events
    .filter((event) => eventAppliesToWeekend(event, weekend))
    .sort((a, b) => {
      if (isNil(a.datetime) && isNil(b.datetime)) return 0
      if (isNil(a.datetime)) return 1
      if (isNil(b.datetime)) return -1
      return a.datetime.localeCompare(b.datetime)
    })
}

/** The next `limit` events on or after `now`, soonest first. */
export function upcomingEvents(
  events: Event[],
  now: Date,
  limit: number
): Event[] {
  const cutoff = now.getTime()
  return events
    .filter(
      (event) =>
        !isNil(event.datetime) && new Date(event.datetime).getTime() >= cutoff
    )
    .sort((a, b) => (a.datetime ?? '').localeCompare(b.datetime ?? ''))
    .slice(0, limit)
}

/**
 * Finds a singleton event (send-off, the weekend itself, ...) for one weekend.
 * Rows stamped with the weekend id win. Older rows carry only the group id, so
 * as a fallback the group's row whose date sits on or just before the
 * weekend's start counts too — a Men's send-off is never a week away from the
 * Men's weekend.
 */
export function findSingletonEventForWeekend(
  events: Event[],
  weekend: Pick<Weekend, 'id' | 'groupId' | 'start_date'>,
  type: Event['type']
): Event | null {
  const ofType = events.filter((event) => event.type === type)
  const own = ofType.find((event) => event.weekendId === weekend.id)
  if (!isNil(own)) return own

  const startKey = weekend.start_date
  const nearStart = ofType.find((event) => {
    if (!isNil(event.weekendId) || isNil(event.datetime)) return false
    if (event.weekendGroupId !== weekend.groupId) return false
    const offset = daysBetween(
      communityDayKey(new Date(event.datetime)),
      startKey
    )
    return offset >= 0 && offset <= 2
  })
  return nearStart ?? null
}

/** Where the weekend happens, from its own event row when one names a place. */
export function weekendLocation(
  events: Event[],
  weekend: Pick<Weekend, 'id' | 'groupId' | 'start_date'>
): string | null {
  const location = findSingletonEventForWeekend(
    events,
    weekend,
    EventType.WEEKEND
  )?.location
  return isNil(location) || location.trim() === '' ? null : location
}

export type Countdown =
  | { kind: 'until'; days: number; label: string }
  | { kind: 'today'; label: string }
  | { kind: 'underway'; label: string }
  | { kind: 'since'; days: number; label: string }

/**
 * The "days until send-off" tile. Counts calendar days in community time to
 * the send-off event, or to the weekend's first day when no send-off is on
 * the calendar; once the weekend is underway or over, says so instead.
 */
export function sendOffCountdown(
  events: Event[],
  weekend: Pick<Weekend, 'id' | 'groupId' | 'start_date' | 'end_date'>,
  now: Date
): Countdown {
  const todayKey = communityDayKey(now)
  const sendOff = findSingletonEventForWeekend(
    events,
    weekend,
    EventType.SENDOFF
  )
  const targetKey = isNil(sendOff?.datetime)
    ? weekend.start_date
    : communityDayKey(new Date(sendOff.datetime))
  const targetLabel = isNil(sendOff) ? 'the weekend' : 'send-off'

  if (
    daysBetween(weekend.start_date, todayKey) >= 0 &&
    daysBetween(todayKey, weekend.end_date) >= 0
  ) {
    return { kind: 'underway', label: 'The weekend is happening now' }
  }

  const days = daysBetween(todayKey, targetKey)
  if (days > 0)
    return { kind: 'until', days, label: `Days until ${targetLabel}` }
  if (days === 0)
    return { kind: 'today', label: `${capitalize(targetLabel)} is today` }
  return {
    kind: 'since',
    days: daysBetween(weekend.end_date, todayKey),
    label: 'Days since the weekend',
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
