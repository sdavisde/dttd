/**
 * Events Service
 *
 * Public API for event management operations.
 * All server actions and types are exported from this file.
 */

// Actions
export {
  getEvents,
  getEvent,
  getUpcomingEvents,
  getPastEvents,
  getUpcomingEventsForPeriod,
  getEventsForWeekendGroup,
  createEvent,
  updateEvent,
  deleteEvent,
} from './actions'

// Types
export type { Event, EventCreateInput, EventUpdateInput } from './actions'

export {
  EventType,
  EVENT_TYPE_VALUES,
  EVENT_TYPE_COLORS,
  EVENT_TYPE_BORDER_COLORS,
  EVENT_TYPE_LABELS,
} from './types'

export type { EventTypeValue } from './types'
