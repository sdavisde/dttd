import { Suspense } from 'react'
import { isNil } from 'lodash'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'
import * as Results from '@/lib/results'
import type { Result } from '@/lib/results'
import { guardAdminPage } from '@/lib/admin/page-guard'
import {
  deriveActionItems,
  deriveCollectedThisYear,
  deriveOutstanding,
  hasActiveWeekendGroup,
} from '@/lib/admin/dashboard-metrics'
import { deriveSystemAlerts } from '@/lib/admin/system-alerts'
import {
  FEE_LOOKUP_FAILED,
  getActiveWeekendFinancials,
  getAllPayments,
  type ActiveWeekendFinancials,
} from '@/services/payment'
import { getMasterRoster } from '@/services/master-roster'
import { getUpcomingEvents } from '@/services/events'
import { getActiveWeekends, getWeekendGroupsByStatus } from '@/services/weekend'
import { MetricCards } from './components/metric-cards'
import { ActionItemsList } from './components/action-items-list'
import { EventsPreview } from './components/events-preview'
import {
  StorageUsageCard,
  StorageUsageCardSkeleton,
} from './components/storage-usage-card'
import { SystemAlertsBanner } from './components/system-alerts-banner'

/** Presence check only — the value itself is a secret and is never read out. */
function isConfigured(value: string | undefined): boolean {
  return !isNil(value) && value !== ''
}

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
  let financialsResult: Result<string, ActiveWeekendFinancials> | null = null
  if (!isNil(payments) && Results.isOk(activeWeekendsResult)) {
    financialsResult = await getActiveWeekendFinancials(
      payments,
      activeWeekendsResult.data
    )
    Results.logFailures(financialsResult)
  }
  const financials = isNil(financialsResult)
    ? null
    : Results.toNullable(financialsResult)

  // Fee prices we can't read are their own failure: showing $0 outstanding
  // would claim every fee is settled when we simply don't know the price.
  const feesUnknown =
    !isNil(financialsResult) &&
    Results.isErr(financialsResult) &&
    financialsResult.error === FEE_LOOKUP_FAILED

  const outstanding = isNil(financials) ? null : deriveOutstanding(financials)
  const collected = isNil(payments) ? null : deriveCollectedThisYear(payments)
  const memberCount = Results.toNullable(rosterResult)?.members.length ?? null
  const events = Results.toNullable(eventsResult)
  const weekendGroups = Results.toNullable(groupsResult)

  const actionItems = deriveActionItems({ outstanding, weekendGroups })
  const actionItemsDegraded = isNil(outstanding) || isNil(weekendGroups)

  // Banner checks. Friendly source names only — the raw errors were logged
  // above by `Results.logFailures` and never reach the page.
  const degradedSources: string[] = []
  if (isNil(payments)) degradedSources.push('Payments')
  if (Results.isErr(rosterResult)) degradedSources.push('Community roster')
  if (isNil(events)) degradedSources.push('Events')
  if (isNil(weekendGroups)) degradedSources.push('Weekends')
  if (!feesUnknown && !isNil(financialsResult) && isNil(financials)) {
    degradedSources.push('Weekend balances')
  }

  const alerts = deriveSystemAlerts({
    // Only ever assert the broken case: a financials read that failed for some
    // other reason tells us nothing about the fee prices either way.
    stripeFeesConfigured: feesUnknown ? false : null,
    activeWeekendGroup: isNil(weekendGroups)
      ? null
      : hasActiveWeekendGroup(weekendGroups),
    stripeCheckoutConfigured: isConfigured(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ),
    stripeWebhookConfigured: isConfigured(process.env.STRIPE_WEBHOOK_SECRET),
    emailConfigured: isConfigured(process.env.RESEND_API_KEY),
    siteUrlConfigured: isConfigured(process.env.SITE_URL),
    degradedSources,
  })

  return (
    <>
      <AdminBreadcrumbs title="Admin" breadcrumbs={[]} />
      <div className="container mx-auto px-4 pb-12 md:px-8">
        <PageHeader
          title="Admin"
          description="The board's back office — money, people, and files. Weekend operations live on each weekend's hub."
        />

        <SystemAlertsBanner alerts={alerts} />

        <MetricCards
          outstanding={outstanding}
          outstandingFeesUnknown={feesUnknown}
          collected={collected}
          memberCount={memberCount}
        />

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ActionItemsList items={actionItems} degraded={actionItemsDegraded} />
          <div className="space-y-6">
            <EventsPreview events={events} />
            {/* Storage walks every bucket, so it streams in on its own rather
                than holding up the money and people tiles. */}
            <Suspense fallback={<StorageUsageCardSkeleton />}>
              <StorageUsageCard />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}
