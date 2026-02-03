'use client'

import { Calendar } from 'lucide-react'
import { type Event } from '@/services/events'
import { Alert } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { EventCard } from './EventCard'

interface AdminEventsProps {
  events?: Event[]
  canEdit: boolean
  onEventClick?: (event: Event) => void
  isPast?: boolean
}

export function AdminEvents({
  events,
  canEdit,
  onEventClick,
  isPast = false,
}: AdminEventsProps) {
  if (!events || events.length === 0) {
    return (
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <Alert className="h-full flex flex-col">
          <div className="flex items-start gap-2 mb-2">
            <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <Typography variant="h6" className="font-semibold">
              No Events
            </Typography>
          </div>
          <div className="ml-7">
            <Typography variant="small" className="text-muted-foreground">
              There are no events to display.
            </Typography>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          canEdit={canEdit}
          onClick={onEventClick}
          isPast={isPast}
        />
      ))}
    </div>
  )
}
