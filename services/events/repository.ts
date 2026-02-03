import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { Result, err, ok } from '@/lib/results'
import { isSupabaseError } from '@/lib/supabase/utils'
import { addMonths } from 'date-fns'
import { RawEventRecord, EventCreateInput, EventUpdateInput } from './types'
import { isNil } from 'lodash'

/**
 * Fetches all events, optionally sorted by a field.
 */
export async function findAllEvents(
  orderBy: 'datetime' | 'created_at' = 'datetime'
): Promise<Result<string, RawEventRecord[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order(orderBy, { ascending: true })

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data ?? [])
}

/**
 * Fetches a single event by ID.
 */
export async function findEventById(
  id: number
): Promise<Result<string, RawEventRecord | null>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data)
}

/**
 * Fetches upcoming events (datetime >= now).
 */
export async function findUpcomingEvents(): Promise<
  Result<string, RawEventRecord[]>
> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('datetime', now)
    .order('datetime', { ascending: true })

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data ?? [])
}

/**
 * Fetches past events (datetime < now).
 */
export async function findPastEvents(): Promise<
  Result<string, RawEventRecord[]>
> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .lt('datetime', now)
    .order('datetime', { ascending: false })

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data ?? [])
}

/**
 * Fetches events within a specified future time period.
 */
export async function findEventsForPeriod(
  months: number
): Promise<Result<string, RawEventRecord[]>> {
  const supabase = await createClient()
  const now = new Date()
  const futureDate = addMonths(now, months)

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('datetime', now.toISOString())
    .lte('datetime', futureDate.toISOString())
    .order('datetime', { ascending: true })

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data ?? [])
}

/**
 * Fetches events for specific weekend IDs.
 */
export async function findEventsByWeekendIds(
  weekendIds: string[]
): Promise<Result<string, RawEventRecord[]>> {
  if (weekendIds.length === 0) {
    return ok([])
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .in('weekend_id', weekendIds)
    .order('datetime', { ascending: true })

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(data ?? [])
}

/**
 * Fetches weekend IDs for a given group ID.
 */
export async function findWeekendIdsByGroupId(
  groupId: string
): Promise<Result<string, string[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weekends')
    .select('id')
    .eq('group_id', groupId)

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok((data ?? []).map((w) => w.id))
}

/**
 * Inserts a new event.
 */
export async function insertEvent(
  data: EventCreateInput
): Promise<Result<string, RawEventRecord>> {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .insert(data)
    .select()
    .single()

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  if (isNil(event)) {
    return err('Event not found')
  }

  return ok(event)
}

/**
 * Updates an event by ID.
 */
export async function updateEventById(
  id: number,
  data: EventUpdateInput
): Promise<Result<string, RawEventRecord>> {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  if (isNil(event)) {
    return err('Event not found')
  }

  return ok(event)
}

/**
 * Deletes an event by ID.
 */
export async function deleteEventById(
  id: number
): Promise<Result<string, void>> {
  const supabase = await createClient()

  const { error } = await supabase.from('events').delete().eq('id', id)

  if (isSupabaseError(error)) {
    return err(error.message)
  }

  return ok(undefined)
}
