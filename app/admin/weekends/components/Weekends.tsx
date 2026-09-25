'use client'

import { useState } from 'react'
import Link from 'next/link'
import { isNil } from 'lodash'
import {
  ArrowUpRight,
  CalendarPlus,
  CircleDollarSign,
  Plus,
  Settings2,
} from 'lucide-react'
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
import { hubPath } from '@/lib/weekend/hub'
import type { Weekend, WeekendGroupWithId } from '@/lib/weekend/types'
import { WeekendStatus, WeekendType } from '@/lib/weekend/types'
import {
  formatPastCandidateCounts,
  nextGroupNumber,
  showStartPlanningRow,
  type ActiveGroupStats,
  type BoardGroupBuckets,
  type WeekendStats,
} from '@/lib/admin/weekend-stats'
import { formatFee, type GroupFees } from '@/lib/payments/group-fees'
import type { FeeDefaults } from '@/services/fees'
import { WeekendSidebar } from './WeekendSidebar'
import { SetActiveWeekendButton } from './SetActiveWeekendButton'
import { GroupFeesDialog } from './GroupFeesDialog'

interface WeekendsProps {
  buckets: BoardGroupBuckets
  activeStats: ActiveGroupStats | null
  /** Non-rejected candidate counts keyed by weekend id, for the past rows. */
  pastCandidateCounts?: Record<string, number> | null
  allGroups: WeekendGroupWithId[]
  canEdit?: boolean
  /** Fees keyed by group id; a group missing here isn't tracked. Null when unreadable. */
  feesByGroupId?: Record<string, GroupFees> | null
  feeDefaults?: FeeDefaults | null
  canManageFees?: boolean
  canReadPayments?: boolean
}

const groupNumber = (group: WeekendGroupWithId): number | null =>
  group.weekends.MENS?.number ?? group.weekends.WOMENS?.number ?? null

const groupDateRange = (group: WeekendGroupWithId): string =>
  formatDateRange(
    group.weekends.MENS?.start_date ?? group.weekends.WOMENS?.start_date,
    group.weekends.WOMENS?.end_date ?? group.weekends.MENS?.end_date
  )

