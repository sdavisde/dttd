'use client'

import { useMemo } from 'react'
import type { RoleCategory } from './roster-builder-types'
import { getExperienceLabel } from './roster-builder-types'

export function StatsHeader({ categories }: { categories: RoleCategory[] }) {
  const stats = useMemo(() => {
    let filled = 0
    let total = 0
    const expDist = { Veteran: 0, Experienced: 0, Served: 0 }

    for (const cat of categories) {
      for (const slot of cat.slots) {
        total++
        if (slot.assignment.type !== 'empty') {
          filled++
          const { label } = getExperienceLabel(
            slot.assignment.member.experienceLevel
          )
          expDist[label as keyof typeof expDist] =
            (expDist[label as keyof typeof expDist] ?? 0) + 1
        }
      }
    }

    return { filled, total, expDist }
  }, [categories])

  const filledPct = stats.total > 0 ? (stats.filled / stats.total) * 100 : 0
  const expTotal =
    stats.expDist.Veteran + stats.expDist.Experienced + stats.expDist.Served

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-5">
      {/* Positions filled */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Filled
        </span>
        <span className="text-sm font-bold tabular-nums text-foreground">
          {stats.filled}
          <span className="font-normal text-muted-foreground">
            /{stats.total}
          </span>
        </span>
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${filledPct}%` }}
          />
        </div>
      </div>

      <div className="h-4 w-px bg-border" />

      {/* Experience mix */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Mix
        </span>
        {expTotal === 0 ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            {(
              [
                { key: 'Served', level: 1, label: 'L1' },
                { key: 'Experienced', level: 2, label: 'L2' },
                { key: 'Veteran', level: 3, label: 'L3' },
              ] as const
            ).map(({ key, level, label }) => {
              const count = stats.expDist[key]
              if (count === 0) return null
              const pct = Math.round((count / expTotal) * 100)
              return (
                <span
                  key={level}
                  className="inline-flex items-center gap-1 rounded-full border border-transparent px-1.5 py-0.5 font-semibold"
                  style={{
                    backgroundColor: `var(--experience-level-${level})`,
                    color: `var(--experience-level-${level}-fg)`,
                  }}
                >
                  {label}: {pct}%
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
