import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'
import { guardAdminPage } from '@/lib/admin/page-guard'
import { Permission } from '@/lib/security'
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
  // Assigning positions and changing the notification email both go through
  // actions gated on WRITE_USER_ROLES, so the affordances follow the same rule.
  const { canEdit } = await guardAdminPage({
    edit: [Permission.WRITE_USER_ROLES],
  })

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
        title="Community"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-4 pb-10 sm:px-8 py-6">
        <PageHeader
          title="Community"
          description="Who holds each position — the board, its committees and teams — and the board's meeting minutes."
        />

        <RoleAssignments
          boardRoles={boardRoles}
          committeeRoles={committeeRoles}
          members={members}
          preWeekendCoupleContact={preWeekendCoupleContact}
          canEdit={canEdit}
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