function StatTile({
  value,
  suffix,
  label,
}: {
  value: string
  suffix?: string
  label: string
}) {
  return (
    <div className="min-w-0">
      <p className="font-serif text-xl font-semibold tabular-nums">
        {value}
        {!isNil(suffix) && (
          <span className="font-sans text-[13px] font-normal text-muted-foreground">
            {' '}
            {suffix}
          </span>
        )}
      </p>
      <p className="text-[12.5px] text-muted-foreground">{label}</p>
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
    <div className="flex flex-col gap-3.5 rounded-lg border bg-card px-5 py-4">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
        <p className="text-base font-semibold">
          {isNil(genderTitle) ? 'Weekend' : `${genderTitle} Weekend`}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(weekend.start_date, weekend.end_date)}
        </p>
      </div>
      {!isNil(stats) && (
        <div className="flex flex-wrap gap-x-7 gap-y-3">
          {!isNil(stats.candidatesConfirmed) && (
            <StatTile
              value={`${stats.candidatesConfirmed}`}
              suffix={`/ ${stats.candidateCapacity}`}
              label="Candidates"
            />
          )}
          {!isNil(stats.teamServing) && (
            <StatTile value={`${stats.teamServing}`} label="Team" />
          )}
          {!isNil(stats.candidatesToReview) && (
            <StatTile value={`${stats.candidatesToReview}`} label="To review" />
          )}
          {!isNil(stats.feesOpen) && (
            <StatTile value={`${stats.feesOpen}`} label="Fees open" />
          )}
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2.5">
        <Button asChild variant="outline">
          <Link
            href={
              isNil(weekend.groupId)
                ? '/weekends'
                : hubPath(weekend.groupId, 'overview', weekend.type)
            }
            title="Opens the weekend hub on the member site, outside Admin"
          >
            Open the weekend hub
            <ArrowUpRight className="h-4 w-4" aria-hidden />
            <span className="sr-only">(leaves Admin)</span>
          </Link>
        </Button>
        <p className="text-[13px] text-muted-foreground">
          Candidates, roster, and schedule live there
        </p>
      </div>
    </div>
  )
}

/** Opens a group's fees: "Fee $200", or a nudge when none are set. */
function FeeButton({
  fees,
  onClick,
}: {
  fees: GroupFees | null | undefined
  onClick: () => void
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <CircleDollarSign className="h-4 w-4" />
      {isNil(fees) ? 'No fees set' : `Fee ${formatFee(fees.teamFee)}`}
    </Button>
  )
}

function GroupLinks({ group }: { group: WeekendGroupWithId }) {
  return (
    <div className="flex items-center gap-4">
      {(
        [
          [WeekendType.MENS, group.weekends.MENS],
          [WeekendType.WOMENS, group.weekends.WOMENS],
        ] as const
      ).map(([type, weekend]) =>
        isNil(weekend) ? null : (
          <Link
            key={type}
            href={hubPath(group.groupId, 'overview', type)}
            className="text-[13.5px] font-semibold text-primary hover:text-primary-hover"
          >
            {formatWeekendGender(type, 'possessive')}
          </Link>
        )
      )}
    </div>
  )
}

export function Weekends({
  buckets,
  activeStats,
  pastCandidateCounts = null,
  allGroups,
  canEdit = false,
  feesByGroupId = null,
  feeDefaults = null,
  canManageFees = false,
  canReadPayments = false,
}: WeekendsProps) {
  const [selectedGroup, setSelectedGroup] = useState<WeekendGroupWithId | null>(
    null
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [feesGroup, setFeesGroup] = useState<WeekendGroupWithId | null>(null)

  // Prices are visible to anyone here; the dialog (history, changes) is for
  // people who handle money. Unknown fees (a failed read) hide the button.
  const canOpenFees =
    !isNil(feesByGroupId) && (canManageFees || canReadPayments)
  const feesFor = (group: WeekendGroupWithId) =>
    feesByGroupId?.[group.groupId] ?? null
  const feeButton = (group: WeekendGroupWithId) =>
    canOpenFees ? (
      <FeeButton fees={feesFor(group)} onClick={() => setFeesGroup(group)} />
    ) : null

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
              feesByGroupId={feesByGroupId}
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
        <section className="rounded-lg border bg-card px-6 py-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Typography variant="h4" as="h2">
              {formatWeekendGroupTitle(groupNumber(activeGroup))}
            </Typography>
            <Badge className="rounded-full border-transparent bg-success/15 px-3 font-semibold text-success">
              Active
            </Badge>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {feeButton(activeGroup)}
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(activeGroup)}
                >
                  <Settings2 className="h-4 w-4" />
                  Group settings
                </Button>
              )}
            </div>
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
          className="flex flex-wrap items-center gap-x-3.5 gap-y-1 rounded-lg border bg-card px-6 py-4"
        >
          <p className="text-[15px] font-semibold">
            {formatWeekendGroupTitle(groupNumber(group))}
          </p>
          <p className="text-[13.5px] text-muted-foreground">
            {groupDateRange(group)} · planning
          </p>
          <div className="ml-auto flex flex-wrap items-center gap-4">
            <GroupLinks group={group} />
            {feeButton(group)}
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEdit(group)}
              >
                <Settings2 className="h-4 w-4" />
                Group settings
              </Button>
            )}
          </div>
        </section>
      ))}

      {showStartPlanningRow(buckets) && (
        <section className="flex flex-wrap items-center gap-3.5 rounded-lg border border-dashed bg-card px-6 py-4">
          <CalendarPlus
            className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">
              {formatWeekendGroupTitle(nextGroupNumber(allGroups))}
            </p>
            <p className="text-[13.5px] text-muted-foreground">
              Not scheduled yet — set dates and leadership to open planning
            </p>
          </div>
          {canEdit && (
            <Button variant="outline" onClick={openCreate}>
              Start planning
            </Button>
          )}
        </section>
      )}

      {buckets.past.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Past weekends
          </p>
          <div className="rounded-lg border bg-card">
            {buckets.past.map((group) => {
              const candidateCounts = formatPastCandidateCounts(
                group,
                pastCandidateCounts
              )
              return (
                <div
                  key={group.groupId}
                  className="flex flex-wrap items-center gap-x-3.5 gap-y-1 border-b border-divider px-5 py-3 last:border-b-0"
                >
                  <p className="text-sm font-semibold">
                    {formatWeekendGroupTitle(groupNumber(group))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {groupDateRange(group)}
                    {!isNil(candidateCounts) && ` \u00b7 ${candidateCounts}`}
                  </p>
                  <div className="ml-auto flex flex-wrap items-center gap-4">
                    <GroupLinks group={group} />
                    {feeButton(group)}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <WeekendSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        weekendGroup={selectedGroup}
        nextGroupNumber={nextGroupNumber(allGroups)}
        feeDefaults={feeDefaults}
        canManageFees={canManageFees}
      />

      {!isNil(feesGroup) && (
        <GroupFeesDialog
          key={feesGroup.groupId}
          open
          onClose={() => setFeesGroup(null)}
          groupId={feesGroup.groupId}
          groupNumber={groupNumber(feesGroup)}
          fees={feesFor(feesGroup)}
          defaults={feeDefaults}
          canManageFees={canManageFees}
          canReadHistory={canReadPayments}
        />
      )}
    </div>
  )
}
