'use client'

import { Calendar } from 'lucide-react'
import { usePastEvents, type Event } from '@/hooks/use-events'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
        <Typography variant='h2'>Past Events</Typography>
      </div>

      {isLoading && (
        <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
          {Array.from({ length: 3 }).map((_, i) => (
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
                  Unable to load past events. Please try again later.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!events || events.length === 0 ? (
            <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Alert>
                <Calendar className='w-6 h-6' />
                <AlertTitle>No Past Events</AlertTitle>
                <AlertDescription>
                  There are no past events to display.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className='w-full h-full grid grid-cols-1 md:grid-cols-3 gap-4'>
              {events.map((event) => (
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