import { notFound, redirect } from 'next/navigation'
import { isNil } from 'lodash'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { MemberBreadcrumbs } from '@/components/member/breadcrumbs'
import { PageContent } from '@/components/member/page-content'
import { HubTabs } from '@/components/weekend-hub/hub-tabs'
import { ManagementStrip } from '@/components/weekend-hub/management-strip'
import { getLoggedInUser } from '@/services/identity/user'
import { getCandidateReviewCountByWeekend } from '@/services/candidates'
import { isErr, Results } from '@/lib/results'
import { Permission, userHasPermission } from '@/lib/security'
import type { User } from '@/lib/users/types'
import { formatWeekendGender, formatWeekendGroupTitle } from '@/lib/weekend'
import {
  formatCompactDateRange,
  hubPath,
  resolveWeekendType,
  weekendLocation,
  type HubTab,
} from '@/lib/weekend/hub'
import type { Weekend, WeekendGroupWithId } from '@/lib/weekend/types'
import { WeekendType } from '@/lib/weekend/types'
import { loadHubEvents, loadHubGroup } from './hub-data'

export type HubSearchParams = Promise<{ weekend?: string | string[] }>

export type HubContext = {
  user: User
  group: WeekendGroupWithId
  weekendType: WeekendType
  weekend: Weekend
  /** The other weekend in the group (Women's when Men's is selected). */
  otherWeekend: Weekend
}

/**
 * Resolves the group, the viewer and the selected weekend for a hub page.
 * Layouts can't read search params, so each tab page calls this and wraps its
 * body in {@link WeekendHubFrame}; the reads are memoised per request.
 */
export async function loadHubContext(
  groupId: string,
  searchParams: HubSearchParams
): Promise<HubContext> {
  const [userResult, groupResult, params] = await Promise.all([
    getLoggedInUser(),
    loadHubGroup(groupId),
    searchParams,
  ])
  if (isErr(userResult)) redirect('/login')
  if (isErr(groupResult)) notFound()

  const user = userResult.data
  const group = groupResult.data
  const weekendType = resolveWeekendType(params.weekend, user.gender)
  const otherType =
    weekendType === WeekendType.MENS ? WeekendType.WOMENS : WeekendType.MENS

  return {
    user,
    group,
    weekendType,
    weekend: group.weekends[weekendType],
    otherWeekend: group.weekends[otherType],
  }
}

type WeekendHubFrameProps = {
  context: HubContext
  active: HubTab
  children: React.ReactNode
}

/**
 * The hub's shared opening: breadcrumb, serif title, the Men's / Women's
 * switch, section tabs and the per-feature management strip. Every tab page
 * renders inside it.
 */
export async function WeekendHubFrame({
  context,
  active,
  children,
}: WeekendHubFrameProps) {
  const { user, group, weekendType, weekend, otherWeekend } = context
  const groupTitle = formatWeekendGroupTitle(weekend.number)
  const gender = formatWeekendGender(weekendType, 'possessive') ?? ''
  const otherGender = formatWeekendGender(otherWeekend.type, 'possessive') ?? ''

  const canReviewCandidates = userHasPermission(user, [
    Permission.READ_CANDIDATES,
  ])
  const canBuildRoster = userHasPermission(user, [
    Permission.READ_TEAM_ROSTER_BUILDER,
  ])
  const canEditWeekend = userHasPermission(user, [Permission.WRITE_WEEKENDS])

  // Independent reads, fetched together; a failure only blanks its own detail.
  const [eventsResult, reviewCountResult] = await Promise.all([
    loadHubEvents(group.groupId),
    canReviewCandidates
      ? getCandidateReviewCountByWeekend(weekend.id)
      : Promise.resolve(null),
  ])
  const events = Results.unwrapOr(eventsResult, [])
  const reviewCount = isNil(reviewCountResult)
    ? null
    : Results.toNullable(reviewCountResult)

  const location = weekendLocation(events, weekend)
  const range = formatCompactDateRange(weekend.start_date, weekend.end_date)
  const otherRange = formatCompactDateRange(
    otherWeekend.start_date,
    otherWeekend.end_date
  )
  const otherLine =
    otherWeekend.type === WeekendType.WOMENS
      ? `${otherGender} Weekend follows ${otherRange ?? 'later'}`
      : `${otherGender} Weekend was ${otherRange ?? 'earlier'}`
  const description = [range, location, otherLine]
    .filter((part): part is string => !isNil(part))
    .join(' · ')

  return (
    <PageContent>
      <MemberBreadcrumbs
        title={groupTitle}
        breadcrumbs={[
          { label: 'Home', href: '/home' },
          { label: 'The weekends', href: '/weekends' },
        ]}
      />
      <PageHeader
        title={`${groupTitle} — ${gender} Weekend`}
        description={description}
        className="mb-4 border-b-0 pb-0"
      >
        <Button
          variant="outline"
          size="default"
          href={hubPath(group.groupId, 'schedule', weekendType)}
        >
          Weekend schedule
        </Button>
        <Button size="default" href="/sponsor">
          Sponsor someone
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SegmentedControl
          aria-label="Weekend"
          value={weekendType}
          options={[
            {
              value: WeekendType.MENS,
              label: "Men's",
              href: hubPath(group.groupId, active, WeekendType.MENS),
            },
            {
              value: WeekendType.WOMENS,
              label: "Women's",
              href: hubPath(group.groupId, active, WeekendType.WOMENS),
            },
          ]}
        />
      </div>

      <div className="mb-4">
        <HubTabs
          groupId={group.groupId}
          weekendType={weekendType}
          active={active}
        />
      </div>

      <div className="flex flex-col gap-4">
        <ManagementStrip
          groupId={group.groupId}
          weekendId={weekend.id}
          weekendType={weekendType}
          reviewCount={reviewCount}
          canReviewCandidates={canReviewCandidates}
          canBuildRoster={canBuildRoster}
          canEditWeekend={canEditWeekend}
        />
        {children}
      </div>
    </PageContent>
  )
}
