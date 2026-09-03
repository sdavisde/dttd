'use client'

import { Plus } from 'lucide-react'
import { isNil } from 'lodash'
import type { Event } from '@/services/events'

interface CommunitySidebarProps {
  events: Event[]
  onEventClick: (event: Event) => void
  onAddEvent: () => void
  canEdit: boolean
}

export function CommunitySidebar({
  events,
  onEventClick,
  onAddEvent,
  canEdit,
}: CommunitySidebarProps) {
  return (
    <div className="w-full md:w-64 flex-shrink-0">
      <div className="md:sticky md:top-8">
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <h2 className="text-sm font-semibold">Community</h2>
            </div>
            {canEdit && (
              <button
                className="text-[10px] text-primary hover:underline cursor-pointer flex items-center gap-1"
                onClick={onAddEvent}
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            )}
          </div>

          <div className="p-3 space-y-2">
            {events.length === 0 && (
              <p className="text-xs text-muted-foreground py-2 text-center">
                No upcoming community events
              </p>
            )}
            {events.map((event) => (
              <CommunityCard
                key={event.id}
                event={event}
                onClick={() => onEventClick(event)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CommunityCard({
  event,
  onClick,
}: {
  event: Event
  onClick: () => void
}) {
  const date = !isNil(event.datetime)
    ? new Date(event.datetime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'America/Chicago',
      })
    : null
  const time = !isNil(event.datetime)
    ? new Date(event.datetime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Chicago',
      })
    : null

  return (
    <div
      className="bg-background border rounded-lg p-3 cursor-pointer hover:border-muted-foreground/30 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-gray-500" />
        <span className="text-xs font-medium">{event.title ?? 'Untitled'}</span>
      </div>
      {!isNil(date) && (
        <div className="text-[10px] text-muted-foreground">
          {date}
          {!isNil(time) ? ` · ${time}` : ''}
        </div>
      )}
      {!isNil(event.location) && (
        <div className="text-[10px] text-muted-foreground">
          {event.location}
        </div>
      )}
    </div>
  )
}
