import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'
import { guardAdminPage } from '@/lib/admin/page-guard'
import { Permission } from '@/lib/security'
import { getCommunityBoardData } from '@/services/community/board'
import { getMeetingMinutesPage } from '@/services/files/file-service'
import { isErr, Results } from '@/lib/results'
import { RoleAssignments } from './components/role-assignments'
import { MeetingMinutes } from './components/meeting-minutes'

/**
 * The card is a recent-first shortcut, not the full listing — that lives in
 * Files, one click away.
 */
const MEETING_MINUTES_PREVIEW_COUNT = 5

export default async function CommunityBoardPage() {
  // Assigning positions and changing the notification email both go through
  // actions gated on WRITE_USER_ROLES, so the affordances follow the same rule.
  const { canEdit } = await guardAdminPage({
    edit: [Permission.WRITE_USER_ROLES],
  })

  const [communityBoardResult, meetingMinutesPageResult] = await Promise.all([
    getCommunityBoardData(),
    getMeetingMinutesPage(1, MEETING_MINUTES_PREVIEW_COUNT),
  ])

  if (isErr(communityBoardResult)) {
    throw new Error(communityBoardResult.error)
  }

  const meetingMinutesLoadError = isErr(meetingMinutesPageResult)
    ? meetingMinutesPageResult.error
    : null
  const meetingMinutesFiles = Results.unwrapOr(
    Results.map(meetingMinutesPageResult, (page) => page.currentPageItems),
    []
  )

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
            files={meetingMinutesFiles}
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
