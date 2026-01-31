import { WeekendRosterTable } from '@/app/admin/weekends/[weekend_id]/weekend-roster-table'
import { AddTeamMemberButton } from '@/app/admin/weekends/[weekend_id]/add-team-member-button'
import {
  DroppedRosterSection,
  ActiveRosterHeader,
  WeekendStatusBadge,
} from '@/components/weekend'
import { ExperienceDistributionChart } from '@/components/weekend/experience-distribution-chart'
import { Typography } from '@/components/ui/typography'
import { Datetime } from '@/components/ui/datetime'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { isNil } from 'lodash'
import { WeekendStatus } from '@/lib/weekend/types'
import { getWeekendRosterViewData } from '@/services/weekend'
import { Permission, userHasPermission } from '@/lib/security'
import { User } from '@/lib/users/types'
import { formatDateOnly } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { Results } from '@/lib/results'

export type WeekendRosterViewProps = {
  weekendId: string
  user: User

  // Optional slot for header content (e.g., tabs for switching weekends, status badge)
  headerSlot?: React.ReactNode
}

export async function WeekendRosterView({
  weekendId,
  user,
  headerSlot,
}: WeekendRosterViewProps) {
  // Load all data using the service
  const result = await getWeekendRosterViewData(weekendId, user)

  if (Results.isErr(result)) {
    throw new Error(result.error)
  }

  const { weekend, roster, experienceDistribution, availableUsers } =
    result.data

  // Permission checks for UI rendering
  const canViewPaymentInfo = userHasPermission(user, [
    Permission.READ_WRITE_TEAM_PAYMENTS,
  ])
  const canEditRoster = userHasPermission(user, [Permission.WRITE_TEAM_ROSTER])
  const canViewDroppedMembers = userHasPermission(user, [
    Permission.READ_DROPPED_ROSTER,
  ])
  const canViewExperienceDistribution = userHasPermission(user, [
    Permission.READ_USER_EXPERIENCE,
  ])

  // Check if weekend is editable
  const isWeekendEditable =
    weekend.status === WeekendStatus.ACTIVE ||
    weekend.status === WeekendStatus.PLANNING

  const startDate = formatDateOnly(weekend.start_date)
  const endDate = formatDateOnly(weekend.end_date)
  const weekendTitle =
    weekend.title ?? `${weekend.type} Weekend #${weekend.number}`

  return (
    <>
      {/* Weekend Information Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left side: Weekend info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Typography variant="h5" className="text-2xl">
                {weekendTitle}
              </Typography>
              {headerSlot}
              {!headerSlot && weekend.status && (
                <WeekendStatusBadge status={weekend.status} />
              )}
            </div>
            <Typography
              as="span"
              variant="muted"
              className="text-lg flex items-center gap-2"
            >
              <Datetime dateTime={startDate} />
              <span>-</span>
              <Datetime dateTime={endDate} />
            </Typography>
            {weekend.groupId && (
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link
                  href={`/candidate-list?weekend=${weekend.groupId}&weekendType=${weekend.type}`}
                >
                  <Users className="h-4 w-4" />
                  Candidates
                </Link>
              </Button>
            )}
          </div>

          {/* Right side: Experience chart */}
          {canViewExperienceDistribution && !isNil(experienceDistribution) && (
            <div className="lg:w-auto">
              <ExperienceDistributionChart
                distribution={experienceDistribution}
              />
            </div>
          )}
        </div>
      </div>

      {/* Team Roster Section */}
      <div>
        <div className="mb-4">
          <ActiveRosterHeader roster={roster} title="Team Roster">
            {canEditRoster && isWeekendEditable && (
              <AddTeamMemberButton
                weekendId={weekend.id}
                weekendTitle={weekendTitle}
                users={availableUsers}
              />
            )}
          </ActiveRosterHeader>
        </div>

        <WeekendRosterTable
          roster={roster}
          isEditable={canEditRoster && isWeekendEditable}
          includePaymentInformation={canViewPaymentInfo}
        />
      </div>

      {/* Dropped Team Members Section - Only shown to specific CHA roles */}
      {canViewDroppedMembers && <DroppedRosterSection roster={roster} />}
    </>
  )
}
