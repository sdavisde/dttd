import 'server-only'

import { isNil } from 'lodash'
import { Result, err, ok, isErr } from '@/lib/results'
import {
  Event,
  RawEventRecord,
  EventCreateInput,
  EventUpdateInput,
} from './types'
import * as EventsRepository from './repository'

// ============================================================================
// Helper Functions (Private)
// ============================================================================

/**
 * Normalizes a raw event record into the application Event type.
 */
function normalizeEvent(raw: RawEventRecord): Event {
  return {
    id: raw.id,
    title: raw.title,
    datetime: raw.datetime,
    location: raw.location,
    endDatetime: raw.end_datetime ?? null,
    weekendId: raw.weekend_id ?? null,
    type: raw.type ?? null,
    createdAt: raw.created_at,
  }
}

// ============================================================================
// Service Functions (Exported)
// ============================================================================

/**
 * Fetches all events, optionally sorted by a field.
 */
export async function getEvents(
  orderBy: 'datetime' | 'created_at' = 'datetime'
): Promise<Result<string, Event[]>> {
  const result = await EventsRepository.findAllEvents(orderBy)

  if (isErr(result)) {
    return result
  }

  return ok(result.data.map(normalizeEvent))
}

/**
 * Fetches a single event by ID.
 */
export async function getEvent(id: number): Promise<Result<string, Event>> {
  const result = await EventsRepository.findEventById(id)

  if (isErr(result)) {
    return result
  }

  if (isNil(result.data)) {
    return err('Event not found')
  }

  return ok(normalizeEvent(result.data))
}

/**
 * Fetches upcoming events (datetime >= now).
 */
export async function getUpcomingEvents(): Promise<Result<string, Event[]>> {
  const result = await EventsRepository.findUpcomingEvents()

  if (isErr(result)) {
    return result
  }

  return ok(result.data.map(normalizeEvent))
}

/**
 * Fetches past events (datetime < now).
 */
export async function getPastEvents(): Promise<Result<string, Event[]>> {
  const result = await EventsRepository.findPastEvents()

  if (isErr(result)) {
    return result
  }

  return ok(result.data.map(normalizeEvent))
}

/**
 * Fetches events within a specified future time period.
 * @param months - Number of months into the future to fetch events for
 */
export async function getUpcomingEventsForPeriod(
  months: number
): Promise<Result<string, Event[]>> {
  const result = await EventsRepository.findEventsForPeriod(months)

  if (isErr(result)) {
    return result
  }

  return ok(result.data.map(normalizeEvent))
}

/**
 * Fetches all events for a weekend group (both men's and women's weekends).
 * @param groupId - The group_id that links men's and women's weekends together
 */
export async function getEventsForWeekendGroup(
  groupId: string
): Promise<Result<string, Event[]>> {
  // First, get the weekend IDs for this group
  const weekendIdsResult =
    await EventsRepository.findWeekendIdsByGroupId(groupId)

  if (isErr(weekendIdsResult)) {
    return err(`Failed to get weekends for group: ${weekendIdsResult.error}`)
  }

  if (weekendIdsResult.data.length === 0) {
    return ok([])
  }

  // Now get all events associated with these weekends
  const eventsResult = await EventsRepository.findEventsByWeekendIds(
    weekendIdsResult.data
  )

  if (isErr(eventsResult)) {
    return err(`Failed to get events for weekend group: ${eventsResult.error}`)
  }

  return ok(eventsResult.data.map(normalizeEvent))
}

/**
 * Creates a new event.
 */
export async function createEvent(
  data: EventCreateInput
): Promise<Result<string, Event>> {
  const result = await EventsRepository.insertEvent(data)

  if (isErr(result)) {
    return err(`Failed to create event: ${result.error}`)
  }

  return ok(normalizeEvent(result.data))
}

/**
 * Updates an event.
 */
export async function updateEvent(
  id: number,
  data: EventUpdateInput
): Promise<Result<string, Event>> {
  const result = await EventsRepository.updateEventById(id, data)

  if (isErr(result)) {
    return err(`Failed to update event: ${result.error}`)
  }

  return ok(normalizeEvent(result.data))
}

/**
 * Deletes an event.
 */
export async function deleteEvent(
  id: number
): Promise<Result<string, { success: boolean }>> {
  const result = await EventsRepository.deleteEventById(id)

  if (isErr(result)) {
    return err(`Failed to delete event: ${result.error}`)
  }

  return ok({ success: true })
}
