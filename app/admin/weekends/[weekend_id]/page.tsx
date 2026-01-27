import {
  getWeekendById,
  getWeekendRoster,
  getAllUsers,
} from '@/services/weekend'
import { isErr } from '@/lib/results'
import { WeekendStatus } from '@/lib/weekend/types'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Typography } from '@/components/ui/typography'
import { notFound } from 'next/navigation'
import { AddTeamMemberButton } from './add-team-member-button'
import { WeekendRosterTable } from './weekend-roster-table'
import {
  DroppedRosterSection,
  ActiveRosterHeader,
  WeekendStatusBadge,
} from '@/components/weekend'
import { ExperienceDistributionChart } from '@/components/weekend/experience-distribution-chart'
import { getWeekendRosterExperienceDistribution } from '@/services/master-roster'
import { formatDateOnly } from '@/lib/utils'
import { Datetime } from '@/components/ui/datetime'

type WeekendDetailPageProps = {
  params: Promise<{ weekend_id: string }>
}

export default async function WeekendDetailPage({
  params,
}: WeekendDetailPageProps) {
  const { weekend_id } = await params

  const [weekendResult, rosterResult, usersResult, experienceResult] =
    await Promise.all([
      getWeekendById(weekend_id),
      getWeekendRoster(weekend_id),
      getAllUsers(),
      getWeekendRosterExperienceDistribution(weekend_id),
    ])

  if (isErr(weekendResult)) {
    if (weekendResult.error === 'Weekend not found') {
      notFound()
    }
    throw new Error(`Failed to fetch weekend: ${weekendResult.error}`)
  }

  if (isErr(rosterResult)) {
    throw new Error(`Failed to fetch roster: ${rosterResult.error}`)
  }

  if (isErr(usersResult)) {
    throw new Error(`Failed to fetch users: ${usersResult.error}`)
  }

  const weekend = weekendResult.data
  const roster = rosterResult.data
  const users = usersResult.data
  const experienceDistribution = experienceResult.data ?? null

  // Filter users for add team member modal
  const rosterUserIds = new Set(roster.map((r) => r.user_id).filter(Boolean))
  const availableUsers = users.filter((user) => !rosterUserIds.has(user.id))

  // Determine if weekend is editable (active/upcoming)
  const isEditable =
    weekend.status === WeekendStatus.ACTIVE ||
    weekend.status === WeekendStatus.PLANNING

  const startDate = formatDateOnly(weekend.start_date)
  const endDate = formatDateOnly(weekend.end_date)

  return (
    <>
      <AdminBreadcrumbs
        title={weekend.title ?? `${weekend.type} Weekend #${weekend.number}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Weekends', href: '/admin/weekends' },
        ]}
      />
      <div className="container mx-auto px-8 py-2 md:py-4">
        {/* Weekend Information */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left side: Weekend info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Typography variant="h5" className="text-2xl">
                  {weekend.title ??
                    `${weekend.type} Weekend #${weekend.number}`}
                </Typography>
                <WeekendStatusBadge status={weekend.status} />
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
            </div>

            {/* Right side: Experience chart */}
            {experienceDistribution && (
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
              {isEditable && (
                <AddTeamMemberButton
                  weekendId={weekend_id}
                  weekendTitle={
                    weekend.title ??
                    `${weekend.type} Weekend #${weekend.number}`
                  }
                  users={availableUsers}
                />
              )}
            </ActiveRosterHeader>
          </div>

          <WeekendRosterTable roster={roster} isEditable={isEditable} />
        </div>

        {/* Dropped Team Members Section */}
        <DroppedRosterSection roster={roster} />
      </div>
    </>
  )
}
