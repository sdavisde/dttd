'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import {
  EventSidebar,
  type WeekendOption,
  type WeekendIndividualOption,
  type EventFormPrefill,
} from '@/components/events/EventSidebar'
import { isNil } from 'lodash'
import type { Event } from '@/services/events'
import type { EventTypeValue } from '@/services/events/types'
import { EVENT_TYPE_LABELS } from '@/services/events/types'
import type { Weekend } from '@/lib/weekend/types'

import type { ScopeContext } from './event-scope'
import { MonthCalendar } from './month-calendar'
import { SchedulingProgress } from './scheduling-progress'
import { ComingUp } from './coming-up'
import { PastEventsSection } from './PastEventsSection'

interface ActiveGroupData {
  groupId: string
  groupNumber: number | null
  mensWeekend: Weekend
  womensWeekend: Weekend
}

interface EventsClientProps {
  canEdit: boolean
  activeGroup: ActiveGroupData | null
  activeGroupEvents: Event[]
  communityEvents: Event[]
  weekendOptions: WeekendOption[]
  weekendIndividualOptions: WeekendIndividualOption[]
}

export default function EventsClient({
  canEdit,
  activeGroup,
  activeGroupEvents,
  communityEvents,
  weekendOptions,
  weekendIndividualOptions,
}: EventsClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [prefill, setPrefill] = useState<EventFormPrefill | undefined>(
    undefined
  )
  const [pastOpen, setPastOpen] = useState(false)
  const [pastScrollSignal, setPastScrollSignal] = useState(0)

  const scopeContext: ScopeContext = {
    mensWeekendId: activeGroup?.mensWeekend.id,
    womensWeekendId: activeGroup?.womensWeekend.id,
  }
  const allEvents = [...activeGroupEvents, ...communityEvents]

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
    const meetingNumber =
      activeGroupEvents.filter((e) => e.type === 'meeting').length + 1
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

  const handleNewEvent = () => {
    setSelectedEvent(null)
    setPrefill(undefined)
    setIsSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
    setSelectedEvent(null)
    setPrefill(undefined)
  }

  return (
    <div>
      <PageHeader
        title="Events"
        description="Team meetings, send-offs, and community gatherings — one calendar for everything with a date."
      >
        <Button
          variant="outline"
          onClick={() => {
            setPastOpen(true)
            setPastScrollSignal((n) => n + 1)
          }}
        >
          Past events
        </Button>
        {canEdit && <Button onClick={handleNewEvent}>New event</Button>}
      </PageHeader>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <MonthCalendar
            events={allEvents}
            scopeContext={scopeContext}
            groupNumber={activeGroup?.groupNumber ?? null}
            canEdit={canEdit}
            onEventClick={handleEventClick}
          />
        </div>

        <div className="flex flex-col gap-4">
          {!isNil(activeGroup) ? (
            <SchedulingProgress
              groupNumber={activeGroup.groupNumber}
              events={activeGroupEvents}
              mensWeekend={activeGroup.mensWeekend}
              womensWeekend={activeGroup.womensWeekend}
              canEdit={canEdit}
              onScheduleSlot={handleScheduleSlot}
              onAddMeeting={handleAddMeeting}
            />
          ) : (
            <div className="rounded-md border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No active weekend. Activate one from the{' '}
                <Link
                  href="/admin/weekends"
                  className="font-semibold text-primary hover:text-primary-hover"
                >
                  Weekends page
                </Link>{' '}
                to track its scheduling here.
              </p>
            </div>
          )}

          <ComingUp
            events={allEvents}
            scopeContext={scopeContext}
            groupNumber={activeGroup?.groupNumber ?? null}
            canEdit={canEdit}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      <p className="mt-4 text-[13.5px] text-muted-foreground/80">
        Events appear on the community calendar the moment they&rsquo;re saved
        &middot; older gatherings live under Past events
      </p>

      <PastEventsSection
        isOpen={pastOpen}
        onToggle={() => setPastOpen((open) => !open)}
        scrollSignal={pastScrollSignal}
      />

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
