import { Calendar, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { type Event } from '@/services/events'
import {
  EVENT_TYPE_BORDER_COLORS,
  EVENT_TYPE_LABELS,
} from '@/services/events/types'
import { cn, formatDateTime } from '@/lib/utils'

interface WeekendEventCardProps {
  event: Event
  id?: string
  className?: string
  selected?: boolean
}

/**
 * Event card for the Current Weekend page with color-coded left border
 * based on event type. Displays title, date/time, and location.
 */
export function WeekendEventCard({
  event,
  id,
  className,
  selected = false,
}: WeekendEventCardProps) {
  const formattedDateTime = formatDateTime(event.datetime)
  const borderColor = event.type
    ? EVENT_TYPE_BORDER_COLORS[event.type]
    : EVENT_TYPE_BORDER_COLORS.other
  const typeLabel = event.type ? EVENT_TYPE_LABELS[event.type] : null

  return (
    <Card
      id={id}
      className={cn(
        'border-l-4 scroll-mt-4 transition-all duration-200',
        borderColor,
        selected && 'ring-2 ring-primary ring-offset-2 bg-accent/50',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Title and type badge */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight">
              {event.title ?? 'Untitled Event'}
            </h3>
            {typeLabel && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">
                {typeLabel}
              </span>
            )}
          </div>

          {/* Date and time */}
          {typeof formattedDateTime === 'object' ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>
                {formattedDateTime.dateStr} at {formattedDateTime.timeStr}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>{formattedDateTime}</span>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
