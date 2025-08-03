import { Calendar } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { type Event } from '@/actions/events'

interface EventAlertProps {
  event: Event
}

export function EventAlert({ event }: EventAlertProps) {
  const formatEventDateTime = (datetime: string | null) => {
    if (!datetime) return 'Date TBD'
    
    try {
      const date = new Date(datetime)
      const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Chicago',
      })
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Chicago',
      })
      return { dateStr, timeStr: `${timeStr} CT` }
    } catch {
      return 'Invalid Date'
    }
  }

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