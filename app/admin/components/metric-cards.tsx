import Link from 'next/link'
import { isNil } from 'lodash'
import { formatCurrency } from '@/lib/payments/formatters'
import type {
  CollectedMetrics,
  OutstandingMetrics,
} from '@/lib/admin/dashboard-metrics'

type MetricCardsProps = {
  outstanding: OutstandingMetrics | null
  collected: CollectedMetrics | null
  memberCount: number | null
}

function MetricFigure({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={`font-serif text-2xl font-semibold tabular-nums ${className}`}
    >
      {children}
    </p>
  )
}

function Unavailable() {
  return <p className="text-sm text-muted-foreground">Unavailable right now</p>
}

/**
 * The dashboard's live money/people tiles, composed figure-first per the
 * AdminDashboard board (serif figure, plain muted caption below). Null props
 * render placeholders.
 */
export function MetricCards({
  outstanding,
  collected,
  memberCount,
}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col gap-1 rounded-lg border border-secondary-border bg-secondary px-4.5 py-3.5">
        {isNil(outstanding) ? (
          <Unavailable />
        ) : (
          <>
            <MetricFigure className="text-secondary-foreground">
              {formatCurrency(outstanding.total)}
            </MetricFigure>
            <p className="text-[13px] text-secondary-foreground">
              Outstanding right now
              {outstanding.openFeeCount > 0 ? (
                <>
                  {' · '}
                  <Link
                    href="/admin/payments"
                    className="font-semibold text-primary hover:text-primary-hover"
                  >
                    View the {outstanding.openFeeCount} open{' '}
                    {outstanding.openFeeCount === 1 ? 'fee' : 'fees'} →
                  </Link>
                </>
              ) : (
                ' · every fee is settled'
              )}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-1 rounded-lg border bg-card px-4.5 py-3.5">
        {isNil(collected) ? (
          <Unavailable />
        ) : (
          <>
            <MetricFigure className="text-success">
              {formatCurrency(collected.total)}
            </MetricFigure>
            <p className="text-[13px] text-muted-foreground">
              Collected in {collected.year} · {collected.count}{' '}
              {collected.count === 1 ? 'payment' : 'payments'}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-1 rounded-lg border bg-card px-4.5 py-3.5">
        {isNil(memberCount) ? (
          <Unavailable />
        ) : (
          <>
            <MetricFigure>{memberCount}</MetricFigure>
            <p className="text-[13px] text-muted-foreground">
              Community members with an account
            </p>
          </>
        )}
      </div>
    </div>
  )
}
