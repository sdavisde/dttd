'use client'

import { Plus } from 'lucide-react'
import { isNil } from 'lodash'
import { Button } from '@/components/ui/button'
import type { Event } from '@/services/events'
import { getEventColor } from './event-colors'

interface MeetingsRowProps {
  meetings: Event[]
  secuela: Event | null
  onEventClick: (event: Event) => void
  onAddMeeting: () => void
  canEdit: boolean
}

export function MeetingsRow({
  meetings,
  secuela,
  onEventClick,
  onAddMeeting,
  canEdit,
}: MeetingsRowProps) {
  const allGroupEvents = [
    ...meetings.sort((a, b) =>
      (a.datetime ?? '').localeCompare(b.datetime ?? '')
    ),
    ...(!isNil(secuela) ? [secuela] : []),
  ]

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Weekend Meetings
        </h3>
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={onAddMeeting}
          >
            <Plus className="w-3 h-3" />
            Add Meeting
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        {allGroupEvents.map((event) => (
          <MeetingCard
            key={event.id}
            event={event}
            onClick={() => onEventClick(event)}
          />
        ))}
      </div>
    </div>
  )
}

function MeetingCard({
  event,
  onClick,
}: {
  event: Event
  onClick: () => void
}) {
  const c = getEventColor(event.type)
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
      className={`${c.bg} border ${c.border} rounded-lg px-3 py-2.5 cursor-pointer hover:brightness-110 transition-all`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <div className={`w-2 h-2 rounded-full ${c.dot}`} />
        <span className="text-xs font-medium truncate">
          {event.title ?? 'Untitled'}
        </span>
      </div>
      <div className={`text-[10px] ${c.text}`}>
        {date}
        {!isNil(time) ? ` · ${time}` : ''}
      </div>
    </div>
  )
}
