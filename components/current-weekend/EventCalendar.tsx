'use client'

import * as React from 'react'
import { Calendar } from '@/components/ui/calendar'
import {
  Event,
  EVENT_TYPE_COLORS,
  EventTypeValue,
} from '@/services/events/types'
import { cn } from '@/lib/utils'
import { format, isSameDay, parseISO } from 'date-fns'

/**
 * Groups events by their date string (YYYY-MM-DD) for efficient calendar lookup
 */
export function getEventsGroupedByDate(events: Event[]): Map<string, Event[]> {
  const grouped = new Map<string, Event[]>()

  for (const event of events) {
    if (!event.datetime) continue

    const dateKey = format(parseISO(event.datetime), 'yyyy-MM-dd')
    const existing = grouped.get(dateKey) ?? []
    grouped.set(dateKey, [...existing, event])
  }

  return grouped
}

interface EventCalendarProps {
  events: Event[]
  onDateClick?: (date: Date, events: Event[]) => void
  className?: string
}

/**
 * Calendar component that displays events with color-coded dot indicators.
 * Supports month navigation and click-to-scroll functionality.
 */
export function EventCalendar({
  events,
  onDateClick,
  className,
}: EventCalendarProps) {
  const [month, setMonth] = React.useState<Date>(new Date())
  const eventsByDate = React.useMemo(
    () => getEventsGroupedByDate(events),
    [events]
  )

  const handleDayClick = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd')
    const dayEvents = eventsByDate.get(dateKey) ?? []
    if (dayEvents.length > 0 && onDateClick) {
      onDateClick(day, dayEvents)
    }
  }

  return (
    <Calendar
      mode="single"
      month={month}
      onMonthChange={setMonth}
      className={cn('w-full [--cell-size:theme(spacing.12)]', className)}
      classNames={{
        root: 'w-full',
        months: 'w-full',
        month: 'w-full',
        month_caption: 'w-full flex items-center justify-center h-12',
        month_grid: 'w-full',
        weekdays: 'flex w-full',
        weekday: 'flex-1 text-center text-muted-foreground font-normal text-sm',
        weeks: 'w-full',
        week: 'flex w-full mt-2',
        day: 'flex-1 aspect-square p-0',
      }}
      modifiers={{
        hasEvents: (date) => {
          const dateKey = format(date, 'yyyy-MM-dd')
          return eventsByDate.has(dateKey)
        },
      }}
      components={{
        DayButton: ({ day, modifiers }) => {
          const dateKey = format(day.date, 'yyyy-MM-dd')
          const dayEvents = eventsByDate.get(dateKey) ?? []
          const isToday = isSameDay(day.date, new Date())

          return (
            <button
              type="button"
              onClick={() => handleDayClick(day.date)}
              className={cn(
                'relative flex flex-col items-center justify-center w-full h-full p-1',
                'hover:bg-accent hover:text-accent-foreground rounded-md transition-colors',
                isToday && 'bg-accent ring-2 ring-primary ring-offset-1',
                modifiers.outside && 'text-muted-foreground opacity-50',
                modifiers.disabled &&
                  'text-muted-foreground opacity-50 pointer-events-none'
              )}
              disabled={modifiers.disabled}
            >
              <span className="text-sm">{day.date.getDate()}</span>
              {dayEvents.length > 0 && <EventDots events={dayEvents} />}
            </button>
          )
        },
      }}
    />
  )
}

interface EventDotsProps {
  events: Event[]
  maxDots?: number
}

/**
 * Renders horizontally stacked color-coded dots for events on a calendar day.
 * Shows up to maxDots events, with remaining count as a number if exceeded.
 */
function EventDots({ events, maxDots = 3 }: EventDotsProps) {
  const displayEvents = events.slice(0, maxDots)
  const remainingCount = events.length - maxDots

  return (
    <div className="flex items-center justify-center gap-0.5 mt-0.5">
      {displayEvents.map((event, index) => (
        <span
          key={event.id || index}
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            getEventDotColor(event.type)
          )}
          title={event.title ?? undefined}
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-[8px] text-muted-foreground ml-0.5">
          +{remainingCount}
        </span>
      )}
    </div>
  )
}

/**
 * Returns the Tailwind background color class for an event type
 */
function getEventDotColor(type: EventTypeValue | null): string {
  if (!type) return EVENT_TYPE_COLORS.other
  return EVENT_TYPE_COLORS[type] || EVENT_TYPE_COLORS.other
}
