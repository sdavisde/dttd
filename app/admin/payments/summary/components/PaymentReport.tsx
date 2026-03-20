'use client'

import type { PaymentTransactionDTO } from '@/services/payment'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/payments/formatters'
import type { WeekendGroup } from '@/lib/payments/compute-totals'
import type { ReportGrandTotals } from '@/lib/payments/compute-totals'
import { usePaymentReport } from '../hooks/use-payment-report'
import { isNil } from 'lodash'

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

function GrandTotalsCards({ totals }: { totals: ReportGrandTotals }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Gross
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totals.totalGross)}
          </p>
          <p className="text-xs text-muted-foreground">
            {totals.totalCount} payments
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Net (after fees)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrency(totals.totalNet)}
          </p>
          <div className="mt-1 space-y-0.5 text-xs">
            <p>
              <span className="text-muted-foreground">Cash/Check: </span>
              <span className="font-medium">
                {formatCurrency(totals.offlineNet)}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Online: </span>
              <span className="font-medium">
                {formatCurrency(totals.onlineNet)}
              </span>
            </p>
            <p className="text-muted-foreground">
              {formatCurrency(totals.totalFees)} in Stripe fees
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Candidate Fees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrency(totals.candidateGross)}
          </p>
          <p className="text-xs text-muted-foreground">
            {totals.candidateCount} payments
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Team Fees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrency(totals.teamGross)}
          </p>
          <p className="text-xs text-muted-foreground">
            {totals.teamCount} payments
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function WeekendGroupCard({ group }: { group: WeekendGroup }) {
  const groupTotals =
    group.weekends.length > 1
      ? {
          candidateGross: group.weekends.reduce(
            (s, w) => s + w.candidateGross,
            0
          ),
          candidateCount: group.weekends.reduce(
            (s, w) => s + w.candidateCount,
            0
          ),
          teamGross: group.weekends.reduce((s, w) => s + w.teamGross, 0),
          teamCount: group.weekends.reduce((s, w) => s + w.teamCount, 0),
          totalGross: group.weekends.reduce((s, w) => s + w.totalGross, 0),
          totalNet: group.weekends.reduce((s, w) => s + w.totalNet, 0),
          totalFees: group.weekends.reduce((s, w) => s + w.totalFees, 0),
        }
      : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{group.groupLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block">
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
                    {formatCurrency(w.candidateGross)}
                  </TableCell>
                  <TableCell className="text-right">
                    {w.candidateCount}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(w.teamGross)}
                  </TableCell>
                  <TableCell className="text-right">{w.teamCount}</TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {formatCurrency(w.totalGross)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(w.totalNet)}
                  </TableCell>
                  <TableCell className="text-right text-red-500">
                    {formatCurrency(w.totalFees)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {!isNil(groupTotals) && (
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Group Total</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(groupTotals.candidateGross)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {groupTotals.candidateCount}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(groupTotals.teamGross)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {groupTotals.teamCount}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(groupTotals.totalGross)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(groupTotals.totalNet)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-red-500">
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
              className="rounded-lg border bg-card p-4 space-y-3"
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
                  <p className="font-semibold text-green-600">
                    {formatCurrency(w.totalGross)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Net</p>
                  <p className="font-medium">{formatCurrency(w.totalNet)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stripe Fees</p>
                  <p className="font-medium text-red-500">
                    {formatCurrency(w.totalFees)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type PaymentReportProps = {
  payments: PaymentTransactionDTO[]
}

export function PaymentReport({ payments }: PaymentReportProps) {
  const {
    weekendGroupOptions,
    selectedGroup,
    setSelectedGroup,
    report,
    grandTotals,
  } = usePaymentReport(payments)

  return (
    <div className="space-y-6">
      <ReportHeader
        weekendGroupOptions={weekendGroupOptions}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
      />

      <GrandTotalsCards totals={grandTotals} />

      {report.map((group) => (
        <WeekendGroupCard key={group.groupLabel} group={group} />
      ))}

      {report.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No payments found.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
