'use client'

import { Check, Plus } from 'lucide-react'
import { isNil } from 'lodash'
import type { Event } from '@/services/events'
import type { EventTypeValue } from '@/services/events/types'
import {
  EVENT_TYPE_LABELS,
  SINGLETON_EVENT_TYPES,
} from '@/services/events/types'
import type { Weekend } from '@/lib/weekend/types'
import { getEventColor, getColorByKey } from './event-colors'

interface WeekendLaneProps {
  weekend: Weekend
  events: Event[]
  color: 'blue' | 'pink'
  onEventClick: (event: Event) => void
  onScheduleSlot: (type: EventTypeValue, weekend: Weekend) => void
  canEdit: boolean
}

export function WeekendLane({
  weekend,
  events,
  color,
  onEventClick,
  onScheduleSlot,
  canEdit,
}: WeekendLaneProps) {
  const c = getColorByKey(color)
  const label = color === 'blue' ? "Men's" : "Women's"
  const dateRange = formatDateRange(weekend.start_date, weekend.end_date)

  return (
    <div className="bg-card/50 border rounded-xl overflow-hidden">
      <div
        className={`${c.laneBg} border-b px-4 py-3 flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
          <h3 className="text-sm font-semibold">{label}</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">{dateRange}</span>
      </div>
      <div className="p-3 space-y-2">
        {SINGLETON_EVENT_TYPES.map((type) => {
          const event = events.find((e) => e.type === type)
          if (!isNil(event)) {
            return (
              <FilledSlot
                key={type}
                event={event}
                onClick={() => onEventClick(event)}
              />
            )
          }
          return (
            <EmptySlot
              key={type}
              type={type}
              onClick={() => canEdit && onScheduleSlot(type, weekend)}
              canEdit={canEdit}
            />
          )
        })}
      </div>
    </div>
  )
}

function FilledSlot({ event, onClick }: { event: Event; onClick: () => void }) {
  const c = getEventColor(event.type)
  const detail = formatEventDetail(event)

  return (
    <div
      className="bg-card border rounded-lg p-3 cursor-pointer hover:border-muted-foreground/30 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${c.dot}`} />
          <span className="text-sm font-medium">
            {!isNil(event.type) ? EVENT_TYPE_LABELS[event.type] : event.title}
          </span>
        </div>
        <Check className="w-3.5 h-3.5 text-green-500" />
      </div>
      {!isNil(detail) && (
        <div className="text-xs text-muted-foreground">{detail}</div>
      )}
    </div>
  )
}

function EmptySlot({
  type,
  onClick,
  canEdit,
}: {
  type: EventTypeValue
  onClick: () => void
  canEdit: boolean
}) {
  const c = getEventColor(type)
  return (
    <div
      className={`border border-dashed rounded-lg p-3 transition-colors group ${canEdit ? 'cursor-pointer hover:bg-accent/50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full border ${c.dotBorder}`} />
          <span className="text-sm text-muted-foreground">
            {EVENT_TYPE_LABELS[type]}
          </span>
        </div>
        {canEdit && (
          <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
            <Plus className="w-3 h-3" />
            Schedule
          </span>
        )}
      </div>
    </div>
  )
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const startStr = s.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  const endStr = e.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  return `${startStr} - ${endStr}`
}

function formatEventDetail(event: Event): string | null {
  if (isNil(event.datetime)) return null
  const date = new Date(event.datetime)
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Chicago',
  })
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Chicago',
  })
  const parts = [dateStr, timeStr]
  if (!isNil(event.location)) parts.push(event.location)
  return parts.join(' · ')
}
