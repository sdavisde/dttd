import Link from 'next/link'
import { isNil } from 'lodash'
import type { Event } from '@/services/events'
import { EVENT_TYPE_LABELS } from '@/services/events/types'
import {
  getEventScope,
  scopeLabel,
  SCOPE_DOT_CLASSES,
  type ScopeContext,
} from '@/app/admin/events/components/event-scope'
import {
  buildMonthCells,
  CENTRAL_TIME,
  DAY_INITIALS,
  groupEventsByDay,
  MONTH_LABELS,
  todayInCommunityTz,
} from '@/app/admin/events/components/month-grid'

type CalendarPreviewProps = {
  /** Upcoming events, soonest first; null when the source failed. */
  events: Event[] | null
  /** Ids of the active weekends, so dots carry the same colours as Events. */
  scopeContext: ScopeContext
  groupNumber: number | null
}

const MAX_DOTS_PER_DAY = 3

/**
 * The dashboard's community calendar: the current month at a glance with a
 * coloured dot per day that has something on it, then the next three
 * gatherings written out. Read-only by design — events are created on the
 * Events page, never here.
 */
export function CalendarPreview({
  events,
  scopeContext,
  groupNumber,
}: CalendarPreviewProps) {
  const { year, month } = todayInCommunityTz()
  const { cells } = buildMonthCells(year, month)
  const eventsByDay = groupEventsByDay(events ?? [])
  const nextThree = events?.slice(0, 3) ?? null

  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          {MONTH_LABELS[month]}
        </h2>
        <Link
          href="/admin/events"
          className="text-[13px] font-semibold text-primary hover:text-primary-hover"
        >
          Open Events →
        </Link>
      </div>

      <div className="mt-2.5 grid grid-cols-7 border-b border-divider">
        {DAY_INITIALS.map((initial, i) => (
          <div
            key={i}
            className="py-1 text-center text-[10.5px] font-semibold tracking-[0.06em] text-muted-foreground uppercase"
          >
            {initial}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 pt-1 pb-2">
        {cells.map((cell) => {
          const dayEvents = eventsByDay.get(cell.key) ?? []
          return (
            <div
              key={cell.key}
              className="flex flex-col items-center gap-[3px] px-0.5 pt-1.5 pb-1"
            >
              <span
                className={`text-xs font-medium tabular-nums ${cell.inMonth ? 'text-foreground' : 'text-muted-foreground/50'}`}
              >
                {cell.day}
              </span>
              <span className="flex h-[5px] items-center gap-[3px]">
                {dayEvents.slice(0, MAX_DOTS_PER_DAY).map((event) => (
                  <span
                    key={event.id}
                    title={event.title ?? undefined}
                    className={`h-[5px] w-[5px] rounded-full ${SCOPE_DOT_CLASSES[getEventScope(event, scopeContext)]}`}
                  />
                ))}
              </span>
            </div>
          )
        })}
      </div>

      <div className="border-t border-divider pt-1">
        {isNil(nextThree) && (
          <p className="py-3 text-sm text-muted-foreground">
            Unavailable right now
          </p>
        )}

        {!isNil(nextThree) && nextThree.length === 0 && (
          <p className="py-3 text-sm text-muted-foreground">
            Nothing on the calendar yet.
          </p>
        )}

        {!isNil(nextThree) && nextThree.length > 0 && (
          <ul className="divide-y divide-divider">
            {nextThree.map((event) => (
              <li key={event.id}>
                <UpcomingRow
                  event={event}
                  scopeContext={scopeContext}
                  groupNumber={groupNumber}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function UpcomingRow({
  event,
  scopeContext,
  groupNumber,
}: {
  event: Event
  scopeContext: ScopeContext
  groupNumber: number | null
}) {
  const when = isNil(event.datetime) ? null : new Date(event.datetime)
  const label =
    event.title ??
    (isNil(event.type) ? 'Untitled event' : EVENT_TYPE_LABELS[event.type])
  const scope = getEventScope(event, scopeContext)
  const detail = isNil(when)
    ? 'Date to be set'
    : [
        when.toLocaleString('en-US', {
          weekday: 'long',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: CENTRAL_TIME,
        }),
        event.location,
      ]
        .filter((part) => !isNil(part))
        .join(' · ')

  return (
    <div className="flex items-center gap-2.5 py-2.5">
      <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md border bg-background">
        <span className="text-[8.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {isNil(when)
            ? '—'
            : when.toLocaleDateString('en-US', {
                month: 'short',
                timeZone: CENTRAL_TIME,
              })}
        </span>
        <span className="font-serif text-sm leading-tight font-semibold tabular-nums">
          {isNil(when)
            ? ''
            : when.toLocaleDateString('en-US', {
                day: 'numeric',
                timeZone: CENTRAL_TIME,
              })}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold">
          {label}
          <span className="font-normal text-muted-foreground">
            {' · '}
            {scopeLabel(scope, groupNumber)}
          </span>
        </p>
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  )
}
