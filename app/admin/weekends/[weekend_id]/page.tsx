import {
  getWeekendById,
  getWeekendRoster,
  getAllUsers,
} from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import { AddTeamMemberButton } from './add-team-member-button'
import { WeekendRosterTable } from './weekend-roster-table'

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

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
              <Typography variant="muted" className="text-lg">
                {formatDate(weekend.start_date)} -{' '}
                {formatDate(weekend.end_date)}
              </Typography>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={weekend.type === 'MENS' ? 'default' : 'secondary'}
                className="text-sm"
              >
                {weekend.type}
              </Badge>
              <Badge
                variant={
                  weekend.status === 'ACTIVE'
                    ? 'default'
                    : weekend.status === 'PLANNING'
                      ? 'outline'
                      : 'secondary'
                }
                className="text-sm"
              >
                {weekend.status || 'UNKNOWN'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <Typography variant="muted" className="font-medium">
                Weekend Number
              </Typography>
              <Typography>{weekend.number || 'Not Set'}</Typography>
            </div>
            <div>
              <Typography variant="muted" className="font-medium">
                Start Date
              </Typography>
              <Typography>{formatDate(weekend.start_date)}</Typography>
            </div>
            <div>
              <Typography variant="muted" className="font-medium">
                End Date
              </Typography>
              <Typography>{formatDate(weekend.end_date)}</Typography>
            </div>
          </div>
        </div>

        {/* Team Roster Section */}
        <div>
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-4">
              <div>
                <Typography variant="h2" className="text-xl mb-2">
                  Team Roster
                </Typography>
                <Typography variant="muted">
                  Team members assigned to this weekend ({roster.length}{' '}
                  members)
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
