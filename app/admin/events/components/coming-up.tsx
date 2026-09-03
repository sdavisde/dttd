'use client'

import { useState } from 'react'
import { isNil } from 'lodash'
import type { Event } from '@/services/events'
import { EVENT_TYPE_LABELS } from '@/services/events/types'
import {
  getEventScope,
  scopeLabel,
  SCOPE_CHIP_CLASSES,
  type ScopeContext,
} from './event-scope'

const CENTRAL_TIME = 'America/Chicago'
const UPCOMING_LIMIT = 4

interface ComingUpProps {
  events: Event[]
  scopeContext: ScopeContext
  groupNumber: number | null
  canEdit: boolean
  onEventClick: (event: Event) => void
}

/** The board's "Coming up" card: date-chip rows for the next gatherings. */
export function ComingUp({
  events,
  scopeContext,
  groupNumber,
  canEdit,
  onEventClick,
}: ComingUpProps) {
  // Snapshot "now" once per mount — react-compiler treats Date.now() in
  // render as impure, and the cutoff doesn't need to tick live.
  const [now] = useState(() => Date.now())
  const upcoming = events
    .filter((e) => !isNil(e.datetime) && new Date(e.datetime).getTime() >= now)
    .sort((a, b) => (a.datetime ?? '').localeCompare(b.datetime ?? ''))
    .slice(0, UPCOMING_LIMIT)

  return (
    <div className="flex flex-col rounded-md border bg-card px-5 py-4.5">
      <h2 className="pb-1 font-serif text-lg font-semibold tracking-tight">
        Coming up
      </h2>
      {upcoming.length === 0 && (
        <p className="py-2 text-sm text-muted-foreground">
          Nothing on the calendar yet.
        </p>
      )}
      {upcoming.map((event, i) => {
        const scope = getEventScope(event, scopeContext)
        const date = new Date(event.datetime as string)
        const monthAbbr = date.toLocaleDateString('en-US', {
          month: 'short',
          timeZone: CENTRAL_TIME,
        })
        const dayNum = date.toLocaleDateString('en-US', {
          day: 'numeric',
          timeZone: CENTRAL_TIME,
        })
        const weekday = date.toLocaleDateString('en-US', {
          weekday: 'long',
          timeZone: CENTRAL_TIME,
        })
        const time = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: CENTRAL_TIME,
        })
        const detail = [
          `${weekday} ${time}`,
          ...(isNil(event.location) ? [] : [event.location]),
        ].join(' · ')
        const label =
          event.title ??
          (isNil(event.type) ? 'Untitled' : EVENT_TYPE_LABELS[event.type])

        return (
          <div
            key={event.id}
            className={`flex items-center gap-3 py-2.5 ${i === upcoming.length - 1 ? '' : 'border-b border-divider'} ${canEdit ? 'cursor-pointer' : ''}`}
            onClick={() => canEdit && onEventClick(event)}
          >
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md border bg-background">
              <span className="text-[9px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
                {monthAbbr}
              </span>
              <span className="font-serif text-base leading-none font-semibold tabular-nums">
                {dayNum}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{label}</p>
              <p className="truncate text-[12.5px] text-muted-foreground">
                {detail}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-[11.5px] font-semibold ${SCOPE_CHIP_CLASSES[scope]}`}
            >
              {scopeLabel(scope, groupNumber)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
