'use server'

import { createClient } from '@/lib/supabase/server'
import { Tables, TablesInsert, TablesUpdate } from '@/database.types'
import { Result, err, ok } from '@/lib/results'

export type Event = Tables<'events'>
export type EventInsert = TablesInsert<'events'>
export type EventUpdate = TablesUpdate<'events'>

/**
 * Create a new event
 */
export async function createEvent(data: Omit<EventInsert, 'id' | 'created_at'>): Promise<Result<Error, Event>> {
  try {
    const supabase = await createClient()

    const { data: event, error } = await supabase
      .from('events')
      .insert(data)
      .select()
      .single()

    if (error) {
      return err(new Error(`Failed to create event: ${error.message}`))
    }

    return ok(event)
  } catch (error) {
    return err(new Error(`Error while creating event: ${error instanceof Error ? error.message : 'Unknown error'}`))
  }
}

/**
 * Get a single event by ID
 */
export async function getEvent(id: number): Promise<Result<Error, Event>> {
  try {
    const supabase = await createClient()

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return err(new Error(`Failed to get event: ${error.message}`))
    }

    return ok(event)
  } catch (error) {
    return err(new Error(`Error while getting event: ${error instanceof Error ? error.message : 'Unknown error'}`))
  }
}

/**
 * Get all events, optionally sorted by datetime
 */
export async function getEvents(orderBy: 'datetime' | 'created_at' = 'datetime'): Promise<Result<Error, Event[]>> {
  try {
    const supabase = await createClient()

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order(orderBy, { ascending: true })


    if (error) {
      return err(new Error(`Failed to get events: ${error.message}`))
    }

    return ok(events || [])
  } catch (error) {
    return err(new Error(`Error while getting events: ${error instanceof Error ? error.message : 'Unknown error'}`))
  }
}

/**
 * Get upcoming events (events with datetime in the future)
 */
export async function getUpcomingEvents(): Promise<Result<Error, Event[]>> {
  try {
    const supabase = await createClient()
    const now = new Date().toISOString()

    // Now the filtered query
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .gte('datetime', now)
      .order('datetime', { ascending: true })


    if (error) {
      return err(new Error(`Failed to get upcoming events: ${error.message}`))
    }

    return ok(events || [])
  } catch (error) {
    return err(new Error(`Error while getting upcoming events: ${error instanceof Error ? error.message : 'Unknown error'}`))
  }
}

/**
 * Get past events (events with datetime in the past)
 */
export async function getPastEvents(): Promise<Result<Error, Event[]>> {
  try {
    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .lt('datetime', now)
      .order('datetime', { ascending: false })

    if (error) {
      return err(new Error(`Failed to get past events: ${error.message}`))
    }

    return ok(events || [])
  } catch (error) {
    return err(new Error(`Error while getting past events: ${error instanceof Error ? error.message : 'Unknown error'}`))
  }
}

/**
 * Update an event
 */
export async function updateEvent(id: number, data: Omit<EventUpdate, 'id' | 'created_at'>): Promise<Result<Error, Event>> {
  try {
    const supabase = await createClient()

    const { data: event, error } = await supabase
      .from('events')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return err(new Error(`Failed to update event: ${error.message}`))
    }

    return ok(event)
  } catch (error) {
    return err(new Error(`Error while updating event: ${error instanceof Error ? error.message : 'Unknown error'}`))
  }
}

/**
 * Delete an event
 */
export async function deleteEvent(id: number): Promise<Result<Error, { success: boolean }>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      return err(new Error(`Failed to delete event: ${error.message}`))
    }

    return ok({ success: true })
  } catch (error) {
    return err(new Error(`Error while deleting event: ${error instanceof Error ? error.message : 'Unknown error'}`))
  }
}