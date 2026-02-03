'use server'

import { EventCreateInput, EventUpdateInput } from './types'
import * as EventsService from './events-service'

// Re-export types for convenience
export type { Event, EventCreateInput, EventUpdateInput } from './types'

// ============================================================================
// Public Actions (No Authorization)
// ============================================================================

/**
 * Fetches all events, optionally sorted by a field.
 * Public - events are visible to all authenticated users.
 */
export async function getEvents(orderBy?: 'datetime' | 'created_at') {
  return EventsService.getEvents(orderBy)
}

/**
 * Fetches a single event by ID.
 * Public - events are visible to all authenticated users.
 */
export async function getEvent(id: number) {
  return EventsService.getEvent(id)
}

/**
 * Fetches upcoming events (datetime >= now).
 * Public - events are visible to all authenticated users.
 */
export async function getUpcomingEvents() {
  return EventsService.getUpcomingEvents()
}

/**
 * Fetches past events (datetime < now).
 * Public - events are visible to all authenticated users.
 */
export async function getPastEvents() {
  return EventsService.getPastEvents()
}

/**
 * Fetches events within a specified future time period.
 * Public - events are visible to all authenticated users.
 * @param months - Number of months into the future to fetch events for
 */
export async function getUpcomingEventsForPeriod(months: number) {
  return EventsService.getUpcomingEventsForPeriod(months)
}

/**
 * Fetches all events for a weekend group (both men's and women's weekends).
 * Public - events are visible to all authenticated users.
 * @param groupId - The group_id that links men's and women's weekends together
 */
export async function getEventsForWeekendGroup(groupId: string) {
  return EventsService.getEventsForWeekendGroup(groupId)
}

/**
 * Creates a new event.
 * Public - relies on RLS for authorization.
 */
export async function createEvent(data: EventCreateInput) {
  return EventsService.createEvent(data)
}

/**
 * Updates an event.
 * Public - relies on RLS for authorization.
 */
export async function updateEvent(id: number, data: EventUpdateInput) {
  return EventsService.updateEvent(id, data)
}

/**
 * Deletes an event.
 * Public - relies on RLS for authorization.
 */
export async function deleteEvent(id: number) {
  return EventsService.deleteEvent(id)
}
