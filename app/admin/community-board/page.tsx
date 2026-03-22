import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Typography } from '@/components/ui/typography'
import { getCommunityBoardData } from '@/services/community/board'
import { getMeetingMinutesPage } from '@/lib/files'
import { isErr } from '@/lib/results'
import type { PagedMeetingMinuteFiles } from '@/lib/files/types'
import { RoleAssignments } from './components/role-assignments'
import { MeetingMinutes } from './components/meeting-minutes'

export default async function CommunityBoardPage() {
  const [result, meetingMinutesResult] = await Promise.all([
    getCommunityBoardData(),
    getMeetingMinutesPage(1, 10),
  ])

  if (isErr(result)) {
    throw new Error(result.error)
  }

  const meetingMinutesPageSize = 10
  let meetingMinutesLoadError: string | null = null
  let meetingMinutesInitialPageData: PagedMeetingMinuteFiles

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
  const { boardRoles, committeeRoles, members, preWeekendCoupleContact } =
    result.data

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
          boardRoles={boardRoles}
          committeeRoles={committeeRoles}
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
