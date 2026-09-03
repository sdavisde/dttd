'use client'

import { useMemo } from 'react'
import type { PaymentTransactionDTO } from '@/services/payment'
import { formatCurrency } from '@/lib/payments/formatters'
import { computePaymentTotals } from '@/lib/payments/compute-totals'
import { cn } from '@/lib/utils'

type PaymentsSummaryProps = {
  payments: PaymentTransactionDTO[]
  isFiltered: boolean
}

/**
 * The board's figure-first stat cards: serif figure, plain muted caption.
 * Totals track the table's current filters, never counting voided rows.
 */
export function PaymentsSummary({
  payments,
  isFiltered,
}: PaymentsSummaryProps) {
  const summary = useMemo(() => computePaymentTotals(payments), [payments])

  if (summary.count === 0) return null

  const scope = isFiltered ? 'matching the filters' : 'all payments'
  const countLabel = `${summary.count} ${summary.count === 1 ? 'payment' : 'payments'}`

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard
        figure={formatCurrency(summary.gross)}
        figureClassName="text-success"
        caption={`Collected · ${countLabel} ${scope}`}
      />
      <StatCard
        figure={formatCurrency(summary.net)}
        caption="Net after processing fees"
      />
      <StatCard figure={formatCurrency(summary.fees)} caption="Stripe fees" />
      <StatCard
        figure={formatCurrency(summary.candidateGross)}
        caption="Candidate fees"
      />
      <StatCard
        figure={formatCurrency(summary.teamGross)}
        caption="Team fees"
      />
    </div>
  )
}

function StatCard({
  figure,
  caption,
  figureClassName,
}: {
  figure: string
  caption: string
  figureClassName?: string
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border bg-card px-4 py-3">
      <span
        className={cn(
          'font-serif text-2xl font-semibold tracking-tight tabular-nums',
          figureClassName
        )}
      >
        {figure}
      </span>
      <span className="text-[13px] text-muted-foreground">{caption}</span>
    </div>
  )
}
