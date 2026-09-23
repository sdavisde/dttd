import type { Event } from '@/services/events'
import type { EventTypeValue } from '@/services/events/types'
import { EventType, GROUP_EVENT_TYPES } from '@/services/events/types'

/**
 * Group-level slots that exist exactly once per weekend group (today: the
 * secuela). Meetings are the one group type with no fixed count — a group
 * holds as many as its leadership calls — so they are excluded here and
 * counted from the schedule itself.
 */
export const GROUP_SINGLETON_EVENT_TYPES: EventTypeValue[] =
  GROUP_EVENT_TYPES.filter((type) => type !== EventType.MEETING)

export interface GroupSlots {
  /** Slots the group is expected to fill: every meeting called, plus each singleton. */
  total: number
  /** Slots with an event on the calendar. */
  filled: number
  /** Singleton group types with nothing scheduled yet. */
  missing: EventTypeValue[]
  meetingCount: number
}

/**
 * The "Meetings & secuela" meter. The denominator is the real expected slot
 * count — meetings scheduled so far plus one per group singleton — so a
 * missing secuela always shows as a genuine gap (e.g. 4 of 5) rather than
 * being clamped away by a fixed total.
 */
export function deriveGroupSlots(events: Event[]): GroupSlots {
  const meetingCount = events.filter(
    (event) => event.type === EventType.MEETING
  ).length
  const missing = GROUP_SINGLETON_EVENT_TYPES.filter(
    (type) => !events.some((event) => event.type === type)
  )
  const total = meetingCount + GROUP_SINGLETON_EVENT_TYPES.length
  return {
    total,
    filled: total - missing.length,
    missing,
    meetingCount,
  }
}
