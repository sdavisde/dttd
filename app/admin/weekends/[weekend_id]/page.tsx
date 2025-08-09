import { getWeekendById, getWeekendRoster, getAllUsers } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import { AddTeamMemberButton } from './add-team-member-button'

type WeekendDetailPageProps = {
  params: Promise<{ weekend_id: string }>
}

export default async function WeekendDetailPage({ params }: WeekendDetailPageProps) {
  const { weekend_id } = await params
  
  const [weekendResult, rosterResult, usersResult] = await Promise.all([
    getWeekendById(weekend_id),
    getWeekendRoster(weekend_id),
    getAllUsers()
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
  const isEditable = weekend.status === 'ACTIVE' || weekend.status === 'PLANNING'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatRole = (role: string | null) => {
    if (!role) return 'No Role'
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <>
      <AdminBreadcrumbs
        title={weekend.title || `${weekend.type} Weekend #${weekend.number}`}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Weekends', href: '/admin/weekends' }
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
                {formatDate(weekend.start_date)} - {formatDate(weekend.end_date)}
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
              <Typography variant="muted" className="font-medium">Weekend Number</Typography>
              <Typography>{weekend.number || 'Not Set'}</Typography>
            </div>
            <div>
              <Typography variant="muted" className="font-medium">Start Date</Typography>
              <Typography>{formatDate(weekend.start_date)}</Typography>
            </div>
            <div>
              <Typography variant="muted" className="font-medium">End Date</Typography>
              <Typography>{formatDate(weekend.end_date)}</Typography>
            </div>
          </div>
        </div>

        {/* Team Roster Section */}
        <div>
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-4">
              <div>
                <Typography variant="h2" className="text-xl mb-2">Team Roster</Typography>
                <Typography variant="muted">
                  Team members assigned to this weekend ({roster.length} members)
                </Typography>
              </div>
              {isEditable && (
                <AddTeamMemberButton
                  weekendId={weekend_id}
                  weekendTitle={weekend.title || `${weekend.type} Weekend #${weekend.number}`}
                  users={users}
                />
              )}
            </div>
          </div>
          
          <div className="relative">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold min-w-[200px]">Name</TableHead>
                    <TableHead className="min-w-[150px]">Email</TableHead>
                    <TableHead className="min-w-[150px]">Phone</TableHead>
                    <TableHead className="min-w-[150px]">Role</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">
                          No team members assigned to this weekend.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    roster.map((member, index) => (
                      <TableRow
                        key={member.id}
                        className={`hover:bg-muted/50 ${index % 2 === 0 ? '' : 'bg-muted/25'}`}
                      >
                        <TableCell className="font-medium">
                          {member.users?.first_name && member.users?.last_name
                            ? `${member.users.first_name} ${member.users.last_name}`
                            : 'Unknown User'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.users?.email || 'No email'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.users?.phone_number || 'No phone'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {formatRole(member.cha_role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.status === 'paid'
                                ? 'default'
                                : member.status === 'confirmed'
                                  ? 'outline'
                                  : 'secondary'
                            }
                          >
                            {member.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}