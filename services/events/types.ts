import { Tables } from '@/database.types'

/**
 * Raw event record from the database.
 * This type will be extended when the migration is applied.
 */
export type RawEventRecord = Tables<'events'> & {
  end_datetime?: string | null
  weekend_id?: string | null
  type?: EventTypeValue | null
}

/**
 * Event type enum values matching the database event_type enum
 */
export const EventType = {
  MEETING: 'meeting',
  WEEKEND: 'weekend',
  SERENADE: 'serenade',
  SENDOFF: 'sendoff',
  CLOSING: 'closing',
  OTHER: 'other',
} as const

export type EventTypeValue = (typeof EventType)[keyof typeof EventType]

/**
 * All possible event type values as an array for iteration
 */
export const EVENT_TYPE_VALUES: EventTypeValue[] = [
  EventType.MEETING,
  EventType.WEEKEND,
  EventType.SERENADE,
  EventType.SENDOFF,
  EventType.CLOSING,
  EventType.OTHER,
]

/**
 * Color mapping for event types (Tailwind background classes)
 */
export const EVENT_TYPE_COLORS: Record<EventTypeValue, string> = {
  [EventType.MEETING]: 'bg-green-500',
  [EventType.WEEKEND]: 'bg-red-500',
  [EventType.SERENADE]: 'bg-blue-500',
  [EventType.SENDOFF]: 'bg-orange-500',
  [EventType.CLOSING]: 'bg-purple-500',
  [EventType.OTHER]: 'bg-gray-500',
}

/**
 * Border color classes for event cards
 */
export const EVENT_TYPE_BORDER_COLORS: Record<EventTypeValue, string> = {
  [EventType.MEETING]: 'border-l-green-500',
  [EventType.WEEKEND]: 'border-l-red-500',
  [EventType.SERENADE]: 'border-l-blue-500',
  [EventType.SENDOFF]: 'border-l-orange-500',
  [EventType.CLOSING]: 'border-l-purple-500',
  [EventType.OTHER]: 'border-l-gray-500',
}

/**
 * Human-readable labels for event types
 */
export const EVENT_TYPE_LABELS: Record<EventTypeValue, string> = {
  [EventType.MEETING]: 'Meeting',
  [EventType.WEEKEND]: 'Weekend',
  [EventType.SERENADE]: 'Serenade',
  [EventType.SENDOFF]: 'Sendoff',
  [EventType.CLOSING]: 'Closing',
  [EventType.OTHER]: 'Other',
}

/**
 * Normalized Event type for use in the application
 */
export type Event = {
  id: number
  title: string | null
  datetime: string | null
  location: string | null
  endDatetime: string | null
  weekendId: string | null
  type: EventTypeValue | null
  createdAt: string
}

/**
 * Input type for creating a new event
 */
export type EventCreateInput = {
  title: string
  datetime: string
  location?: string | null
  end_datetime?: string | null
  weekend_id?: string | null
  type?: EventTypeValue | null
}

/**
 * Input type for updating an event
 */
export type EventUpdateInput = Partial<EventCreateInput>
