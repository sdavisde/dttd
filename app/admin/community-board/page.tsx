import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Typography } from '@/components/ui/typography'
import { getMasterRoster } from '@/services/master-roster'
import { getRoles } from '@/services/identity/roles'
import { getContactInformation } from '@/services/notifications'
import { isErr } from '@/lib/results'
import { ExternalLink, Upload } from 'lucide-react'
import { RoleAssignments } from './components/role-assignments'

const roleSortOrder = [
  'President',
  'Vice President',
  'Corresponding Secretary',
  'Recording Secretary',
  'Treasurer',
  'Community Spiritual Director',
  'Pre Weekend Couple',
  'Admin',
]

const meetingMinutes = [
  {
    date: '01/06/2026',
    location: 'Milam County Cowboy Church',
    pdfLabel: 'January 2026 Minutes',
  },
  {
    date: '12/02/2025',
    location: 'DTTD Fellowship Hall',
    pdfLabel: 'December 2025 Minutes',
  },
]

export default async function CommunityBoardPage() {
  const rolesResult = await getRoles()
  const rosterResult = await getMasterRoster()
  const preWeekendCoupleContactResult =
    await getContactInformation('preweekend-couple')

  if (isErr(rolesResult)) {
    throw new Error(`Failed to fetch roles: ${rolesResult.error}`)
  }

  if (isErr(rosterResult)) {
    throw new Error(`Failed to fetch roster: ${rosterResult.error}`)
  }

  if (isErr(preWeekendCoupleContactResult)) {
    throw new Error(
      `Failed to fetch pre-weekend couple contact: ${preWeekendCoupleContactResult.error}`
    )
  }

  const roles = rolesResult.data
  const members = rosterResult.data.members.map((member) => ({
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    roles: member.roles,
  }))
  const leadersCommitteeRole = roles.find(
    (role) => role.label === 'Leaders Committee'
  )
  const boardRoles = roles.filter((role) => role.label !== 'Leaders Committee')
  const preWeekendCoupleContact = preWeekendCoupleContactResult.data

  const sortedBoardRoles = [...boardRoles].sort((a, b) => {
    const aIndex = roleSortOrder.indexOf(a.label)
    const bIndex = roleSortOrder.indexOf(b.label)
    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
    }
    return a.label.localeCompare(b.label)
  })

  return (
    <>
      <AdminBreadcrumbs
        title="Community Board"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8 pb-10 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Typography variant="h2" className="border-0 pb-0">
              Community Board
            </Typography>
            <Typography variant="muted">
              Org-level roles, leadership assignments, and board meeting
              minutes.
            </Typography>
          </div>
        </div>

        <RoleAssignments
          boardRoles={sortedBoardRoles}
          leadersCommitteeRole={leadersCommitteeRole ?? null}
          members={members}
          preWeekendCoupleContact={preWeekendCoupleContact}
        />

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Board Meeting Minutes</CardTitle>
              <Typography variant="muted">
                Meeting minutes are visible to everyone.
              </Typography>
            </div>
            <Button className="gap-2" variant="outline" size="sm">
              <Upload className="h-4 w-4" />
              Add Minutes
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetingMinutes.map((minute) => (
                  <TableRow key={`${minute.date}-${minute.location}`}>
                    <TableCell>{minute.date}</TableCell>
                    <TableCell>{minute.location}</TableCell>
                    <TableCell>
                      <Button variant="link" size="sm" asChild>
                        <a href="#" target="_blank" rel="noreferrer">
                          {minute.pdfLabel}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
