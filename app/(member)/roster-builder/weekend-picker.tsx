'use client'

import Link from 'next/link'
import { Users, Calendar, ArrowRight } from 'lucide-react'
import type { Weekend } from '@/lib/weekend/types'
import { WeekendType } from '@/lib/weekend/types'
import { formatDateRange } from '@/lib/utils'
import { isNil } from 'lodash'

type WeekendGroup = {
  number: number | null
  groupId: string | null
  weekends: Weekend[]
}

function groupByNumber(weekends: Weekend[]): WeekendGroup[] {
  const map = new Map<string, WeekendGroup>()
  for (const w of weekends) {
    const key = w.groupId ?? w.id
    const existing = map.get(key)
    if (!isNil(existing)) {
      existing.weekends.push(w)
    } else {
      map.set(key, { number: w.number, groupId: w.groupId, weekends: [w] })
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => (b.number ?? 0) - (a.number ?? 0)
  )
}

function WeekendCard({ weekend }: { weekend: Weekend }) {
  const label = weekend.type === WeekendType.MENS ? "Men's" : "Women's"

  return (
    <Link
      href={`/roster-builder?weekendId=${weekend.id}`}
      className="group flex flex-1 flex-col items-center rounded-md border bg-card px-6 py-5 text-center transition-colors hover:border-primary/40 hover:bg-selected"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Users className="h-5 w-5 text-primary" />
      </div>

      <h3 className="mb-1 text-base font-semibold text-foreground">
        {label} Weekend
      </h3>

      <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3 shrink-0" />
        <span>{formatDateRange(weekend.start_date, weekend.end_date)}</span>
      </div>

      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors group-hover:text-primary-hover">
        Open Roster
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export function WeekendPicker({ weekends }: { weekends: Weekend[] }) {
  const groups = groupByNumber(weekends)

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="border-b bg-card px-4 py-4 md:px-6">
        <div className="mx-auto max-w-screen-2xl flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Roster Builder</h1>
        </div>
      </header>

      {/* Content — vertically centered */}
      <div className="px-4 py-12 md:px-6">
        <div className="mx-auto w-full max-w-3xl">
          {groups.map((group) => (
            <div key={group.groupId ?? 'ungrouped'}>
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  DTTD #{group.number ?? '?'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Select a weekend to open its roster board.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {[...group.weekends]
                  .sort((a, b) =>
                    a.type === WeekendType.MENS
                      ? -1
                      : b.type === WeekendType.MENS
                        ? 1
                        : 0
                  )
                  .map((weekend) => (
                    <WeekendCard key={weekend.id} weekend={weekend} />
                  ))}
              </div>
            </div>
          ))}

          {/* Multiple groups get vertical spacing */}
          {groups.length > 1 && <div className="mt-10" />}

          {groups.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No active weekends found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
