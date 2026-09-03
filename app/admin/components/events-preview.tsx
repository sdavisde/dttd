import Link from 'next/link'
import { format } from 'date-fns'
import { isNil } from 'lodash'
import type { Event } from '@/services/events'

type EventsPreviewProps = {
  /** Upcoming events, soonest first; null when the source failed. */
  events: Event[] | null
}

/**
 * "Coming up" — a read-only preview of the next three gatherings. Deliberately
 * has no creation control: events are managed on the Events page.
 */
export function EventsPreview({ events }: EventsPreviewProps) {
  const nextThree = events?.slice(0, 3) ?? null

  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          Coming up
        </h2>
        <Link
          href="/admin/events"
          className="text-[13px] font-semibold text-primary hover:text-primary-hover"
        >
          Open Events →
        </Link>
      </div>

      {isNil(nextThree) && (
        <p className="mt-4 text-sm text-muted-foreground">
          Unavailable right now
        </p>
      )}

      {!isNil(nextThree) && nextThree.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Nothing on the calendar yet.
        </p>
      )}

      {!isNil(nextThree) && nextThree.length > 0 && (
        <ul className="mt-4 space-y-3">
          {nextThree.map((event) => {
            const when = isNil(event.datetime) ? null : new Date(event.datetime)
            return (
              <li key={event.id} className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md border bg-card">
                  <span className="text-[8.5px] font-semibold uppercase leading-none tracking-[0.08em] text-muted-foreground">
                    {isNil(when) ? '—' : format(when, 'MMM')}
                  </span>
                  <span className="font-serif text-sm font-semibold leading-tight tabular-nums">
                    {isNil(when) ? '' : format(when, 'd')}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold">
                    {event.title ?? 'Untitled event'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {isNil(when)
                      ? 'Date to be set'
                      : format(when, 'EEEE h:mm a')}
                    {isNil(event.location) ? '' : ` · ${event.location}`}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
