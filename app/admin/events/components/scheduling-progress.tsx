'use client'

import { Plus } from 'lucide-react'
import { isNil } from 'lodash'
import type { Event } from '@/services/events'
import type { EventTypeValue } from '@/services/events/types'
import {
  EVENT_TYPE_LABELS,
  SINGLETON_EVENT_TYPES,
} from '@/services/events/types'
import type { Weekend } from '@/lib/weekend/types'

const GROUP_SLOT_TOTAL = 4

interface SchedulingProgressProps {
  groupNumber: number | null
  events: Event[]
  mensWeekend: Weekend
  womensWeekend: Weekend
  canEdit: boolean
  onScheduleSlot: (type: EventTypeValue, weekend: Weekend) => void
  onAddMeeting: () => void
}

/**
 * The board's "DTTD #N scheduling" card: one meter per lane, with the
 * missing slots named beneath — and, for editors, schedulable in place.
 */
export function SchedulingProgress({
  groupNumber,
  events,
  mensWeekend,
  womensWeekend,
  canEdit,
  onScheduleSlot,
  onAddMeeting,
}: SchedulingProgressProps) {
  const meetings = events.filter((e) => e.type === 'meeting')
  const secuela = events.find((e) => e.type === 'secuela')
  const groupFilled = Math.min(
    meetings.length + (isNil(secuela) ? 0 : 1),
    GROUP_SLOT_TOTAL
  )

  const missingFor = (weekend: Weekend) =>
    SINGLETON_EVENT_TYPES.filter(
      (type) =>
        !events.some((e) => e.weekendId === weekend.id && e.type === type)
    )
  const mensMissing = missingFor(mensWeekend)
  const womensMissing = missingFor(womensWeekend)

  return (
    <div className="flex flex-col gap-3.5 rounded-md border bg-card px-5 py-4.5">
      <h2 className="font-serif text-lg font-semibold tracking-tight">
        DTTD {isNil(groupNumber) ? '' : `#${groupNumber} `}scheduling
      </h2>

      <Meter
        label="Meetings & secuela"
        filled={groupFilled}
        total={GROUP_SLOT_TOTAL}
      >
        {isNil(secuela) && <span>Secuela isn&rsquo;t scheduled yet</span>}
        {canEdit && (
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-0.5 font-semibold text-primary hover:text-primary-hover"
            onClick={onAddMeeting}
          >
            <Plus className="h-3 w-3" />
            Add meeting
          </button>
        )}
      </Meter>

      <Meter
        label="Men's weekend events"
        filled={SINGLETON_EVENT_TYPES.length - mensMissing.length}
        total={SINGLETON_EVENT_TYPES.length}
      >
        <MissingSlots
          missing={mensMissing}
          weekend={mensWeekend}
          canEdit={canEdit}
          onScheduleSlot={onScheduleSlot}
        />
      </Meter>

      <Meter
        label="Women's weekend events"
        filled={SINGLETON_EVENT_TYPES.length - womensMissing.length}
        total={SINGLETON_EVENT_TYPES.length}
      >
        <MissingSlots
          missing={womensMissing}
          weekend={womensWeekend}
          canEdit={canEdit}
          onScheduleSlot={onScheduleSlot}
        />
      </Meter>

      <p className="border-t border-divider pt-3 text-[13px] text-muted-foreground">
        {canEdit
          ? 'Missing slots can be scheduled right here.'
          : 'Missing slots are scheduled by the weekend leadership.'}
      </p>
    </div>
  )
}

function Meter({
  label,
  filled,
  total,
  children,
}: {
  label: string
  filled: number
  total: number
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[13.5px] font-semibold">{label}</span>
        <span className="text-[12.5px] text-muted-foreground tabular-nums">
          {filled} of {total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-divider">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.round((filled / total) * 100)}%` }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground/80">
        {children}
      </div>
    </div>
  )
}

function MissingSlots({
  missing,
  weekend,
  canEdit,
  onScheduleSlot,
}: {
  missing: EventTypeValue[]
  weekend: Weekend
  canEdit: boolean
  onScheduleSlot: (type: EventTypeValue, weekend: Weekend) => void
}) {
  if (missing.length === 0) return <span>All scheduled</span>
  if (!canEdit) {
    return (
      <span>
        {missing.map((t) => EVENT_TYPE_LABELS[t]).join(' and ')}{' '}
        {missing.length === 1 ? 'isn’t' : 'still'} scheduled
        {missing.length === 1 ? ' yet' : ''}
      </span>
    )
  }
  return (
    <>
      <span>Still open:</span>
      {missing.map((type) => (
        <button
          key={type}
          type="button"
          className="cursor-pointer font-semibold text-primary underline decoration-dotted underline-offset-2 hover:text-primary-hover"
          onClick={() => onScheduleSlot(type, weekend)}
        >
          {EVENT_TYPE_LABELS[type]}
        </button>
      ))}
    </>
  )
}
