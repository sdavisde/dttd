'use client'

import { isNil } from 'lodash'
import type { Event } from '@/services/events'
import { SINGLETON_EVENT_TYPES } from '@/services/events/types'
import type { Weekend } from '@/lib/weekend/types'

interface ProgressHeaderProps {
  groupNumber: number | null
  events: Event[]
  mensWeekend: Weekend
  womensWeekend: Weekend
}

export function ProgressHeader({
  groupNumber,
  events,
  mensWeekend,
  womensWeekend,
}: ProgressHeaderProps) {
  const meetings = events.filter((e) => e.type === 'meeting')
  const secuela = events.find((e) => e.type === 'secuela')
  const groupFilled = meetings.length + (!isNil(secuela) ? 1 : 0)
  const groupTotal = 5

  const mensSingletons = events.filter(
    (e) =>
      e.weekendId === mensWeekend.id &&
      e.type != null &&
      SINGLETON_EVENT_TYPES.includes(e.type)
  )
  const womensSingletons = events.filter(
    (e) =>
      e.weekendId === womensWeekend.id &&
      e.type != null &&
      SINGLETON_EVENT_TYPES.includes(e.type)
  )

  return (
    <div className="bg-card border rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold">
            Weekend #{groupNumber ?? '?'}
          </h2>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {groupFilled + mensSingletons.length + womensSingletons.length} of{' '}
          {groupTotal + 8} events scheduled
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <ProgressBar
          label="Weekend Meetings"
          filled={groupFilled}
          total={groupTotal}
          color={
            groupFilled === groupTotal ? 'text-green-400' : 'text-yellow-400'
          }
        />
        <ProgressBar
          label="Men's"
          filled={mensSingletons.length}
          total={4}
          dotColor="bg-blue-400"
          color={
            mensSingletons.length === 4
              ? 'text-green-400'
              : mensSingletons.length === 0
                ? 'text-red-400'
                : 'text-yellow-400'
          }
        />
        <ProgressBar
          label="Women's"
          filled={womensSingletons.length}
          total={4}
          dotColor="bg-pink-400"
          color={
            womensSingletons.length === 4
              ? 'text-green-400'
              : womensSingletons.length === 0
                ? 'text-red-400'
                : 'text-yellow-400'
          }
        />
      </div>
    </div>
  )
}

function ProgressBar({
  label,
  filled,
  total,
  dotColor,
  color,
}: {
  label: string
  filled: number
  total: number
  dotColor?: string
  color: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          {!isNil(dotColor) && (
            <span
              className={`w-1.5 h-1.5 rounded-full inline-block ${dotColor}`}
            />
          )}
          {label}
        </span>
        <span className={`text-[10px] ${color}`}>
          {filled}/{total}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full ${i < filled ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
    </div>
  )
}
