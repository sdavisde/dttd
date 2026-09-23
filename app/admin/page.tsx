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
  type ActiveGroupSecuela,
} from '@/lib/admin/dashboard-metrics'
import { deriveSystemAlerts } from '@/lib/admin/system-alerts'
import {
  FEE_LOOKUP_FAILED,
  getAllPayments,
  getOutstandingFees,
} from '@/services/payment'
import type { OutstandingFee } from '@/lib/payments/outstanding'
import { getMasterRoster } from '@/services/master-roster'
import { getSecuelaDateForGroup, getUpcomingEvents } from '@/services/events'
import { getActiveWeekends, getWeekendGroupsByStatus } from '@/services/weekend'
import { MetricCards } from './components/metric-cards'
import { ActionItemsList } from './components/action-items-list'
import { CalendarPreview } from './components/calendar-preview'
import {
  StorageUsageTile,
  StorageUsageTileSkeleton,
} from './components/storage-usage-tile'
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
  const activeWeekends = Results.toNullable(activeWeekendsResult)
  const activeGroupId =
    activeWeekends?.MENS.groupId ?? activeWeekends?.WOMENS.groupId ?? null
  const activeGroupNumber =
    activeWeekends?.MENS.number ?? activeWeekends?.WOMENS.number ?? null

  // Both of these need the active weekends, so they wait for the first round —
  // but they stay separate reads, each degrading only what it feeds.
  // Outstanding money comes from the same per-person calculation the Payments
  // ledger lists, so the tile and that page can never disagree.
  const outstandingPromise: Promise<Result<string, OutstandingFee[]>> | null =
    !isNil(payments) && !isNil(activeWeekends)
      ? getOutstandingFees({ payments, activeWeekends })
      : null
  const secuelaPromise: Promise<Result<string, string | null>> | null = isNil(
    activeGroupId
  )
    ? null
    : getSecuelaDateForGroup(activeGroupId)

  const [outstandingResult, secuelaResult] = await Promise.all([
    outstandingPromise,
    secuelaPromise,
  ])
  if (!isNil(outstandingResult)) Results.logFailures(outstandingResult)
  if (!isNil(secuelaResult)) Results.logFailures(secuelaResult)

  const outstandingFees = isNil(outstandingResult)
    ? null
    : Results.toNullable(outstandingResult)

  // A secuela we couldn't look up is not a secuela we can say is missing.
  const activeGroupSecuela: ActiveGroupSecuela | null =
    isNil(secuelaResult) || Results.isErr(secuelaResult)
      ? null
      : {
          groupNumber: activeGroupNumber,
          isScheduled: !isNil(secuelaResult.data),
        }

  // Fee prices we can't read are their own failure: showing $0 outstanding
  // would claim every fee is settled when we simply don't know the price.
  const feesUnknown =
    !isNil(outstandingResult) &&
    Results.isErr(outstandingResult) &&
    outstandingResult.error === FEE_LOOKUP_FAILED

  const outstanding = isNil(outstandingFees)
    ? null
    : deriveOutstanding(outstandingFees)
  const collected = isNil(payments) ? null : deriveCollectedThisYear(payments)
  const memberCount = Results.toNullable(rosterResult)?.members.length ?? null
  const events = Results.toNullable(eventsResult)
  const weekendGroups = Results.toNullable(groupsResult)

  const actionItems = deriveActionItems({
    outstanding,
    weekendGroups,
    activeGroupSecuela,
  })
  const actionItemsDegraded =
    isNil(outstanding) ||
    isNil(weekendGroups) ||
    (!isNil(secuelaResult) && Results.isErr(secuelaResult))

  // Banner checks. Friendly source names only — the raw errors were logged
  // above by `Results.logFailures` and never reach the page.
  const degradedSources: string[] = []
  if (isNil(payments)) degradedSources.push('Payments')
  if (Results.isErr(rosterResult)) degradedSources.push('Community roster')
  if (isNil(events)) degradedSources.push('Events')
  if (isNil(weekendGroups)) degradedSources.push('Weekends')
  if (!feesUnknown && !isNil(outstandingResult) && isNil(outstandingFees)) {
    degradedSources.push('Outstanding fees')
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
          description="The board's back office — money, people, files, and the community calendar. Weekend operations live on each weekend's hub."
        />

        <SystemAlertsBanner alerts={alerts} />

        <MetricCards
          outstanding={outstanding}
          outstandingFeesUnknown={feesUnknown}
          collected={collected}
          memberCount={memberCount}
          storageTile={
            /* Storage walks every bucket, so it streams into its tile on its
               own rather than holding up the money and people figures. */
            <Suspense fallback={<StorageUsageTileSkeleton />}>
              <StorageUsageTile />
            </Suspense>
          }
        />

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ActionItemsList items={actionItems} degraded={actionItemsDegraded} />
          <CalendarPreview
            events={events}
            scopeContext={{
              mensWeekendId: activeWeekends?.MENS.id,
              womensWeekendId: activeWeekends?.WOMENS.id,
            }}
            groupNumber={activeGroupNumber}
          />
        </div>
      </div>
    </>
  )
}
