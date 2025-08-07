'use client'

import { Calendar } from 'lucide-react'
import { type Event } from '@/actions/events'
import { Alert } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { EventCard } from './EventCard'

interface AdminEventsProps {
  events?: Event[]
  isLoading: boolean
  error?: Error | null
  canEdit: boolean
  onEventClick?: (event: Event) => void
  isPast?: boolean
}

export function AdminEvents({
  events,
  isLoading,
  error,
  canEdit,
  onEventClick,
  isPast = false,
}: AdminEventsProps) {

  if (isLoading) {
    return (
      <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Alert key={i} className='animate-pulse h-full flex flex-col'>
            <div className='flex items-start gap-2 mb-2'>
              <Calendar className='w-5 h-5 mt-0.5 flex-shrink-0' />
              <Typography variant='h6' className='font-semibold'>Loading...</Typography>
            </div>
            <div className='ml-7'>
              <span className='block h-4 bg-gray-200 rounded mb-1'></span>
              <span className='block h-4 bg-gray-200 rounded w-3/4'></span>
            </div>
          </Alert>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch'>
        <Alert variant='destructive' className='h-full flex flex-col'>
          <div className='flex items-start gap-2 mb-2'>
            <Calendar className='w-5 h-5 mt-0.5 flex-shrink-0' />
            <Typography variant='h6' className='font-semibold'>Error Loading Events</Typography>
          </div>
          <div className='ml-7'>
            <Typography variant='small' className='text-muted-foreground'>
              Unable to load events. Please try again later.
            </Typography>
          </div>
        </Alert>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch'>
        <Alert className='h-full flex flex-col'>
          <div className='flex items-start gap-2 mb-2'>
            <Calendar className='w-5 h-5 mt-0.5 flex-shrink-0' />
            <Typography variant='h6' className='font-semibold'>No Events</Typography>
          </div>
          <div className='ml-7'>
            <Typography variant='small' className='text-muted-foreground'>
              There are no events to display.
            </Typography>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch'>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isEditable={canEdit}
          onClick={onEventClick}
          isPast={isPast}
        />
      ))}
    </div>
  )
}