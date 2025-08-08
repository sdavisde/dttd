import { Calendar } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { type Event } from '@/actions/events'
import { formatEventDateTime } from '@/lib/utils'

interface EventAlertProps {
  event: Event
}

export function EventAlert({ event }: EventAlertProps) {
  const formattedDateTime = formatEventDateTime(event.datetime)

  return (
    <Alert>
      <Calendar className='w-6 h-6' />
      <AlertTitle className='text-lg font-semibold'>
        {event.title || 'Untitled Event'}
      </AlertTitle>
      <AlertDescription>
        {typeof formattedDateTime === 'object' ? (
          <>
            <span className='block'>{formattedDateTime.dateStr}</span>
            <span className='block'>
              {formattedDateTime.timeStr}
              {event.location && ` - ${event.location}`}
            </span>
          </>
        ) : (
          <span className='block'>{formattedDateTime}</span>
        )}
      </AlertDescription>
    </Alert>
  )
}