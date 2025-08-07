'use client'

import { Calendar } from 'lucide-react'
import { type Event } from '@/actions/events'
import { usePastEvents } from '@/hooks/use-events'
import { Alert } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { EventCard } from './EventCard'

interface AdminPastEventsProps {
  canEdit: boolean
  onEventClick?: (event: Event) => void
}

export function AdminPastEvents({ canEdit, onEventClick }: AdminPastEventsProps) {
  const { data: events, isLoading, error } = usePastEvents()

  return (
    <div className='w-full'>
      <div className='w-full mt-8 mb-2'>
        <Typography variant='h5'>Past Events</Typography>
      </div>

      {isLoading && (
        <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
          {Array.from({ length: 3 }).map((_, i) => (
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
      )}

      {!isLoading && (
        <>
          {error != null && (
            <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Alert variant='destructive' className='h-full flex flex-col'>
                <div className='flex items-start gap-2 mb-2'>
                  <Calendar className='w-5 h-5 mt-0.5 flex-shrink-0' />
                  <Typography variant='h6' className='font-semibold'>Error Loading Events</Typography>
                </div>
                <div className='ml-7'>
                  <Typography variant='small' className='text-muted-foreground'>
                    Unable to load past events. Please try again later.
                  </Typography>
                </div>
              </Alert>
            </div>
          )}

          {!events || events.length === 0 ? (
            <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Alert className='h-full flex flex-col'>
                <div className='flex items-start gap-2 mb-2'>
                  <Calendar className='w-5 h-5 mt-0.5 flex-shrink-0' />
                  <Typography variant='h6' className='font-semibold'>No Past Events</Typography>
                </div>
                <div className='ml-7'>
                  <Typography variant='small' className='text-muted-foreground'>
                    There are no past events to display.
                  </Typography>
                </div>
              </Alert>
            </div>
          ) : (
            <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch'>
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isEditable={canEdit}
                  onClick={onEventClick}
                  isPast={true}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}