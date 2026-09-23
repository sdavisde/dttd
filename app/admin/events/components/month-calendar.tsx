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
import {
  buildMonthCells,
  DAY_EVENT_LIMIT,
  DAY_LABELS,
  groupEventsByDay,
  MONTH_LABELS,
  splitDayEvents,
  stepMonth as stepMonthView,
  todayInCommunityTz,
  todayKeyInCommunityTz,
} from './month-grid'

/** Shared by both month-nav arrows: a real 28px target, not a bare glyph. */
const NAV_BUTTON_CLASSES =
  'inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none'

interface MonthCalendarProps {
  events: Event[]
  scopeContext: ScopeContext
  groupNumber: number | null
  canEdit: boolean
  onEventClick: (event: Event) => void
}

export function MonthCalendar({
  events,
  scopeContext,
  groupNumber,
  canEdit,
  onEventClick,
}: MonthCalendarProps) {
  const [view, setView] = useState(todayInCommunityTz)
  // Snapshot today once per mount: react-compiler treats reading the clock in
  // render as impure, and the marker doesn't need to tick over at midnight.
  const [todayKey] = useState(todayKeyInCommunityTz)
  // At most one day is opened out at a time — the cell that was clicked.
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const eventsByDay = groupEventsByDay(events)
  const { cells, weekCount } = buildMonthCells(view.year, view.month)

  const stepMonth = (delta: number) => {
    setView((current) => stepMonthView(current, delta))
    setExpandedDay(null)
  }

  return (
    <div className="overflow-hidden rounded-md border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous month"
            className={NAV_BUTTON_CLASSES}
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
            className={NAV_BUTTON_CLASSES}
            onClick={() => stepMonth(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3.5 text-[12.5px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className={`h-[9px] w-[9px] shrink-0 rounded-full ${SCOPE_DOT_CLASSES.both}`}
            />
            Both weekends
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`h-[9px] w-[9px] shrink-0 rounded-full ${SCOPE_DOT_CLASSES.mens}`}
            />
            {scopeLabel('mens', groupNumber)}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`h-[9px] w-[9px] shrink-0 rounded-full ${SCOPE_DOT_CLASSES.womens}`}
            />
            {scopeLabel('womens', groupNumber)}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className={`h-[9px] w-[9px] shrink-0 rounded-full ${SCOPE_DOT_CLASSES.community}`}
            />
            Community
          </span>
        </div>
      </div>
      <div className="grid grid-cols-7">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="border-b px-2.5 py-2 text-[11.5px] font-semibold tracking-[0.08em] text-muted-foreground/80 uppercase"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const dayEvents = eventsByDay.get(cell.key) ?? []
          const lastRow = i >= (weekCount - 1) * 7
          const isToday = cell.key === todayKey
          const isExpanded = expandedDay === cell.key
          const { visible, hiddenCount } = splitDayEvents(dayEvents, isExpanded)
          return (
            <div
              key={cell.key}
              className={`flex min-h-[78px] flex-col gap-1 border-divider p-2 ${lastRow ? '' : 'border-b'} ${(i + 1) % 7 === 0 ? '' : 'border-r'}`}
            >
              <span
                aria-current={isToday ? 'date' : undefined}
                className={
                  isToday
                    ? 'inline-flex h-5 min-w-5 items-center justify-center self-start rounded-full bg-primary px-1.5 text-[12.5px] font-semibold text-primary-foreground tabular-nums'
                    : `self-start text-[12.5px] font-semibold tabular-nums ${cell.inMonth ? 'text-muted-foreground' : 'text-muted-foreground/50'}`
                }
              >
                {cell.label}
              </span>
              {visible.map((event) => {
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
                    className={`truncate rounded-md px-2 py-[3px] text-left text-[11.5px] font-semibold transition focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none ${SCOPE_CHIP_CLASSES[scope]} ${canEdit ? 'cursor-pointer hover:brightness-95' : 'cursor-default'}`}
                    onClick={() => canEdit && onEventClick(event)}
                  >
                    {label}
                  </button>
                )
              })}
              {/* A busy day would otherwise stretch its whole week row. */}
              {hiddenCount > 0 && (
                <button
                  type="button"
                  className="cursor-pointer self-start px-2 text-left text-[11.5px] font-semibold text-primary hover:text-primary-hover"
                  onClick={() => setExpandedDay(cell.key)}
                >
                  +{hiddenCount} more
                </button>
              )}
              {isExpanded && dayEvents.length > DAY_EVENT_LIMIT && (
                <button
                  type="button"
                  className="cursor-pointer self-start px-2 text-left text-[11.5px] font-semibold text-primary hover:text-primary-hover"
                  onClick={() => setExpandedDay(null)}
                >
                  Show less
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
