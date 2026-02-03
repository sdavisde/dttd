'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, List } from 'lucide-react'
import { type Event } from '@/services/events'
import { EventCalendar } from './EventCalendar'
import { EventList } from './EventList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useHashState, parseDateFromHash } from '@/hooks/useHashState'

interface CalendarEventSectionProps {
  events: Event[]
}

/**
 * Client-side wrapper component that combines the EventCalendar and EventList
 * with URL hash-based date selection and scroll-to-event functionality.
 *
 * Desktop (md+): Side-by-side layout with calendar on left, events on right
 * Mobile: Tabbed interface with Calendar and Events tabs
 */
export function CalendarEventSection({ events }: CalendarEventSectionProps) {
  const [hash, setHash] = useHashState()
  const [activeTab, setActiveTab] = useState<string>('calendar')
  const selectedDate = parseDateFromHash(hash)

  const handleDateClick = (date: Date) => {
    // Set the hash to the clicked date in YYYY-MM-DD format
    const dateKey = format(date, 'yyyy-MM-dd')
    setHash(dateKey)

    // On mobile, auto-switch to events tab when a date is clicked
    setActiveTab('events')
  }

  return (
    <>
      {/* Desktop Layout - Side by side (hidden on mobile) */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
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

      {/* Mobile Layout - Tabbed interface (hidden on desktop) */}
      <div className="md:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 h-12">
            <TabsTrigger
              value="calendar"
              className="min-h-[44px] gap-2 text-base"
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="min-h-[44px] gap-2 text-base"
            >
              <List className="h-4 w-4" />
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-4">
            <Card>
              <CardContent>
                <EventCalendar
                  events={events}
                  selectedDate={selectedDate}
                  onDateClick={handleDateClick}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[60vh] overflow-y-auto">
                <EventList events={events} selectedDate={selectedDate} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
