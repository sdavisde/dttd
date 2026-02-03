'use client'

import { forwardRef, useEffect, useRef } from 'react'
import { type Event } from '@/services/events'
import { WeekendEventCard } from './WeekendEventCard'
import { EmptyEventsState } from './EmptyEventsState'
import { compareAsc, parseISO, format } from 'date-fns'

interface EventListProps {
  events: Event[]
  className?: string
  selectedDate?: string | null // Format: YYYY-MM-DD
}

/**
 * Generates the element ID for an event for scroll targeting
 */
export function getEventElementId(eventId: number): string {
  return `event-${eventId}`
}

/**
 * Scrolls to a specific event in the list using smooth scrolling
 */
export function scrollToEvent(eventId: number): void {
  const elementId = getEventElementId(eventId)
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

/**
 * Sorts events chronologically by start datetime
 */
function sortEventsByDate(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    if (!a.datetime && !b.datetime) return 0
    if (!a.datetime) return 1
    if (!b.datetime) return -1
    return compareAsc(parseISO(a.datetime), parseISO(b.datetime))
  })
}

/**
 * Gets the date string (YYYY-MM-DD) for an event
 */
function getEventDateKey(event: Event): string | null {
  if (!event.datetime) return null
  return format(parseISO(event.datetime), 'yyyy-MM-dd')
}

/**
 * Event list component that displays events in chronological order
 * with scroll targeting support via element IDs.
 */
export const EventList = forwardRef<HTMLDivElement, EventListProps>(
  function EventList({ events, className, selectedDate }, ref) {
    const hasScrolledRef = useRef<string | null>(null)

    // Scroll to first event on selected date when it changes
    useEffect(() => {
      if (selectedDate && selectedDate !== hasScrolledRef.current) {
        // Find the first event on the selected date
        const firstEventOnDate = events.find(
          (event) => getEventDateKey(event) === selectedDate
        )
        if (firstEventOnDate) {
          scrollToEvent(firstEventOnDate.id)
          hasScrolledRef.current = selectedDate
        }
      }
    }, [selectedDate, events])

    if (events.length === 0) {
      return <EmptyEventsState />
    }

    const sortedEvents = sortEventsByDate(events)

    return (
      <div ref={ref} className={className}>
        <div className="space-y-3">
          {sortedEvents.map((event) => (
            <WeekendEventCard
              key={event.id}
              event={event}
              id={getEventElementId(event.id)}
              selected={getEventDateKey(event) === selectedDate}
            />
          ))}
        </div>
      </div>
    )
  }
)
