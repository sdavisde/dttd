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
  SCOPE_DOT_CLASSES,
  type ScopeContext,
} from './event-scope'

const CENTRAL_TIME = 'America/Chicago'
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

interface MonthCalendarProps {
  events: Event[]
  scopeContext: ScopeContext
  groupNumber: number | null
  canEdit: boolean
  onEventClick: (event: Event) => void
}

/** "YYYY-MM-DD" for an event's datetime, in the community's timezone. */
function eventDayKey(datetime: string): string {
  return new Date(datetime).toLocaleDateString('en-CA', {
    timeZone: CENTRAL_TIME,
  })
}

function dayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function MonthCalendar({
  events,
  scopeContext,
  groupNumber,
  canEdit,
  onEventClick,
}: MonthCalendarProps) {
  const todayParts = new Date()
    .toLocaleDateString('en-CA', { timeZone: CENTRAL_TIME })
    .split('-')
  const [view, setView] = useState({
    year: Number(todayParts[0]),
    month: Number(todayParts[1]) - 1,
  })

  const eventsByDay = new Map<string, Event[]>()
  for (const event of events) {
    if (isNil(event.datetime)) continue
    const key = eventDayKey(event.datetime)
    eventsByDay.set(key, [...(eventsByDay.get(key) ?? []), event])
  }

  const firstDow = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const daysInPrevMonth = new Date(view.year, view.month, 0).getDate()
  const weekCount = Math.ceil((firstDow + daysInMonth) / 7)

  const cells: Array<{ day: number; inMonth: boolean; key: string }> = []
  for (let i = 0; i < weekCount * 7; i++) {
    const offset = i - firstDow
    if (offset < 0) {
      const day = daysInPrevMonth + offset + 1
      const [y, m] =
        view.month === 0 ? [view.year - 1, 11] : [view.year, view.month - 1]
      cells.push({ day, inMonth: false, key: dayKey(y, m, day) })
    } else if (offset >= daysInMonth) {
      const day = offset - daysInMonth + 1
      const [y, m] =
        view.month === 11 ? [view.year + 1, 0] : [view.year, view.month + 1]
      cells.push({ day, inMonth: false, key: dayKey(y, m, day) })
    } else {
      cells.push({
        day: offset + 1,
        inMonth: true,
        key: dayKey(view.year, view.month, offset + 1),
      })
    }
  }

  const stepMonth = (delta: number) => {
    setView(({ year, month }) => {
      const next = month + delta
      if (next < 0) return { year: year - 1, month: 11 }
      if (next > 11) return { year: year + 1, month: 0 }
      return { year, month: next }
    })
  }

  return (
    <div className="overflow-hidden rounded-md border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous month"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => stepMonth(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-serif text-lg font-semibold tracking-tight">
            {MONTH_LABELS[view.month]} {view.year}
          </h2>
          <button
            type="button"
            aria-label="Next month"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => stepMonth(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3.5 text-[12.5px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${SCOPE_DOT_CLASSES.both}`}
            />
            Both weekends
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${SCOPE_DOT_CLASSES.mens}`}
            />
            {scopeLabel('mens', groupNumber)}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${SCOPE_DOT_CLASSES.womens}`}
            />
            {scopeLabel('womens', groupNumber)}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${SCOPE_DOT_CLASSES.community}`}
            />
            Community
          </span>
        </div>
      </div>
      <div className="grid grid-cols-7">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="border-b px-2.5 py-2 text-[11.5px] font-semibold tracking-wider text-muted-foreground uppercase"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const dayEvents = eventsByDay.get(cell.key) ?? []
          const lastRow = i >= (weekCount - 1) * 7
          return (
            <div
              key={cell.key}
              className={`flex min-h-19 flex-col gap-1 border-divider p-2 ${lastRow ? '' : 'border-b'} ${(i + 1) % 7 === 0 ? '' : 'border-r'}`}
            >
              <span
                className={`text-[12.5px] font-semibold tabular-nums ${cell.inMonth ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}
              >
                {cell.day}
              </span>
              {dayEvents.map((event) => {
                const scope = getEventScope(event, scopeContext)
                const label =
                  event.title ??
                  (isNil(event.type)
                    ? 'Untitled'
                    : EVENT_TYPE_LABELS[event.type])
                return (
                  <button
                    key={event.id}
                    type="button"
                    title={label}
                    disabled={!canEdit}
                    className={`truncate rounded-md px-2 py-0.5 text-left text-[11.5px] font-semibold ${SCOPE_CHIP_CLASSES[scope]} ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => canEdit && onEventClick(event)}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
