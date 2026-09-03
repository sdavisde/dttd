import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'
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
      <div className="container mx-auto px-4 pb-10 sm:px-8 py-6">
        <PageHeader
          title="Community Board"
          description="Who holds each position — the board and its committees — and the board's meeting minutes."
        />

        <RoleAssignments
          boardRoles={boardRoles}
          committeeRoles={committeeRoles}
          members={members}
          preWeekendCoupleContact={preWeekendCoupleContact}
        >
          <MeetingMinutes
            initialPageData={meetingMinutesInitialPageData}
            loadError={meetingMinutesLoadError}
          />
        </RoleAssignments>

        <p className="mt-4 text-[13px] text-muted-foreground">
          Positions here are community-wide · weekend team roles live on each
          weekend&apos;s roster
        </p>
      </div>
    </>
  )
}
