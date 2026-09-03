'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Typography } from '@/components/ui/typography'
import {
  EventSidebar,
  type WeekendOption,
  type WeekendIndividualOption,
  type EventFormPrefill,
} from '@/components/events/EventSidebar'
import { isNil } from 'lodash'
import type { Event } from '@/services/events'
import type { EventTypeValue } from '@/services/events/types'
import {
  SINGLETON_EVENT_TYPES,
  EVENT_TYPE_LABELS,
} from '@/services/events/types'
import type { Weekend } from '@/lib/weekend/types'

import { CommunitySidebar } from './CommunitySidebar'
import { ProgressHeader } from './ProgressHeader'
import { MeetingsRow } from './MeetingsRow'
import { WeekendLane } from './WeekendLane'
import { PastEventsSection } from './PastEventsSection'

interface ActiveGroupData {
  groupId: string
  groupNumber: number | null
  mensWeekend: Weekend
  womensWeekend: Weekend
}

interface MeetingsProps {
  canEdit: boolean
  activeGroup: ActiveGroupData | null
  activeGroupEvents: Event[]
  communityEvents: Event[]
  weekendOptions: WeekendOption[]
  weekendIndividualOptions: WeekendIndividualOption[]
}

export default function Meetings({
  canEdit,
  activeGroup,
  activeGroupEvents,
  communityEvents,
  weekendOptions,
  weekendIndividualOptions,
}: MeetingsProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [prefill, setPrefill] = useState<EventFormPrefill | undefined>(
    undefined
  )

  const handleEventClick = (event: Event) => {
    if (!canEdit) return
    setSelectedEvent(event)
    // Derive prefill from the event so type stays locked and weekend
    // fields are hidden for community events
    const isCommunity = isNil(event.weekendGroupId) && isNil(event.weekendId)
    setPrefill({
      type: event.type ?? 'other',
      ...(isCommunity ? { hideWeekendFields: true } : {}),
      ...(!isNil(event.weekendGroupId)
        ? { weekendGroupId: event.weekendGroupId }
        : {}),
      ...(!isNil(event.weekendId) ? { weekendId: event.weekendId } : {}),
    })
    setIsSidebarOpen(true)
  }

  const handleScheduleSlot = (type: EventTypeValue, weekend: Weekend) => {
    const weekendLabel = weekend.type === 'MENS' ? "Men's" : "Women's"
    const num = activeGroup?.groupNumber
    const numSuffix = !isNil(num) ? ` #${num}` : ''
    setSelectedEvent(null)
    setPrefill({
      type,
      weekendGroupId: weekend.groupId,
      weekendId: weekend.id,
      title: `${weekendLabel} ${EVENT_TYPE_LABELS[type]}${numSuffix}`,
    })
    setIsSidebarOpen(true)
  }

  const handleAddMeeting = () => {
    const meetingNumber = meetings.length + 1
    const num = activeGroup?.groupNumber
    const numSuffix = !isNil(num) ? ` #${num}` : ''
    setSelectedEvent(null)
    setPrefill({
      type: 'meeting',
      weekendGroupId: activeGroup?.groupId ?? null,
      title: `Team Meeting ${meetingNumber}${numSuffix}`,
    })
    setIsSidebarOpen(true)
  }

  const handleAddCommunityEvent = () => {
    setSelectedEvent(null)
    setPrefill({ type: 'other', hideWeekendFields: true })
    setIsSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
    setSelectedEvent(null)
    setPrefill(undefined)
  }

  // Categorize events
  const meetings = activeGroupEvents.filter((e) => e.type === 'meeting')
  const secuela = activeGroupEvents.find((e) => e.type === 'secuela') ?? null
  const mensEvents = activeGroupEvents.filter(
    (e) =>
      e.weekendId === activeGroup?.mensWeekend.id &&
      e.type != null &&
      SINGLETON_EVENT_TYPES.includes(e.type)
  )
  const womensEvents = activeGroupEvents.filter(
    (e) =>
      e.weekendId === activeGroup?.womensWeekend.id &&
      e.type != null &&
      SINGLETON_EVENT_TYPES.includes(e.type)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" as="h1">
          Meetings & Events
        </Typography>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar - Community Events */}
        <CommunitySidebar
          events={communityEvents}
          onEventClick={handleEventClick}
          onAddEvent={handleAddCommunityEvent}
          canEdit={canEdit}
        />

        {/* Right Main Area - Active Weekend */}
        <div className="flex-1 min-w-0">
          {!isNil(activeGroup) ? (
            <>
              <ProgressHeader
                groupNumber={activeGroup.groupNumber}
                events={activeGroupEvents}
                mensWeekend={activeGroup.mensWeekend}
                womensWeekend={activeGroup.womensWeekend}
              />

              <MeetingsRow
                meetings={meetings}
                secuela={secuela}
                onEventClick={handleEventClick}
                onAddMeeting={handleAddMeeting}
                canEdit={canEdit}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <WeekendLane
                  weekend={activeGroup.mensWeekend}
                  events={mensEvents}
                  color="blue"
                  onEventClick={handleEventClick}
                  onScheduleSlot={handleScheduleSlot}
                  canEdit={canEdit}
                />
                <WeekendLane
                  weekend={activeGroup.womensWeekend}
                  events={womensEvents}
                  color="pink"
                  onEventClick={handleEventClick}
                  onScheduleSlot={handleScheduleSlot}
                  canEdit={canEdit}
                />
              </div>
            </>
          ) : (
            <div className="bg-card border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">
                No active weekend. Activate a weekend from the{' '}
                <Link
                  href="/admin/weekends"
                  className="text-primary hover:underline"
                >
                  Weekends
                </Link>{' '}
                page to see the event dashboard.
              </p>
            </div>
          )}
        </div>
      </div>

      <PastEventsSection />

      <EventSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        event={selectedEvent}
        weekendOptions={weekendOptions}
        weekendIndividualOptions={weekendIndividualOptions}
        prefill={prefill}
      />
    </div>
  )
}
