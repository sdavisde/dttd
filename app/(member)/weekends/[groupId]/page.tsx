import { isNil } from 'lodash'
import { StatTile } from '@/components/ui/stat-tile'
import { ComingUp } from '@/components/weekend-hub/coming-up'
import { PrayerWheelCard } from '@/components/weekend-hub/prayer-wheel-card'
import { YourPart } from '@/components/weekend-hub/your-part'
import {
  getConfirmedCandidateCountByWeekend,
  getSponsoredCandidatesForWeekend,
} from '@/services/candidates'
import { getAllPayments, getOutstandingFees } from '@/services/payment'
import { getPrayerWheelUrls } from '@/services/settings'
import {
  getRosterAssignmentForUser,
  getRosterCountByWeekend,
} from '@/services/weekend'
import { countOpenFeesByWeekend } from '@/lib/admin/weekend-stats'
import { Results } from '@/lib/results'
import { Permission, userHasPermission } from '@/lib/security'
import { formatWeekendGender } from '@/lib/weekend'
import {
  eventsForWeekend,
  sendOffCountdown,
  upcomingEvents,
} from '@/lib/weekend/hub'
import { WEEKEND_CANDIDATE_CAPACITY, WeekendType } from '@/lib/weekend/types'
import { loadHubEvents } from './hub-data'
import {
  loadHubContext,
  WeekendHubFrame,
  type HubSearchParams,
} from './hub-frame'

const COMING_UP_LIMIT = 3

type PageProps = {
  params: Promise<{ groupId: string }>
  searchParams: HubSearchParams
}

export default async function WeekendHubOverviewPage({
  params,
  searchParams,
}: PageProps) {
  const { groupId } = await params
  const context = await loadHubContext(groupId, searchParams)
  const { user, group, weekend, weekendType } = context

  const canSeeFees = userHasPermission(user, [Permission.READ_PAYMENTS])

  // Every tile and card has its own source; one failing just drops that
  // tile (omit, don't approximate).
  const [
    confirmedResult,
    rosterCountResult,
    eventsResult,
    paymentsResult,
    sponsoredResult,
    assignmentResult,
    prayerWheelResult,
  ] = await Promise.all([
    getConfirmedCandidateCountByWeekend(weekend.id),
    getRosterCountByWeekend(weekend.id),
    loadHubEvents(group.groupId),
    canSeeFees ? getAllPayments() : Promise.resolve(null),
    getSponsoredCandidatesForWeekend(user.email, weekend.id),
    getRosterAssignmentForUser(user.id, weekend.id),
    getPrayerWheelUrls(),
  ])
  Results.logFailures(
    confirmedResult,
    rosterCountResult,
    eventsResult,
    sponsoredResult,
    assignmentResult
  )

  // Outstanding fees are calculated from the same per-person list the admin
  // pages read. Without payments access (or when the Stripe prices can't be
  // read) the tile is left out rather than showing a $0 that reads as "paid".
  let feesOpen: number | null = null
  const payments = isNil(paymentsResult)
    ? null
    : Results.toNullable(paymentsResult)
  if (!isNil(payments)) {
    const outstandingResult = await getOutstandingFees({
      payments,
      activeWeekends: group.weekends,
    })
    Results.logFailures(outstandingResult)
    const openFees = Results.toNullable(
      Results.map(outstandingResult, countOpenFeesByWeekend)
    )
    if (!isNil(openFees)) feesOpen = openFees[weekend.id]?.count ?? 0
  }

  const confirmed = Results.toNullable(confirmedResult)
  const rosterCount = Results.toNullable(rosterCountResult)
  const events = eventsForWeekend(Results.unwrapOr(eventsResult, []), weekend)
  const countdown = sendOffCountdown(events, weekend, new Date())
  const comingUp = upcomingEvents(events, new Date(), COMING_UP_LIMIT)
  const sponsored = Results.unwrapOr(sponsoredResult, [])
  const assignment = Results.unwrapOr(assignmentResult, null)

  const gender = formatWeekendGender(weekendType, 'possessive') ?? 'this'
  const weekendLabel = isNil(weekend.number)
    ? `the ${gender} weekend`
    : `${gender} #${weekend.number}`
  const prayerWheelUrl = Results.match(
    prayerWheelResult,
    (urls) => (weekendType === WeekendType.MENS ? urls.mens : urls.womens),
    () => ''
  )

  const tiles = [
    isNil(confirmed)
      ? null
      : {
          key: 'confirmed',
          value: confirmed,
          suffix: `/ ${WEEKEND_CANDIDATE_CAPACITY}`,
          label: 'Candidates confirmed',
        },
    isNil(rosterCount)
      ? null
      : { key: 'team', value: rosterCount, label: 'Team members serving' },
    countdown.kind === 'until' || countdown.kind === 'since'
      ? {
          key: 'countdown',
          value: countdown.days,
          suffix: countdown.days === 1 ? 'day' : 'days',
          label: countdown.label,
        }
      : {
          key: 'countdown',
          value: countdown.kind === 'today' ? 'Today' : 'Underway',
          label: countdown.label,
        },
    isNil(feesOpen)
      ? null
      : {
          key: 'fees',
          value: feesOpen,
          label:
            feesOpen === 0 ? 'Every fee is settled' : 'Fees still outstanding',
          variant: 'cream' as const,
        },
  ].filter((tile) => !isNil(tile))

  return (
    <WeekendHubFrame context={context} active="overview">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <StatTile
            key={tile.key}
            value={tile.value}
            suffix={tile.suffix}
            label={tile.label}
            variant={tile.variant}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ComingUp
          events={comingUp}
          groupId={group.groupId}
          weekendType={weekendType}
        />
        <div className="flex flex-col gap-4">
          <YourPart
            weekendLabel={weekendLabel}
            sponsored={sponsored}
            assignment={assignment}
          />
          {prayerWheelUrl !== '' && (
            <PrayerWheelCard url={prayerWheelUrl} weekendGender={gender} />
          )}
        </div>
      </div>
    </WeekendHubFrame>
  )
}
