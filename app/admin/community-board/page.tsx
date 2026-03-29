import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Typography } from '@/components/ui/typography'
import { getCommunityBoardData } from '@/services/community/board'
import { getMeetingMinutesPage } from '@/services/files/file-service'
import { isErr } from '@/lib/results'
import type { PagedMeetingMinuteFiles } from '@/lib/files/types'
import { RoleAssignments } from './components/role-assignments'
import { MeetingMinutes } from './components/meeting-minutes'

const MEETING_MINUTES_PAGE_SIZE = 10

function createEmptyMeetingMinutesPageData(): PagedMeetingMinuteFiles {
  return {
    page: 1,
    pageSize: MEETING_MINUTES_PAGE_SIZE,
    sortField: 'created_at',
    sortDirection: 'desc',
    currentPageItems: [],
    nextPageItems: [],
  }
}

export default async function CommunityBoardPage() {
  const [communityBoardResult, meetingMinutesPageResult] = await Promise.all([
    getCommunityBoardData(),
    getMeetingMinutesPage(1, MEETING_MINUTES_PAGE_SIZE),
  ])

  if (isErr(communityBoardResult)) {
    throw new Error(communityBoardResult.error)
  }

  const meetingMinutesLoadError = isErr(meetingMinutesPageResult)
    ? meetingMinutesPageResult.error
    : null
  const meetingMinutesInitialPageData = isErr(meetingMinutesPageResult)
    ? createEmptyMeetingMinutesPageData()
    : meetingMinutesPageResult.data

  const { boardRoles, committeeRoles, members, preWeekendCoupleContact } =
    communityBoardResult.data

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
