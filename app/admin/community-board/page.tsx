import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Typography } from '@/components/ui/typography'
import { getMasterRoster } from '@/services/master-roster'
import { getRoles } from '@/services/identity/roles'
import { getContactInformation } from '@/services/notifications'
import { getMeetingMinutesPage } from '@/lib/files'
import { isErr } from '@/lib/results'
import { PagedFileItems } from '@/lib/files/types'
import { RoleAssignments } from './components/role-assignments'
import { MeetingMinutes } from './components/meeting-minutes'

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

export default async function CommunityBoardPage() {
  const rolesResult = await getRoles()
  const rosterResult = await getMasterRoster()
  const preWeekendCoupleContactResult =
    await getContactInformation('preweekend-couple')
  const meetingMinutesResult = await getMeetingMinutesPage(1, 10)

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
  const meetingMinutesPageSize = 10
  let meetingMinutesLoadError: string | null = null
  let meetingMinutesInitialPageData: PagedFileItems

  if (isErr(meetingMinutesResult)) {
    meetingMinutesLoadError = meetingMinutesResult.error
    meetingMinutesInitialPageData = {
      page: 1,
      pageSize: meetingMinutesPageSize,
      sortField: 'created_at',
      sortDirection: 'desc',
      currentPageItems: [],
      nextPageItems: [],
    }
  } else {
    meetingMinutesInitialPageData = meetingMinutesResult.data
  }

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

        <MeetingMinutes
          initialPageData={meetingMinutesInitialPageData}
          loadError={meetingMinutesLoadError}
        />
      </div>
    </>
  )
}
