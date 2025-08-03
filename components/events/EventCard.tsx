'use client'

import { useState } from 'react'
import { Calendar, Edit } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { type Event } from '@/actions/events'
import { cn } from '@/lib/utils'

interface EventCardProps {
  event: Event
  isEditable?: boolean
  onClick?: (event: Event) => void
}

export function EventCard({ event, isEditable = false, onClick }: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false)

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

  const handleClick = () => {
    if (isEditable && onClick) {
      onClick(event)
    }
  }

  return (
    <div
      className={cn(
        "relative",
        isEditable && "cursor-pointer"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <Alert className={cn(
        "transition-all duration-200",
        isEditable && isHovered && "ring-2 ring-primary/50 shadow-md"
      )}>
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
        
        {isEditable && isHovered && (
          <div className="absolute top-2 right-2 p-1 bg-background/80 rounded-md shadow-sm">
            <Edit className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </Alert>
    </div>
  )
}