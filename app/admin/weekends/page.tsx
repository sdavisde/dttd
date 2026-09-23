import { Permission } from '@/lib/security'
import { guardAdminPage } from '@/lib/admin/page-guard'
import {
  bucketGroupsForBoard,
  countOpenFeesByWeekend,
  deriveWeekendStats,
  type ActiveGroupStats,
  type WeekendOpenFees,
} from '@/lib/admin/weekend-stats'
import { isErr } from '@/lib/results'
import * as Results from '@/lib/results'
import { isNil } from 'lodash'
import { getWeekendGroupsByStatus, getWeekendRoster } from '@/services/weekend'
import {
  getCandidateCountByWeekend,
  getCandidateCountsByWeekends,
  getCandidateReviewCountByWeekend,
} from '@/services/candidates'
import { getAllPayments, getOutstandingFees } from '@/services/payment'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Weekends } from './components/Weekends'

export default async function WeekendsPage() {
  const { canEdit } = await guardAdminPage({
    required: [Permission.READ_WEEKENDS],
    edit: [Permission.WRITE_WEEKENDS],
  })

  const weekendGroupsResult = await getWeekendGroupsByStatus({})
  if (isErr(weekendGroupsResult)) {
    throw new Error(`Failed to fetch weekends: ${weekendGroupsResult.error}`)
  }
  const weekendGroups = weekendGroupsResult.data
  const buckets = bucketGroupsForBoard(weekendGroups)

  // Candidate counts for the past rows. One round trip for every past weekend,
  // started here so it overlaps the active-group fetches below; a failure just
  // drops the count off those rows.
  const pastCountsPromise = getCandidateCountsByWeekends(
    buckets.past.flatMap((group) =>
      [group.weekends.MENS?.id, group.weekends.WOMENS?.id].filter(
        (id): id is string => !isNil(id)
      )
    )
  )

  // Stat tiles only exist for the active group. Each source is fetched and
  // handled independently: a failed (or permission-denied) source nulls its
  // tile instead of breaking the page.
  let activeStats: ActiveGroupStats | null = null
  if (!isNil(buckets.active)) {
    const { MENS: mens, WOMENS: womens } = buckets.active.weekends
    const [
      mensRoster,
      womensRoster,
      mensCandidates,
      womensCandidates,
      mensToReview,
      womensToReview,
      paymentsResult,
    ] = await Promise.all([
      getWeekendRoster(mens.id),
      getWeekendRoster(womens.id),
      getCandidateCountByWeekend(mens.id),
      getCandidateCountByWeekend(womens.id),
      getCandidateReviewCountByWeekend(mens.id),
      getCandidateReviewCountByWeekend(womens.id),
      getAllPayments(),
    ])
    Results.logFailures(
      mensRoster,
      womensRoster,
      mensCandidates,
      womensCandidates,
      mensToReview,
      womensToReview
    )

    // Open fees come from the same per-person list the dashboard tile and the
    // Payments ledger read, so the three pages can never disagree. A failed
    // read (including FEE_LOOKUP_FAILED, when the Stripe fee prices can't be
    // read) nulls the stat rather than reporting a count derived from a fee we
    // don't actually know.
    const payments = Results.toNullable(paymentsResult)
    let openFees: Record<string, WeekendOpenFees> | null = null
    if (!isNil(payments)) {
      const outstandingResult = await getOutstandingFees({
        payments,
        activeWeekends: buckets.active.weekends,
      })
      Results.logFailures(outstandingResult)
      openFees = Results.toNullable(
        Results.map(outstandingResult, countOpenFeesByWeekend)
      )
    }

    // A weekend nobody owes on has no bucket, which is zero open fees — not a
    // missing source, so the tile still shows.
    const openFeeCountFor = (weekendId: string) =>
      isNil(openFees) ? null : (openFees[weekendId]?.count ?? 0)

    activeStats = {
      MENS: deriveWeekendStats({
        candidateCount: Results.toNullable(mensCandidates),
        rosterCount: Results.toNullable(mensRoster)?.length ?? null,
        reviewCount: Results.toNullable(mensToReview),
        openFeeCount: openFeeCountFor(mens.id),
      }),
      WOMENS: deriveWeekendStats({
        candidateCount: Results.toNullable(womensCandidates),
        rosterCount: Results.toNullable(womensRoster)?.length ?? null,
        reviewCount: Results.toNullable(womensToReview),
        openFeeCount: openFeeCountFor(womens.id),
      }),
    }
  }

  const pastCountsResult = await pastCountsPromise
  Results.logFailures(pastCountsResult)
  const pastCandidateCounts = Results.toNullable(pastCountsResult)

  return (
    <>
      <AdminBreadcrumbs
        title="Weekends"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-4 sm:px-8 py-6">
        <Weekends
          buckets={buckets}
          activeStats={activeStats}
          pastCandidateCounts={pastCandidateCounts}
          allGroups={weekendGroups}
          canEdit={canEdit}
        />
      </div>
    </>
  )
}
