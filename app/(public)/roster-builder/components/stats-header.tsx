'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { RoleCategory } from './roster-builder-types'
import { getExperienceLabel } from './roster-builder-types'

export function StatsHeader({ categories }: { categories: RoleCategory[] }) {
  const stats = useMemo(() => {
    let filled = 0
    let total = 0
    let requiredFilled = 0
    let requiredTotal = 0
    let secuelaCount = 0
    const expDist = { Veteran: 0, Experienced: 0, Served: 0 }

    for (const cat of categories) {
      for (const slot of cat.slots) {
        total++
        if (slot.required) requiredTotal++
        if (slot.assignment.type !== 'empty') {
          filled++
          if (slot.required) requiredFilled++
          const member = slot.assignment.member
          if (member.attendsSecuela) secuelaCount++
          const { label } = getExperienceLabel(member.experienceLevel)
          expDist[label as keyof typeof expDist] =
            (expDist[label as keyof typeof expDist] ?? 0) + 1
        }
      }
    }

    return {
      filled,
      total,
      requiredFilled,
      requiredTotal,
      secuelaCount,
      expDist,
    }
  }, [categories])

  const filledPct = stats.total > 0 ? (stats.filled / stats.total) * 100 : 0
  const requiredRemaining = stats.requiredTotal - stats.requiredFilled
  const secuelaPct =
    stats.filled > 0 ? Math.round((stats.secuelaCount / stats.filled) * 100) : 0
  const expTotal =
    stats.expDist.Veteran + stats.expDist.Experienced + stats.expDist.Served

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card className="py-3">
        <CardContent className="px-4 py-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Positions Filled
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {stats.filled}
            </span>
            <span className="text-base text-muted-foreground">
              / {stats.total}
            </span>
          </div>
          <Progress value={filledPct} className="h-1.5" />
        </CardContent>
      </Card>

      <Card className="py-3">
        <CardContent className="px-4 py-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Required Remaining
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold tabular-nums ${
                requiredRemaining > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {requiredRemaining}
            </span>
            <span className="text-sm text-muted-foreground">unfilled</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.requiredFilled} of {stats.requiredTotal} required filled
          </p>
        </CardContent>
      </Card>

      <Card className="py-3">
        <CardContent className="px-4 py-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Secuela %
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {secuelaPct}%
            </span>
            <span className="text-sm text-muted-foreground">
              {stats.secuelaCount} members
            </span>
          </div>
          <Progress value={secuelaPct} className="h-1.5" />
        </CardContent>
      </Card>

      <Card className="py-3">
        <CardContent className="px-4 py-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Experience Mix
          </p>
          {expTotal === 0 ? (
            <p className="text-sm text-muted-foreground mt-2">
              No assignments yet
            </p>
          ) : (
            <>
              <div className="flex h-3 w-full overflow-hidden rounded-full mb-2 mt-1">
                {stats.expDist.Veteran > 0 && (
                  <div
                    className="bg-amber-500"
                    style={{
                      width: `${(stats.expDist.Veteran / expTotal) * 100}%`,
                    }}
                    title={`Veteran: ${stats.expDist.Veteran}`}
                  />
                )}
                {stats.expDist.Experienced > 0 && (
                  <div
                    className="bg-blue-500"
                    style={{
                      width: `${(stats.expDist.Experienced / expTotal) * 100}%`,
                    }}
                    title={`Experienced: ${stats.expDist.Experienced}`}
                  />
                )}
                {stats.expDist.Served > 0 && (
                  <div
                    className="bg-green-500"
                    style={{
                      width: `${(stats.expDist.Served / expTotal) * 100}%`,
                    }}
                    title={`Served: ${stats.expDist.Served}`}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                {stats.expDist.Veteran > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    {stats.expDist.Veteran}V
                  </span>
                )}
                {stats.expDist.Experienced > 0 && (
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {stats.expDist.Experienced}E
                  </span>
                )}
                {stats.expDist.Served > 0 && (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {stats.expDist.Served}S
                  </span>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
