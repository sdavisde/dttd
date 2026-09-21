'use client'

import type { ReactNode } from 'react'
import type { PaymentTransactionDTO } from '@/services/payment'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/payments/formatters'
import type {
  WeekendGroup,
  ActiveWeekendFinancials,
  ActiveWeekendMetrics,
} from '@/lib/payments/compute-totals'
import { usePaymentReport } from '../hooks/use-payment-report'
import { isNil } from 'lodash'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function GrossBreakdown({
  online,
  offline,
}: {
  online: number
  offline: number
}) {
  if (online === 0 && offline === 0) return null
  return (
    <div className="mt-0.5 space-y-0 text-[11px] leading-tight text-muted-foreground whitespace-nowrap">
      {offline > 0 && <div>Cash {formatCurrency(offline)}</div>}
      {online > 0 && <div>Card {formatCurrency(online)}</div>}
    </div>
  )
}

function progressColor(pct: number): string {
  if (pct >= 80) return '[&>div]:bg-success'
  if (pct >= 50) return '[&>div]:bg-warning'
  return '[&>div]:bg-error'
}

/** The redesign's surface: a bordered card, no shadow, one radius. */
function ReportCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-lg border bg-card p-5', className)}>
      {children}
    </section>
  )
}

/** Uppercase, letter-spaced section label used above a stat figure. */
function StatLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
    </h2>
  )
}

const FIGURE_CLASSES =
  'font-serif text-2xl font-semibold tracking-tight tabular-nums'

