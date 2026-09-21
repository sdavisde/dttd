'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { isNil } from 'lodash'
import type { Event } from '@/services/events'
import { EVENT_TYPE_LABELS } from '@/services/events/types'
import {
  getEventScope,
  scopeLabel,
  SCOPE_CHIP_CLASSES,
  type ScopeContext,
} from './event-scope'
import {
  CENTRAL_TIME,
  buildMonthCells,
  groupEventsByDay,
  MONTH_LABELS,
  stepMonth as stepMonthView,
  todayInCommunityTz,
} from './month-grid'

interface MonthAgendaProps {
  events: Event[]
  scopeContext: ScopeContext
  groupNumber: number | null
  canEdit: boolean
  onEventClick: (event: Event) => void
}

/**
 * The phone stand-in for `MonthCalendar`. A 7-column month grid can't hold
 * event titles at phone width, so the same month is read as a day-by-day
 * agenda instead — same months, same scope colours, same edit sidebar.
 */
export function MonthAgenda({
  events,
  scopeContext,
  groupNumber,
  canEdit,
  onEventClick,
}: MonthAgendaProps) {
  const [view, setView] = useState(todayInCommunityTz)

  const eventsByDay = groupEventsByDay(events)
  const { cells } = buildMonthCells(view.year, view.month)
  const days = cells
    .filter((cell) => cell.inMonth)
    .map((cell) => ({ ...cell, events: eventsByDay.get(cell.key) ?? [] }))
    .filter((day) => day.events.length > 0)

  const stepMonth = (delta: number) => {
    setView((current) => stepMonthView(current, delta))
  }

  return (
    <div className="overflow-hidden rounded-md border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-divider px-2 py-1.5">
        <button
          type="button"
          aria-label="Previous month"
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          onClick={() => stepMonth(-1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="min-w-0 truncate font-serif text-lg font-semibold tracking-tight">
          {MONTH_LABELS[view.month]} {view.year}
        </h2>
        <button
          type="button"
          aria-label="Next month"
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          onClick={() => stepMonth(1)}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {days.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          Nothing scheduled in {MONTH_LABELS[view.month]}.
        </p>
      )}

      <ul className="divide-y divide-divider">
        {days.map((day) => (
          <li key={day.key} className="flex gap-3 px-3 py-3">
            <DayChip dayKeyValue={day.key} />
            <ul className="min-w-0 flex-1 space-y-1.5">
              {day.events.map((event) => (
                <li key={event.id}>
                  <AgendaEvent
                    event={event}
                    scopeContext={scopeContext}
                    groupNumber={groupNumber}
                    canEdit={canEdit}
                    onEventClick={onEventClick}
                  />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Weekday + day number for a "YYYY-MM-DD" key, read as a local date. */
function DayChip({ dayKeyValue }: { dayKeyValue: string }) {
  const [year, month, day] = dayKeyValue.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return (
    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md border bg-background">
      <span className="text-[9px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
        {date.toLocaleDateString('en-US', { weekday: 'short' })}
      </span>
      <span className="font-serif text-base leading-none font-semibold tabular-nums">
        {day}
      </span>
    </div>
  )
}

function AgendaEvent({
  event,
  scopeContext,
  groupNumber,
  canEdit,
  onEventClick,
}: {
  event: Event
  scopeContext: ScopeContext
  groupNumber: number | null
  canEdit: boolean
  onEventClick: (event: Event) => void
}) {
  const scope = getEventScope(event, scopeContext)
  const label =
    event.title ??
    (isNil(event.type) ? 'Untitled' : EVENT_TYPE_LABELS[event.type])
  const time = isNil(event.datetime)
    ? null
    : new Date(event.datetime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: CENTRAL_TIME,
      })
  const detail = [time, event.location]
    .filter((part) => !isNil(part))
    .join(' · ')

  return (
    <button
      type="button"
      disabled={!canEdit}
      onClick={() => canEdit && onEventClick(event)}
      className={`flex min-h-11 w-full items-center gap-2 rounded-md border px-3 py-2 text-left ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{label}</span>
        {detail !== '' && (
          <span className="block truncate text-[12.5px] text-muted-foreground">
            {detail}
          </span>
        )}
      </span>
      <span
        className={`shrink-0 rounded-md px-2 py-0.5 text-[11.5px] font-semibold ${SCOPE_CHIP_CLASSES[scope]}`}
      >
        {scopeLabel(scope, groupNumber)}
      </span>
    </button>
  )
}
