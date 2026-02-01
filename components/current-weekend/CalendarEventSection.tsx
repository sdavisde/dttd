'use client'

import { format } from 'date-fns'
import { type Event } from '@/services/events'
import { EventCalendar } from './EventCalendar'
import { EventList } from './EventList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHashState, parseDateFromHash } from '@/hooks/useHashState'

interface CalendarEventSectionProps {
  events: Event[]
}

/**
 * Client-side wrapper component that combines the EventCalendar and EventList
 * with URL hash-based date selection and scroll-to-event functionality.
 */
export function CalendarEventSection({ events }: CalendarEventSectionProps) {
  const [hash, setHash] = useHashState()
  const selectedDate = parseDateFromHash(hash)

  const handleDateClick = (date: Date) => {
    // Set the hash to the clicked date in YYYY-MM-DD format
    const dateKey = format(date, 'yyyy-MM-dd')
    setHash(dateKey)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent>
          <EventCalendar
            events={events}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
          />
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-y-auto">
          <EventList events={events} selectedDate={selectedDate} />
        </CardContent>
      </Card>
    </div>
  )
}
