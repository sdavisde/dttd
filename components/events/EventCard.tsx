'use client'

import { useState } from 'react'
import { Calendar, Edit } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Typography } from '@/components/ui/typography'
import { type Event } from '@/actions/events'
import { cn, formatEventDateTime } from '@/lib/utils'

interface EventCardProps {
  event: Event
  canEdit?: boolean
  onClick?: (event: Event) => void
  isPast?: boolean
}

export function EventCard({ event, canEdit = false, onClick, isPast = false }: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const formattedDateTime = formatEventDateTime(event.datetime)

  const handleClick = () => {
    if (canEdit && onClick) {
      onClick(event)
    }
  }

  return (
    <div
      className={cn(
        "relative",
        canEdit && "cursor-pointer",
        isPast && "opacity-60"
      )}
      onMouseEnter={() => canEdit && setIsHovered(true)}
      onMouseLeave={() => canEdit && setIsHovered(false)}
      onClick={handleClick}
    >
      <Alert className={cn(
        "transition-all duration-200 h-full flex flex-col",
        canEdit && isHovered && "ring-2 ring-primary/50 shadow-md"
      )}>
        <div className='flex items-start gap-2 mb-2'>
          <Calendar className='w-5 h-5 mt-0.5 flex-shrink-0' />
          <Typography variant='h6' className='font-semibold'>
            {event.title || 'Untitled Event'}
          </Typography>
        </div>
        <div className='ml-7'>
          {typeof formattedDateTime === 'object' ? (
            <>
              <Typography variant='small' className='block mb-1'>
                {formattedDateTime.dateStr}
              </Typography>
              <Typography variant='small' className='block text-muted-foreground'>
                {formattedDateTime.timeStr}
                {event.location && ` - ${event.location}`}
              </Typography>
            </>
          ) : (
            <Typography variant='small' className='block text-muted-foreground'>
              {formattedDateTime}
            </Typography>
          )}
        </div>

        {canEdit && isHovered && (
          <div className="absolute top-2 right-2 p-1 bg-background/80 rounded-md shadow-sm">
            <Edit className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </Alert>
    </div>
  )
}