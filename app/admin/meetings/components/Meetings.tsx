'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { AdminEvents } from '@/components/events/AdminEvents'
import { EventSidebar } from '@/components/events/EventSidebar'
import { type Event } from '@/actions/events'

interface MeetingsProps {
  canEdit: boolean
  upcomingEvents: Event[]
  pastEvents: Event[]
}

export default function Meetings({ canEdit, upcomingEvents, pastEvents }: MeetingsProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleEventClick = (event: Event) => {
    if (canEdit) {
      setSelectedEvent(event)
      setIsSidebarOpen(true)
    }
  }

  const handleAddEvent = () => {
    if (canEdit) {
      setSelectedEvent(null)
      setIsSidebarOpen(true)
    }
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
    setSelectedEvent(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <Typography variant="h4" as="h1">Meetings & Events</Typography>
        {canEdit && (
          <Button onClick={handleAddEvent}
            size="sm"
            variant="ghost"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Event
          </Button>
        )}
      </div>

      <div className='w-full'>
        <div className='w-full mt-4 mb-2'>
          <Typography variant='h5'>Upcoming Events</Typography>
        </div>
        <AdminEvents
          events={upcomingEvents}
          canEdit={canEdit}
          onEventClick={handleEventClick}
        />
      </div>

      <div className='w-full'>
        <div className='w-full mt-8 mb-2'>
          <Typography variant='h5'>Past Events</Typography>
        </div>
        <AdminEvents
          events={pastEvents}
          canEdit={canEdit}
          onEventClick={handleEventClick}
          isPast={true}
        />
      </div>

      <EventSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        event={selectedEvent}
      />
    </div>
  )
}