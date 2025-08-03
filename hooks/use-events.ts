'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getEvents, 
  getEvent, 
  getUpcomingEvents, 
  getPastEvents,
  createEvent, 
  updateEvent, 
  deleteEvent,
  type Event,
  type EventInsert,
  type EventUpdate 
} from '@/actions/events'
import { isErr } from '@/lib/results'

const EVENTS_QUERY_KEY = 'events'
const EVENT_QUERY_KEY = 'event'
const UPCOMING_EVENTS_QUERY_KEY = 'upcoming-events'
const PAST_EVENTS_QUERY_KEY = 'past-events'

export function useEvents(orderBy: 'datetime' | 'created_at' = 'datetime') {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, orderBy],
    queryFn: async () => {
      const result = await getEvents(orderBy)
      if (isErr(result)) {
        throw new Error(result.error.message)
      }
      return result.data
    },
  })
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: [EVENT_QUERY_KEY, id],
    queryFn: async () => {
      const result = await getEvent(id)
      if (isErr(result)) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    enabled: !!id,
  })
}

export function useUpcomingEvents() {
  return useQuery({
    queryKey: [UPCOMING_EVENTS_QUERY_KEY],
    queryFn: async () => {
      const result = await getUpcomingEvents()
      if (isErr(result)) {
        throw new Error(result.error.message)
      }
      return result.data
    },
  })
}

export function usePastEvents() {
  return useQuery({
    queryKey: [PAST_EVENTS_QUERY_KEY],
    queryFn: async () => {
      const result = await getPastEvents()
      if (isErr(result)) {
        throw new Error(result.error.message)
      }
      return result.data
    },
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<EventInsert, 'id' | 'created_at'>) => {
      const result = await createEvent(data)
      if (isErr(result)) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    onSuccess: (newEvent) => {
      // Invalidate all events queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [UPCOMING_EVENTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [PAST_EVENTS_QUERY_KEY] })
      
      // Set the individual event query data
      queryClient.setQueryData([EVENT_QUERY_KEY, newEvent.id], newEvent)
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Omit<EventUpdate, 'id' | 'created_at'> }) => {
      const result = await updateEvent(id, data)
      if (isErr(result)) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    onSuccess: (updatedEvent) => {
      // Update the individual event query data
      queryClient.setQueryData([EVENT_QUERY_KEY, updatedEvent.id], updatedEvent)
      
      // Update events in the list queries
      queryClient.setQueryData([EVENTS_QUERY_KEY, 'datetime'], (oldData: Event[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map((event) => event.id === updatedEvent.id ? updatedEvent : event)
      })
      
      queryClient.setQueryData([EVENTS_QUERY_KEY, 'created_at'], (oldData: Event[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map((event) => event.id === updatedEvent.id ? updatedEvent : event)
      })
      
      // Invalidate upcoming and past events to refetch (datetime might have changed)
      queryClient.invalidateQueries({ queryKey: [UPCOMING_EVENTS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [PAST_EVENTS_QUERY_KEY] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteEvent(id)
      if (isErr(result)) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    onSuccess: (_, deletedId) => {
      // Remove the event from individual query
      queryClient.removeQueries({ queryKey: [EVENT_QUERY_KEY, deletedId] })
      
      // Remove from list queries
      queryClient.setQueryData([EVENTS_QUERY_KEY, 'datetime'], (oldData: Event[] | undefined) => {
        if (!oldData) return oldData
        return oldData.filter((event) => event.id !== deletedId)
      })
      
      queryClient.setQueryData([EVENTS_QUERY_KEY, 'created_at'], (oldData: Event[] | undefined) => {
        if (!oldData) return oldData
        return oldData.filter((event) => event.id !== deletedId)
      })
      
      // Remove from upcoming and past events
      queryClient.setQueryData([UPCOMING_EVENTS_QUERY_KEY], (oldData: Event[] | undefined) => {
        if (!oldData) return oldData
        return oldData.filter((event) => event.id !== deletedId)
      })
      
      queryClient.setQueryData([PAST_EVENTS_QUERY_KEY], (oldData: Event[] | undefined) => {
        if (!oldData) return oldData
        return oldData.filter((event) => event.id !== deletedId)
      })
    },
  })
}