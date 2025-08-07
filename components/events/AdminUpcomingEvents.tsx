'use client'

import { Calendar } from 'lucide-react'
import { type Event } from '@/actions/events'
import { useUpcomingEvents } from '@/hooks/use-events'
import { Alert } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { EventCard } from './EventCard'
import { useMemo } from 'react'

interface AdminUpcomingEventsProps {
  canEdit: boolean
  onEventClick?: (event: Event) => void
}

export function AdminUpcomingEvents({ canEdit, onEventClick }: AdminUpcomingEventsProps) {
  const { data: events, isLoading, error } = useUpcomingEvents()

  const topFour = useMemo(() => events?.slice(0, 4) ?? [], [events])

  return (
    <div className='w-full'>
      <div className='w-full mt-4 mb-2'>
        <Typography variant='h5'>Upcoming Events</Typography>
      </div>

      {isLoading && (
        <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
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
                    Unable to load upcoming events. Please try again later.
                  </Typography>
                </div>
              </Alert>
            </div>
          )}

          {topFour.length === 0 ? (
            <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Alert className='h-full flex flex-col'>
                <div className='flex items-start gap-2 mb-2'>
                  <Calendar className='w-5 h-5 mt-0.5 flex-shrink-0' />
                  <Typography variant='h6' className='font-semibold'>No Upcoming Events</Typography>
                </div>
                <div className='ml-7'>
                  <Typography variant='small' className='text-muted-foreground'>
                    There are currently no upcoming events scheduled.
                  </Typography>
                </div>
              </Alert>
            </div>
          ) : (
            <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch'>
              {topFour.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isEditable={canEdit}
                  onClick={onEventClick}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}