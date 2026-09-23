'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react'
import { isNil } from 'lodash'
import type { Event } from '@/services/events'
import { getPastEvents } from '@/services/events'
import { isErr } from '@/lib/results'
import { EVENT_TYPE_LABELS } from '@/services/events/types'

interface PastEventsSectionProps {
  /** Open state lives with the parent so the page header can open it too. */
  isOpen: boolean
  onToggle: () => void
  /** Increment to scroll the section into view. */
  scrollSignal?: number
}

export function PastEventsSection({
  isOpen,
  onToggle,
  scrollSignal = 0,
}: PastEventsSectionProps) {
  const [events, setEvents] = useState<Event[] | null>(null)
  const [isPending, startTransition] = useTransition()
  const sectionRef = useRef<HTMLDivElement>(null)
  const hasRequestedRef = useRef(false)

  useEffect(() => {
    if (!isOpen || hasRequestedRef.current) return
    hasRequestedRef.current = true
    startTransition(async () => {
      const result = await getPastEvents()
      setEvents(isErr(result) ? [] : result.data)
    })
  }, [isOpen])

  useEffect(() => {
    if (scrollSignal > 0) {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [scrollSignal])

  return (
    <div ref={sectionRef} className="mt-8 scroll-mt-6 border-t pt-6">
      <button
        className="group flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        onClick={onToggle}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        )}
        <span className="text-xs font-semibold tracking-wider uppercase">
          Past events
        </span>
        {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
        {!isOpen && !isPending && (
          <span className="text-xs text-muted-foreground/60">
            Click to load
          </span>
        )}
      </button>

      {isOpen && events !== null && (
        <div className="mt-4 overflow-hidden rounded-md border bg-card">
          {events.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No past events
            </p>
          )}
          {events.map((event, i) => (
            <PastEventRow
              key={event.id}
              event={event}
              isLast={i === events.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PastEventRow({ event, isLast }: { event: Event; isLast: boolean }) {
  const date = !isNil(event.datetime)
    ? new Date(event.datetime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'America/Chicago',
      })
    : null

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${isLast ? '' : 'border-b border-divider'}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-medium">{event.title ?? 'Untitled'}</span>
        {!isNil(event.type) && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11.5px] font-semibold text-muted-foreground">
            {EVENT_TYPE_LABELS[event.type]}
          </span>
        )}
      </div>
      {!isNil(date) && (
        <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
          {date}
        </span>
      )}
    </div>
  )
}