function DiffText({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span
      className={cn(
        'font-semibold tabular-nums',
        isPositive ? 'text-success' : 'text-error'
      )}
    >
      {isPositive ? '+' : ''}
      {formatCurrency(value)}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ReportHeader({
  weekendGroupOptions,
  selectedGroup,
  onGroupChange,
}: {
  weekendGroupOptions: string[]
  selectedGroup: string
  onGroupChange: (group: string) => void
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/payments">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Payments
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Weekend Group:</span>
        <Select value={selectedGroup} onValueChange={onGroupChange}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All weekend groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All weekend groups</SelectItem>
            {weekendGroupOptions.map((label) => (
              <SelectItem key={label} value={label}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Active Weekend Dashboard
// ---------------------------------------------------------------------------

function CollectionProgressCard({
  title,
  weekends,
  getExpected,
  getReceived,
  getPaidCount,
  getExpectedCount,
  getExtraPaymentsCount,
}: {
  title: string
  weekends: ActiveWeekendMetrics[]
  getExpected: (w: ActiveWeekendMetrics) => number
  getReceived: (w: ActiveWeekendMetrics) => number
  getPaidCount: (w: ActiveWeekendMetrics) => number
  getExpectedCount: (w: ActiveWeekendMetrics) => number
  getExtraPaymentsCount: (w: ActiveWeekendMetrics) => number
}) {
  const totalExpected = weekends.reduce((s, w) => s + getExpected(w), 0)
  const totalReceived = weekends.reduce((s, w) => s + getReceived(w), 0)
  const pct = totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 0
  const totalExtraPayments = weekends.reduce(
    (s, w) => s + getExtraPaymentsCount(w),
    0
  )

  return (
    <ReportCard className="space-y-3">
      <StatLabel>{title}</StatLabel>
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <p className={FIGURE_CLASSES}>{formatCurrency(totalReceived)}</p>
          <p className="text-sm text-muted-foreground tabular-nums">
            of {formatCurrency(totalExpected)}
          </p>
        </div>
        <Progress value={pct} className={cn('h-2.5', progressColor(pct))} />
        <p className="text-xs text-muted-foreground text-right tabular-nums">
          {Math.round(pct)}% collected
        </p>

        <div className="space-y-1.5 border-t border-divider pt-2">
          {weekends.map((w) => {
            const paid = getPaidCount(w)
            const expected = getExpectedCount(w)
            const extra = getExtraPaymentsCount(w)
            const wPct = expected > 0 ? (paid / expected) * 100 : 0
            return (
              <div key={w.weekendType} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {w.weekendLabel}
                  </span>
                  <span>
                    <span
                      className={cn(
                        'font-medium tabular-nums',
                        paid >= expected
                          ? 'text-success'
                          : 'text-muted-foreground'
                      )}
                    >
                      {paid}/{expected} paid
                    </span>
                    <span className="text-muted-foreground ml-2">
                      ({Math.round(wPct)}%)
                    </span>
                  </span>
                </div>
                {extra > 0 && (
                  <p className="text-xs text-secondary-foreground">
                    +{extra} payment{extra !== 1 ? 's' : ''} from inactive
                    members
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {totalExtraPayments > 0 && (
          <p className="border-t border-divider pt-2 text-xs text-secondary-foreground">
            {totalExtraPayments} payment{totalExtraPayments !== 1 ? 's' : ''}{' '}
            received from removed or rejected members. Consider issuing refunds.
          </p>
        )}
      </div>
    </ReportCard>
  )
}

function OverallFinancialCard({
  financials,
}: {
  financials: ActiveWeekendFinancials
}) {
  const overallDiff =
    financials.overallReceivedTotal - financials.overallExpectedTotal
  const teamDiff = financials.teamReceivedTotal - financials.teamExpectedTotal
  const candidateDiff =
    financials.candidateReceivedTotal - financials.candidateExpectedTotal
  // Waived fees are already off the expected totals, so they don't read as a
  // shortfall above — they are shown on their own as what the community gave.
  const waivedTotal = financials.overallWaivedTotal ?? 0

  return (
    <ReportCard className="space-y-3">
      <StatLabel>Expected vs Received</StatLabel>
      <div className="space-y-3">
        <div>
          <p className={FIGURE_CLASSES}>
            <DiffText value={overallDiff} />
          </p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            Expected: {formatCurrency(financials.overallExpectedTotal)} ·
            Received: {formatCurrency(financials.overallReceivedTotal)}
          </p>
        </div>

        <div className="space-y-1.5 border-t border-divider pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Team</span>
            <DiffText value={teamDiff} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Candidates</span>
            <DiffText value={candidateDiff} />
          </div>
          {waivedTotal > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Waived, covered by the community
              </span>
              <span className="font-semibold text-muted-foreground tabular-nums">
                {formatCurrency(waivedTotal)}
              </span>
            </div>
          )}
        </div>
      </div>
    </ReportCard>
  )
}

function ActiveWeekendDashboard({
  financials,
}: {
  financials: ActiveWeekendFinancials | null
}) {
  if (isNil(financials)) {
    return (
      <ReportCard className="py-6 text-center text-muted-foreground">
        No active weekend configured. Financial health widgets require an active
        weekend.
      </ReportCard>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <CollectionProgressCard
        title="Team Fee Collection"
        weekends={financials.weekends}
        getExpected={(w) => w.teamExpectedTotal}
        getReceived={(w) => w.teamReceivedTotal}
        getPaidCount={(w) => w.teamPaidCount}
        getExpectedCount={(w) => w.teamExpectedCount}
        getExtraPaymentsCount={(w) => w.teamExtraPaymentsCount}
      />
      <CollectionProgressCard
        title="Candidate Fee Collection"
        weekends={financials.weekends}
        getExpected={(w) => w.candidateExpectedTotal}
        getReceived={(w) => w.candidateReceivedTotal}
        getPaidCount={(w) => w.candidatePaidCount}
        getExpectedCount={(w) => w.candidateExpectedCount}
        getExtraPaymentsCount={(w) => w.candidateExtraPaymentsCount}
      />
      <OverallFinancialCard financials={financials} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Weekend group table card
// ---------------------------------------------------------------------------

function WeekendGroupCard({ group }: { group: WeekendGroup }) {
  const groupTotals =
    group.weekends.length > 1
      ? {
          candidateGross: group.weekends.reduce(
            (s, w) => s + w.candidateGross,
            0
          ),
          candidateOnlineGross: group.weekends.reduce(
            (s, w) => s + w.candidateOnlineGross,
            0
          ),
          candidateOfflineGross: group.weekends.reduce(
            (s, w) => s + w.candidateOfflineGross,
            0
          ),
          candidateCount: group.weekends.reduce(
            (s, w) => s + w.candidateCount,
            0
          ),
          teamGross: group.weekends.reduce((s, w) => s + w.teamGross, 0),
          teamOnlineGross: group.weekends.reduce(
            (s, w) => s + w.teamOnlineGross,
            0
          ),
          teamOfflineGross: group.weekends.reduce(
            (s, w) => s + w.teamOfflineGross,
            0
          ),
          teamCount: group.weekends.reduce((s, w) => s + w.teamCount, 0),
          totalGross: group.weekends.reduce((s, w) => s + w.totalGross, 0),
          totalOnlineGross: group.weekends.reduce(
            (s, w) => s + w.onlineGross,
            0
          ),
          totalOfflineGross: group.weekends.reduce(
            (s, w) => s + w.offlineGross,
            0
          ),
          totalNet: group.weekends.reduce((s, w) => s + w.totalNet, 0),
          totalFees: group.weekends.reduce((s, w) => s + w.totalFees, 0),
          onlineNet: group.weekends.reduce((s, w) => s + w.onlineNet, 0),
          offlineNet: group.weekends.reduce((s, w) => s + w.offlineNet, 0),
        }
      : null

  const waivedCount = group.weekends.reduce((s, w) => s + w.waivedCount, 0)
  const waivedTotal = group.weekends.reduce((s, w) => s + w.waivedTotal, 0)

  return (
    <ReportCard className="overflow-hidden">
      <h2 className="font-serif text-lg font-semibold tracking-tight">
        {group.groupLabel}
      </h2>
      <div className="mt-3 tabular-nums">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Weekend</TableHead>
                <TableHead className="text-right">Candidate Gross</TableHead>
                <TableHead className="text-right">Candidate Count</TableHead>
                <TableHead className="text-right">Team Gross</TableHead>
                <TableHead className="text-right">Team Count</TableHead>
                <TableHead className="text-right">Total Gross</TableHead>
                <TableHead className="text-right">Total Net</TableHead>
                <TableHead className="text-right">Stripe Fees</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.weekends.map((w) => (
                <TableRow key={w.weekendLabel}>
                  <TableCell className="font-medium">
                    {w.weekendLabel}
                  </TableCell>
                  <TableCell className="text-right">
                    <div>{formatCurrency(w.candidateGross)}</div>
                    <GrossBreakdown
                      online={w.candidateOnlineGross}
                      offline={w.candidateOfflineGross}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {w.candidateCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <div>{formatCurrency(w.teamGross)}</div>
                    <GrossBreakdown
                      online={w.teamOnlineGross}
                      offline={w.teamOfflineGross}
                    />
                  </TableCell>
                  <TableCell className="text-right">{w.teamCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold text-success">
                      {formatCurrency(w.totalGross)}
                    </div>
                    <GrossBreakdown
                      online={w.onlineGross}
                      offline={w.offlineGross}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div>{formatCurrency(w.totalNet)}</div>
                    <GrossBreakdown
                      online={w.onlineNet}
                      offline={w.offlineNet}
                    />
                  </TableCell>
                  <TableCell className="text-right text-error">
                    {formatCurrency(w.totalFees)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {!isNil(groupTotals) && (
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Group Total</TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(groupTotals.candidateGross)}
                    </div>
                    <GrossBreakdown
                      online={groupTotals.candidateOnlineGross}
                      offline={groupTotals.candidateOfflineGross}
                    />
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {groupTotals.candidateCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(groupTotals.teamGross)}
                    </div>
                    <GrossBreakdown
                      online={groupTotals.teamOnlineGross}
                      offline={groupTotals.teamOfflineGross}
                    />
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {groupTotals.teamCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold text-success">
                      {formatCurrency(groupTotals.totalGross)}
                    </div>
                    <GrossBreakdown
                      online={groupTotals.totalOnlineGross}
                      offline={groupTotals.totalOfflineGross}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(groupTotals.totalNet)}
                    </div>
                    <GrossBreakdown
                      online={groupTotals.onlineNet}
                      offline={groupTotals.offlineNet}
                    />
                  </TableCell>
                  <TableCell className="text-right font-semibold text-error">
                    {formatCurrency(groupTotals.totalFees)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-4">
          {group.weekends.map((w) => (
            <div
              key={w.weekendLabel}
              className="rounded-md border bg-card p-4 space-y-3"
            >
              <p className="text-lg font-medium">{w.weekendLabel}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Candidate Fees</p>
                  <p className="font-medium">
                    {formatCurrency(w.candidateGross)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {w.candidateCount} payments
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Team Fees</p>
                  <p className="font-medium">{formatCurrency(w.teamGross)}</p>
                  <p className="text-xs text-muted-foreground">
                    {w.teamCount} payments
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Gross</p>
                  <p className="font-semibold text-success">
                    {formatCurrency(w.totalGross)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Net</p>
                  <p className="font-medium">{formatCurrency(w.totalNet)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stripe Fees</p>
                  <p className="font-medium text-error">
                    {formatCurrency(w.totalFees)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {waivedCount > 0 && (
        <p className="mt-3 text-[13px] text-muted-foreground tabular-nums">
          {waivedCount} {waivedCount === 1 ? 'fee' : 'fees'} waived ·{' '}
          {formatCurrency(waivedTotal)} covered by the community, not counted in
          the totals above
        </p>
      )}
    </ReportCard>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type PaymentReportProps = {
  payments: PaymentTransactionDTO[]
  activeWeekendFinancials: ActiveWeekendFinancials | null
}

export function PaymentReport({
  payments,
  activeWeekendFinancials,
}: PaymentReportProps) {
  const { weekendGroupOptions, selectedGroup, setSelectedGroup, report } =
    usePaymentReport(payments)

  return (
    <div className="space-y-6 min-w-0">
      <ReportHeader
        weekendGroupOptions={weekendGroupOptions}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
      />

      <ActiveWeekendDashboard financials={activeWeekendFinancials} />

      {report.map((group) => (
        <WeekendGroupCard key={group.groupLabel} group={group} />
      ))}

      {report.length === 0 && (
        <ReportCard className="py-8 text-center text-muted-foreground">
          No payments found.
        </ReportCard>
      )}
    </div>
  )
}
