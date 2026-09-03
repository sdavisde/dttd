import { isNil } from 'lodash'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'
import * as Results from '@/lib/results'
import { guardAdminPage } from '@/lib/admin/page-guard'
import {
  deriveBoardHandItems,
  deriveCollectedThisYear,
  deriveOutstanding,
} from '@/lib/admin/dashboard-metrics'
import {
  getActiveWeekendFinancials,
  getAllPayments,
  type ActiveWeekendFinancials,
} from '@/services/payment'
import { getMasterRoster } from '@/services/master-roster'
import { getUpcomingEvents } from '@/services/events'
import { getActiveWeekends, getWeekendGroupsByStatus } from '@/services/weekend'
import { MetricCards } from './components/metric-cards'
import { BoardHandList } from './components/board-hand-list'
import { EventsPreview } from './components/events-preview'
import { IdeasSection } from './components/ideas-section'

export default async function Page() {
  await guardAdminPage()

  // Each source is independent: one failing (including a permission the
  // viewer lacks) degrades its own card to a placeholder, never the page.
  const [
    paymentsResult,
    rosterResult,
    eventsResult,
    groupsResult,
    activeWeekendsResult,
  ] = await Promise.all([
    getAllPayments(),
    getMasterRoster(),
    getUpcomingEvents(),
    getWeekendGroupsByStatus({}),
    getActiveWeekends(),
  ])
  Results.logFailures(
    paymentsResult,
    rosterResult,
    eventsResult,
    groupsResult,
    activeWeekendsResult
  )

  const payments = Results.toNullable(paymentsResult)

  // Outstanding money reuses the exact computation behind the payments
  // summary page, so the two can never disagree.
  let financials: ActiveWeekendFinancials | null = null
  if (!isNil(payments) && Results.isOk(activeWeekendsResult)) {
    financials = Results.toNullable(
      await getActiveWeekendFinancials(payments, activeWeekendsResult.data)
    )
  }

  const outstanding = isNil(financials) ? null : deriveOutstanding(financials)
  const collected = isNil(payments) ? null : deriveCollectedThisYear(payments)
  const memberCount = Results.toNullable(rosterResult)?.members.length ?? null
  const events = Results.toNullable(eventsResult)
  const weekendGroups = Results.toNullable(groupsResult)

  const boardHandItems = deriveBoardHandItems({ outstanding, weekendGroups })
  const boardHandDegraded = isNil(outstanding) || isNil(weekendGroups)

  return (
    <>
      <AdminBreadcrumbs title="Admin" breadcrumbs={[]} />
      <div className="container mx-auto px-4 pb-12 md:px-8">
        <PageHeader
          title="Admin"
          description="The board's back office — money, people, and files. Weekend operations live on each weekend's hub."
        />

        <MetricCards
          outstanding={outstanding}
          collected={collected}
          memberCount={memberCount}
        />

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
          <BoardHandList items={boardHandItems} degraded={boardHandDegraded} />
          <div className="space-y-6">
            <EventsPreview events={events} />
            <IdeasSection />
          </div>
        </div>
      </div>
    </>
  )
}
