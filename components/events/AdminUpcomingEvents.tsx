'use client'

import { Calendar } from 'lucide-react'
import { useUpcomingEvents, type Event } from '@/hooks/use-events'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
        <Typography variant='h2'>Upcoming Events</Typography>
      </div>

      {isLoading && (
        <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Alert key={i} className='animate-pulse'>
              <Calendar className='w-6 h-6' />
              <AlertTitle className='text-lg font-semibold'>Loading...</AlertTitle>
              <AlertDescription>
                <span className='block h-4 bg-gray-200 rounded mb-1'></span>
                <span className='block h-4 bg-gray-200 rounded w-3/4'></span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {!isLoading && (
        <>
          {error != null && (
            <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Alert variant='destructive'>
                <Calendar className='w-6 h-6' />
                <AlertTitle>Error Loading Events</AlertTitle>
                <AlertDescription>
                  Unable to load upcoming events. Please try again later.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {topFour.length === 0 ? (
            <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Alert>
                <Calendar className='w-6 h-6' />
                <AlertTitle>No Upcoming Events</AlertTitle>
                <AlertDescription>
                  There are currently no upcoming events scheduled.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
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