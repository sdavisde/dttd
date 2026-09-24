import Link from 'next/link'
import { isNil } from 'lodash'
import type { Event } from '@/services/events'
import { EVENT_TYPE_LABELS } from '@/services/events/types'
import { COMMUNITY_TIMEZONE } from '@/lib/utils'
import { hubPath } from '@/lib/weekend/hub'
import type { WeekendType } from '@/lib/weekend/types'

type ComingUpProps = {
  /** Already filtered to this weekend and sliced to the next few. */
  events: Event[]
  groupId: string
  weekendType: WeekendType
}

/** The hub's "Coming up" card: day-chip rows for the next gatherings. */
export function ComingUp({ events, groupId, weekendType }: ComingUpProps) {
  return (
    <section className="flex flex-col rounded-lg border bg-card px-5 py-4.5">
      <div className="flex items-baseline justify-between gap-3 pb-1.5">
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          Coming up
        </h2>
        <Link
          href={hubPath(groupId, 'schedule', weekendType)}
          className="shrink-0 text-[13.5px] font-semibold text-primary hover:text-primary-hover"
        >
          Full schedule
        </Link>
      </div>
      {events.length === 0 && (
        <p className="py-2 text-sm text-muted-foreground">
          Nothing on the calendar yet.
        </p>
      )}
      {events.map((event, index) => {
        const date = new Date(event.datetime as string)
        const weekday = date.toLocaleDateString('en-US', {
          weekday: 'short',
          timeZone: COMMUNITY_TIMEZONE,
        })
        const day = date.toLocaleDateString('en-US', {
          day: 'numeric',
          timeZone: COMMUNITY_TIMEZONE,
        })
        const time = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: COMMUNITY_TIMEZONE,
        })
        const detail = [time, event.location]
          .filter((part): part is string => !isNil(part) && part.trim() !== '')
          .join(' · ')
        const label =
          event.title ??
          (isNil(event.type) ? 'Untitled' : EVENT_TYPE_LABELS[event.type])

        return (
          <div
            key={event.id}
            className={
              index === events.length - 1
                ? 'flex items-center gap-3 py-2.5'
                : 'flex items-center gap-3 border-b border-divider py-2.5'
            }
          >
            <span className="flex w-11 shrink-0 flex-col items-center">
              <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {weekday}
              </span>
              <span className="font-serif text-lg leading-tight font-semibold tabular-nums">
                {day}
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14.5px] font-semibold">
                {label}
              </span>
              {detail !== '' && (
                <span className="block truncate text-[13px] text-muted-foreground">
                  {detail}
                </span>
              )}
            </span>
          </div>
        )
      })}
    </section>
  )
}
