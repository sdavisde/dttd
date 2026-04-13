'use client'

import { useState, useTransition } from 'react'
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react'
import { isNil } from 'lodash'
import type { Event } from '@/services/events'
import { getPastEvents } from '@/services/events'
import { isErr } from '@/lib/results'
import { EVENT_TYPE_LABELS } from '@/services/events/types'
import { getEventColor } from './event-colors'

export function PastEventsSection() {
  const [isOpen, setIsOpen] = useState(false)
  const [events, setEvents] = useState<Event[] | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    if (!isOpen && events === null) {
      startTransition(async () => {
        const result = await getPastEvents()
        if (!isErr(result)) {
          setEvents(result.data)
        } else {
          setEvents([])
        }
      })
    }
    setIsOpen(!isOpen)
  }

  return (
    <div className="mt-8 border-t pt-6">
      <button
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
        onClick={handleToggle}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        )}
        <span>Past Events</span>
        {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
        {!isOpen && !isPending && (
          <span className="text-xs text-muted-foreground/60">
            Click to load
          </span>
        )}
      </button>

      {isOpen && events !== null && (
        <div className="mt-4 space-y-2">
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground">No past events</p>
          )}
          {events.map((event) => (
            <PastEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

function PastEventCard({ event }: { event: Event }) {
  const c = getEventColor(event.type)
  const date = !isNil(event.datetime)
    ? new Date(event.datetime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'America/Chicago',
      })
    : null

  return (
    <div className="flex items-center bg-card border rounded-lg overflow-hidden opacity-60">
      <div className={`w-1 self-stretch ${c.barBg}`} />
      <div className="flex-1 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {event.title ?? 'Untitled'}
          </span>
          {!isNil(event.type) && (
            <span className={`text-[10px] ${c.badge} px-1.5 py-0.5 rounded`}>
              {EVENT_TYPE_LABELS[event.type]}
            </span>
          )}
        </div>
        {!isNil(date) && (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {date}
          </span>
        )}
      </div>
    </div>
  )
}
