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
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Coming up
        </h2>
        <Link
          href="/admin/events"
          className="text-sm font-medium text-primary hover:text-primary-hover"
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
              <li key={event.id} className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md border bg-muted">
                  <span className="text-[10px] font-semibold uppercase leading-none text-muted-foreground">
                    {isNil(when) ? '—' : format(when, 'MMM')}
                  </span>
                  <span className="font-serif text-base font-semibold leading-tight tabular-nums">
                    {isNil(when) ? '' : format(when, 'd')}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {event.title ?? 'Untitled event'}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
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
