import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { isNil } from 'lodash'
import { MemberBreadcrumbs } from '@/components/member/breadcrumbs'
import { PageContent } from '@/components/member/page-content'
import { PageHeader } from '@/components/ui/page-header'
import { getCachedAllWeekendGroups } from '@/services/weekend/cached'
import { getLoggedInUser } from '@/services/identity/user'
import { Results } from '@/lib/results'
import { bucketGroupsForBoard } from '@/lib/admin/weekend-stats'
import { formatWeekendGroupTitle, getGroupStatus } from '@/lib/weekend'
import {
  formatCompactDateRange,
  hubPath,
  resolveWeekendType,
} from '@/lib/weekend/hub'
import {
  WeekendStatus,
  WeekendType,
  type WeekendGroupWithId,
} from '@/lib/weekend/types'
import { cn } from '@/lib/utils'

const groupNumber = (group: WeekendGroupWithId) =>
  group.weekends.MENS?.number ?? group.weekends.WOMENS?.number ?? null

const STATUS_PILL: Record<WeekendStatus, { label: string; className: string }> =
  {
    [WeekendStatus.ACTIVE]: {
      label: 'Active',
      className: 'bg-success/15 text-success',
    },
    [WeekendStatus.PLANNING]: {
      label: 'Planning',
      className: 'bg-secondary text-secondary-foreground',
    },
    [WeekendStatus.FINISHED]: {
      label: 'Finished',
      className: 'bg-muted text-muted-foreground',
    },
  }

function StatusPill({ status }: { status: WeekendStatus | null }) {
  if (isNil(status)) return null
  const pill = STATUS_PILL[status]
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-semibold',
        pill.className
      )}
    >
      {pill.label}
    </span>
  )
}

function GroupCard({
  group,
  weekendType,
  emphasis = false,
}: {
  group: WeekendGroupWithId
  /** The viewer's own weekend, so the card opens it without a redirect hop. */
  weekendType: WeekendType
  emphasis?: boolean
}) {
  const status = getGroupStatus(group) as WeekendStatus | null
  const mens = formatCompactDateRange(
    group.weekends.MENS?.start_date,
    group.weekends.MENS?.end_date
  )
  const womens = formatCompactDateRange(
    group.weekends.WOMENS?.start_date,
    group.weekends.WOMENS?.end_date
  )
  return (
    <Link
      href={hubPath(group.groupId, 'overview', weekendType)}
      className={cn(
        'group flex items-center gap-4 rounded-lg border bg-card transition-colors hover:bg-muted/40',
        emphasis ? 'px-6 py-5' : 'px-5 py-4'
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2
            className={cn(
              'font-serif font-semibold tracking-tight',
              emphasis ? 'text-2xl' : 'text-lg'
            )}
          >
            {formatWeekendGroupTitle(groupNumber(group))}
          </h2>
          <StatusPill status={status} />
        </div>
        <dl className="mt-1.5 flex flex-wrap gap-x-6 gap-y-0.5 text-sm text-muted-foreground">
          <div className="flex gap-1.5">
            <dt className="font-medium text-foreground/80">Men&rsquo;s</dt>
            <dd>{mens ?? 'Dates TBD'}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="font-medium text-foreground/80">Women&rsquo;s</dt>
            <dd>{womens ?? 'Dates TBD'}</dd>
          </div>
        </dl>
      </div>
      <ChevronRight
        className="size-5 shrink-0 text-muted-foreground/70 transition-colors group-hover:text-foreground"
        aria-hidden
      />
    </Link>
  )
}

export default async function WeekendsIndexPage() {
  // The viewer is already resolved by the member shell on a full load; it
  // only decides which weekend the cards open (the same choice the group
  // root's redirect makes), so a failed lookup falls back to Men's.
  const [groupsResult, userResult] = await Promise.all([
    getCachedAllWeekendGroups(),
    getLoggedInUser(),
  ])
  Results.logFailures(groupsResult)
  const buckets = bucketGroupsForBoard(Results.unwrapOr(groupsResult, []))
  const weekendType = Results.match(
    userResult,
    (user) => resolveWeekendType(null, user.gender),
    () => WeekendType.MENS
  )

  return (
    <PageContent>
      <MemberBreadcrumbs
        title="The weekends"
        breadcrumbs={[{ label: 'Home', href: '/home' }]}
      />
      <PageHeader
        title="The weekends"
        description="Every DTTD weekend — open one for its schedule, team, candidates and your part in it."
      />

      <div className="flex flex-col gap-8">
        {isNil(buckets.active) ? (
          <p className="rounded-lg border bg-card px-5 py-4 text-sm text-muted-foreground">
            No weekend is active right now.
          </p>
        ) : (
          <GroupCard
            group={buckets.active}
            weekendType={weekendType}
            emphasis
          />
        )}

        {buckets.upcoming.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Coming up
            </h2>
            {buckets.upcoming.map((group) => (
              <GroupCard
                key={group.groupId}
                group={group}
                weekendType={weekendType}
              />
            ))}
          </section>
        )}

        {buckets.past.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Past weekends
            </h2>
            {buckets.past.map((group) => (
              <GroupCard
                key={group.groupId}
                group={group}
                weekendType={weekendType}
              />
            ))}
          </section>
        )}
      </div>
    </PageContent>
  )
}
