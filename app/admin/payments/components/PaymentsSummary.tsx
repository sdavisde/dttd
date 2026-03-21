'use client'

import { useMemo } from 'react'
import type { PaymentTransactionDTO } from '@/services/payment'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/payments/formatters'
import { computePaymentTotals } from '@/lib/payments/compute-totals'

type PaymentsSummaryProps = {
  payments: PaymentTransactionDTO[]
  isFiltered: boolean
}

export function PaymentsSummary({
  payments,
  isFiltered,
}: PaymentsSummaryProps) {
  const summary = useMemo(() => computePaymentTotals(payments), [payments])

  if (summary.count === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {isFiltered ? 'Filtered Totals' : 'All Payments'} — {summary.count}{' '}
          {summary.count === 1 ? 'payment' : 'payments'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <p className="text-sm text-muted-foreground">Total Gross</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(summary.gross)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Net</p>
            <p className="text-lg font-semibold">
              {formatCurrency(summary.net)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Stripe Fees</p>
            <p className="text-lg font-semibold text-red-500">
              {formatCurrency(summary.fees)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Candidate Fees</p>
            <p className="text-lg font-semibold">
              {formatCurrency(summary.candidateGross)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Team Fees</p>
            <p className="text-lg font-semibold">
              {formatCurrency(summary.teamGross)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
