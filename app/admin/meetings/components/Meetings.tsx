'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { User } from '@/lib/users/types'
import { AdminUpcomingEvents } from '@/components/events/AdminUpcomingEvents'
import { AdminPastEvents } from '@/components/events/AdminPastEvents'
import { EventSidebar } from '@/components/events/EventSidebar'
import { type Event } from '@/actions/events'

interface MeetingsProps {
  user: User
}

export function Meetings({ user }: MeetingsProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const canEdit = user.role?.permissions.includes('FULL_ACCESS') ?? false

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
      <div className="flex items-center justify-between">
        <Typography variant="h1">Meetings & Events</Typography>
        {canEdit && (
          <Button onClick={handleAddEvent} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Event
          </Button>
        )}
      </div>

      <AdminUpcomingEvents
        canEdit={canEdit}
        onEventClick={handleEventClick}
      />

      <AdminPastEvents
        canEdit={canEdit}
        onEventClick={handleEventClick}
      />

      <EventSidebar
        event={selectedEvent}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  )
}