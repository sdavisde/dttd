import {
  getWeekendById,
  getWeekendRoster,
  getAllUsers,
} from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Typography } from '@/components/ui/typography'
import { notFound } from 'next/navigation'
import { AddTeamMemberButton } from './add-team-member-button'
import { WeekendRosterTable } from './weekend-roster-table'
import { formatDateTime } from '@/lib/utils'
import { Datetime } from '@/components/ui/datetime'

type WeekendDetailPageProps = {
  params: Promise<{ weekend_id: string }>
}

export default async function WeekendDetailPage({
  params,
}: WeekendDetailPageProps) {
  const { weekend_id } = await params

  const [weekendResult, rosterResult, usersResult] = await Promise.all([
    getWeekendById(weekend_id),
    getWeekendRoster(weekend_id),
    getAllUsers(),
  ])

  if (isErr(weekendResult)) {
    if (weekendResult.error.message === 'Weekend not found') {
      notFound()
    }
    throw new Error(`Failed to fetch weekend: ${weekendResult.error.message}`)
  }

  if (isErr(rosterResult)) {
    throw new Error(`Failed to fetch roster: ${rosterResult.error.message}`)
  }

  if (isErr(usersResult)) {
    throw new Error(`Failed to fetch users: ${usersResult.error.message}`)
  }

  const weekend = weekendResult.data
  const roster = rosterResult.data
  const users = usersResult.data

  // Determine if weekend is editable (active/upcoming)
  const isEditable =
    weekend.status === 'ACTIVE' || weekend.status === 'PLANNING'

  const startDate = formatDateTime(weekend.start_date)
  const endDate = formatDateTime(weekend.end_date)

  return (
    <>
      <AdminBreadcrumbs
        title={weekend.title || `${weekend.type} Weekend #${weekend.number}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Weekends', href: '/admin/weekends' },
        ]}
      />
      <div className="container mx-auto px-8 py-2 md:py-4">
        {/* Weekend Information */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div>
              <Typography variant="h1" className="text-2xl mb-2">
                {weekend.title || `${weekend.type} Weekend #${weekend.number}`}
              </Typography>
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
          </div>
        </div>

        {/* Team Roster Section */}
        <div>
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-4">
              <div>
                <Typography
                  variant="h2"
                  className="text-xl mb-2 flex items-center"
                >
                  Team Roster
                  <span className="text-black/30 font-light text-base ms-2">
                    ({roster.length} members)
                  </span>
                </Typography>
              </div>
              {isEditable && (
                <AddTeamMemberButton
                  weekendId={weekend_id}
                  weekendTitle={
                    weekend.title ||
                    `${weekend.type} Weekend #${weekend.number}`
                  }
                  users={users}
                />
              )}
            </div>
          </div>

          <WeekendRosterTable roster={roster} isEditable={isEditable} />
        </div>
      </div>
    </>
  )
}
