'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/payments/formatters'
import type { LedgerStats } from '@/lib/payments/ledger'
import { cn } from '@/lib/utils'

type PaymentsSummaryProps = {
  stats: LedgerStats
  /**
   * True when fee balances couldn't be calculated. A $0 here would read as
   * "everyone has paid", so an unknown balance says so instead.
   */
  balancesUnavailable: boolean
  onViewOutstanding: () => void
  onViewOverpaid: () => void
}

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`

/**
 * The board's three figure-first tiles: money in this year, what is owed
 * right now, and fees the community covered this year. They describe the
 * books, not the table — filters never move them. Net and Stripe-fee detail
 * lives on the summary page, which the fourth tile opens.
 */
export function PaymentsSummary({
  stats,
  balancesUnavailable,
  onViewOutstanding,
  onViewOverpaid,
}: PaymentsSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        figure={formatCurrency(stats.collectedTotal)}
        figureClassName="text-success"
        caption={`Collected in ${stats.year} · ${plural(stats.collectedCount, 'payment', 'payments')}`}
      />

      <div className="flex flex-col gap-0.5 rounded-md border border-secondary-border bg-secondary px-4.5 py-3.5">
        {balancesUnavailable ? (
          <p className="text-sm text-secondary-foreground">
            Outstanding is unavailable right now
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-x-2.5">
              <Figure className="text-secondary-foreground">
                {formatCurrency(stats.outstandingTotal)}
              </Figure>
              {stats.outstandingCount > 0 && (
                <button
                  type="button"
                  onClick={onViewOutstanding}
                  className="-my-2 min-h-11 text-left text-[13px] font-semibold text-primary hover:text-primary-hover sm:my-0 sm:min-h-0"
                >
                  View the{' '}
                  {plural(stats.outstandingCount, 'open fee', 'open fees')} →
                </button>
              )}
            </div>
            <p className="text-[13px] text-secondary-foreground">
              Outstanding right now
              {stats.outstandingCount === 0 && ' · every fee is settled'}
              {stats.overpaidCount > 0 && (
                <>
                  {' · '}
                  <button
                    type="button"
                    onClick={onViewOverpaid}
                    className="-my-2 min-h-11 font-semibold text-primary hover:text-primary-hover sm:my-0 sm:min-h-0"
                  >
                    {plural(stats.overpaidCount, 'person', 'people')} overpaid →
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>

      <StatTile
        figure={String(stats.waivedCount)}
        caption={
          stats.waivedCount > 0
            ? `Waived in ${stats.year} · ${formatCurrency(stats.waivedTotal)} covered by the community`
            : `Waived in ${stats.year}`
        }
      />

      <Link
        href="/admin/payments/summary"
        className="flex min-h-11 flex-col justify-center gap-0.5 rounded-md border bg-card px-4.5 py-3.5 transition-colors hover:bg-muted/40"
      >
        <span className="flex items-center gap-1.5 font-serif text-lg font-semibold tracking-tight">
          Payment summary
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
        <span className="text-[13px] text-muted-foreground">
          Weekend-by-weekend breakdown · expected vs received, net after fees
        </span>
      </Link>
    </div>
  )
}

function Figure({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'font-serif text-2xl font-semibold tracking-tight tabular-nums',
        className
      )}
    >
      {children}
    </span>
  )
}

function StatTile({
  figure,
  caption,
  figureClassName,
}: {
  figure: string
  caption: string
  figureClassName?: string
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border bg-card px-4.5 py-3.5">
      <Figure className={figureClassName}>{figure}</Figure>
      <span className="text-[13px] text-muted-foreground">{caption}</span>
    </div>
  )
}
