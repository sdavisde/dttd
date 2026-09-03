import { Permission } from '@/lib/security'
import { guardAdminPage } from '@/lib/admin/page-guard'
import {
  bucketGroupsForBoard,
  deriveWeekendStats,
  type ActiveGroupStats,
} from '@/lib/admin/weekend-stats'
import { isErr } from '@/lib/results'
import * as Results from '@/lib/results'
import { isNil } from 'lodash'
import { getWeekendGroupsByStatus, getWeekendRoster } from '@/services/weekend'
import { getCandidateCountByWeekend } from '@/services/candidates'
import { getActiveWeekendFinancials, getAllPayments } from '@/services/payment'
import type { WeekendType } from '@/lib/weekend/types'
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
      paymentsResult,
    ] = await Promise.all([
      getWeekendRoster(mens.id),
      getWeekendRoster(womens.id),
      getCandidateCountByWeekend(mens.id),
      getCandidateCountByWeekend(womens.id),
      getAllPayments(),
    ])
    Results.logFailures(
      mensRoster,
      womensRoster,
      mensCandidates,
      womensCandidates
    )

    const payments = Results.toNullable(paymentsResult)
    const financials = isNil(payments)
      ? null
      : Results.toNullable(
          await getActiveWeekendFinancials(payments, buckets.active.weekends)
        )

    const financialsFor = (type: WeekendType) =>
      financials?.weekends.find((w) => w.weekendType === type) ?? null

    activeStats = {
      MENS: deriveWeekendStats({
        candidateCount: Results.toNullable(mensCandidates),
        rosterCount: Results.toNullable(mensRoster)?.length ?? null,
        financials: financialsFor('MENS'),
      }),
      WOMENS: deriveWeekendStats({
        candidateCount: Results.toNullable(womensCandidates),
        rosterCount: Results.toNullable(womensRoster)?.length ?? null,
        financials: financialsFor('WOMENS'),
      }),
    }
  }

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
          allGroups={weekendGroups}
          canEdit={canEdit}
        />
      </div>
    </>
  )
}
