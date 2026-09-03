'use client'

import { useState } from 'react'
import Link from 'next/link'
import { isNil } from 'lodash'
import { CalendarPlus, Plus, Settings2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Typography } from '@/components/ui/typography'
import { formatDateRange } from '@/lib/utils'
import {
  formatWeekendGender,
  formatWeekendGroupTitle,
  getGroupStatus,
} from '@/lib/weekend'
import type { Weekend, WeekendGroupWithId } from '@/lib/weekend/types'
import { WeekendStatus, WeekendType } from '@/lib/weekend/types'
import {
  nextGroupNumber,
  showStartPlanningRow,
  type ActiveGroupStats,
  type BoardGroupBuckets,
  type WeekendStats,
} from '@/lib/admin/weekend-stats'
import { WeekendSidebar } from './WeekendSidebar'
import { SetActiveWeekendButton } from './SetActiveWeekendButton'

interface WeekendsProps {
  buckets: BoardGroupBuckets
  activeStats: ActiveGroupStats | null
  allGroups: WeekendGroupWithId[]
  canEdit?: boolean
}

const groupNumber = (group: WeekendGroupWithId): number | null =>
  group.weekends.MENS?.number ?? group.weekends.WOMENS?.number ?? null

const groupDateRange = (group: WeekendGroupWithId): string =>
  formatDateRange(
    group.weekends.MENS?.start_date ?? group.weekends.WOMENS?.start_date,
    group.weekends.WOMENS?.end_date ?? group.weekends.MENS?.end_date
  )

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <p className="font-serif text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function WeekendSubCard({
  weekend,
  stats,
}: {
  weekend: Weekend
  stats: WeekendStats | null
}) {
  const genderTitle = formatWeekendGender(weekend.type, 'possessive')
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
      <div>
        <p className="font-medium">
          {isNil(genderTitle) ? 'Weekend' : `${genderTitle} Weekend`}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(weekend.start_date, weekend.end_date)}
        </p>
      </div>
      {!isNil(stats) && (
        <div className="grid grid-cols-3 gap-3">
          {!isNil(stats.candidatesConfirmed) && (
            <StatTile
              value={`${stats.candidatesConfirmed} / ${stats.candidateCapacity}`}
              label="Candidates"
            />
          )}
          {!isNil(stats.teamServing) && (
            <StatTile value={`${stats.teamServing}`} label="Team" />
          )}
          {!isNil(stats.feesOpen) && (
            <StatTile value={`${stats.feesOpen}`} label="Fees open" />
          )}
        </div>
      )}
      <div className="mt-auto space-y-1.5">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/admin/weekends/${weekend.id}`}>
            Open the weekend hub
          </Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Candidates, roster, and schedule live there
        </p>
      </div>
    </div>
  )
}

function GroupLinks({ group }: { group: WeekendGroupWithId }) {
  return (
    <div className="flex items-center gap-2">
      {(
        [
          [WeekendType.MENS, group.weekends.MENS],
          [WeekendType.WOMENS, group.weekends.WOMENS],
        ] as const
      ).map(([type, weekend]) =>
        isNil(weekend) ? null : (
          <Button key={type} asChild variant="ghost" size="sm">
            <Link href={`/admin/weekends/${weekend.id}`}>
              {formatWeekendGender(type, 'possessive')}
            </Link>
          </Button>
        )
      )}
    </div>
  )
}

export function Weekends({
  buckets,
  activeStats,
  allGroups,
  canEdit = false,
}: WeekendsProps) {
  const [selectedGroup, setSelectedGroup] = useState<WeekendGroupWithId | null>(
    null
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const openCreate = () => {
    if (!canEdit) return
    setSelectedGroup(null)
    setIsSidebarOpen(true)
  }

  const openEdit = (group: WeekendGroupWithId) => {
    if (!canEdit) return
    setSelectedGroup(group)
    setIsSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
    setSelectedGroup(null)
  }

  const activeGroup = buckets.active

  return (
    <div className="space-y-8">
      <PageHeader
        title="Weekends"
        description="Create and archive weekend groups. Day-to-day management — candidates, roster, and schedule — happens on each weekend's own hub."
      >
        {canEdit && (
          <>
            <SetActiveWeekendButton
              weekendGroups={allGroups.filter(
                (g) => getGroupStatus(g) !== WeekendStatus.FINISHED
              )}
            />
            <Button onClick={openCreate} aria-expanded={isSidebarOpen}>
              <Plus className="h-4 w-4" />
              New weekend group
            </Button>
          </>
        )}
      </PageHeader>

      {isNil(activeGroup) ? (
        <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          No active weekend group right now.
        </div>
      ) : (
        <section className="rounded-lg border bg-card p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Typography variant="h4" as="h2">
              {formatWeekendGroupTitle(groupNumber(activeGroup))}
            </Typography>
            <Badge className="border-transparent bg-success/15 text-success">
              Active
            </Badge>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => openEdit(activeGroup)}
              >
                <Settings2 className="h-4 w-4" />
                Group settings
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {!isNil(activeGroup.weekends.MENS) && (
              <WeekendSubCard
                weekend={activeGroup.weekends.MENS}
                stats={activeStats?.MENS ?? null}
              />
            )}
            {!isNil(activeGroup.weekends.WOMENS) && (
              <WeekendSubCard
                weekend={activeGroup.weekends.WOMENS}
                stats={activeStats?.WOMENS ?? null}
              />
            )}
          </div>
        </section>
      )}

      {buckets.upcoming.map((group) => (
        <section
          key={group.groupId}
          className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {formatWeekendGroupTitle(groupNumber(group))}
            </p>
            <p className="text-sm text-muted-foreground">
              {groupDateRange(group)} · planning
            </p>
          </div>
          <GroupLinks group={group} />
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => openEdit(group)}>
              <Settings2 className="h-4 w-4" />
              Group settings
            </Button>
          )}
        </section>
      ))}

      {showStartPlanningRow(buckets) && (
        <section className="rounded-lg border-2 border-dashed p-6 text-center">
          <p className="font-medium">
            {formatWeekendGroupTitle(nextGroupNumber(allGroups))}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Not scheduled yet — set dates to open planning.
          </p>
          {canEdit && (
            <Button variant="outline" className="mt-4" onClick={openCreate}>
              <CalendarPlus className="h-4 w-4" />
              Start planning
            </Button>
          )}
        </section>
      )}

      {buckets.past.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Past weekends
          </p>
          <div className="space-y-2">
            {buckets.past.map((group) => (
              <div
                key={group.groupId}
                className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {formatWeekendGroupTitle(groupNumber(group))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {groupDateRange(group)}
                  </p>
                </div>
                <GroupLinks group={group} />
              </div>
            ))}
          </div>
        </section>
      )}

      <WeekendSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        weekendGroup={selectedGroup}
        nextGroupNumber={nextGroupNumber(allGroups)}
      />
    </div>
  )
}
