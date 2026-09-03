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

function MetricLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  )
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

/** The dashboard's live money/people tiles. Null props render placeholders. */
export function MetricCards({
  outstanding,
  collected,
  memberCount,
}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg border border-secondary-border bg-secondary p-5">
        <MetricLabel>Outstanding right now</MetricLabel>
        {isNil(outstanding) ? (
          <Unavailable />
        ) : (
          <>
            <MetricFigure className="mt-2 text-secondary-foreground">
              {formatCurrency(outstanding.total)}
            </MetricFigure>
            {outstanding.openFeeCount > 0 ? (
              <Link
                href="/admin/payments"
                className="mt-1 inline-block text-sm font-medium text-primary hover:text-primary-hover"
              >
                View the {outstanding.openFeeCount} open{' '}
                {outstanding.openFeeCount === 1 ? 'fee' : 'fees'} →
              </Link>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Every fee is settled
              </p>
            )}
          </>
        )}
      </div>

      <div className="rounded-lg border bg-card p-5">
        <MetricLabel>
          Collected in {collected?.year ?? new Date().getFullYear()}
        </MetricLabel>
        {isNil(collected) ? (
          <Unavailable />
        ) : (
          <>
            <MetricFigure className="mt-2 text-success">
              {formatCurrency(collected.total)}
            </MetricFigure>
            <p className="mt-1 text-sm text-muted-foreground">
              {collected.count} {collected.count === 1 ? 'payment' : 'payments'}
            </p>
          </>
        )}
      </div>

      <div className="rounded-lg border bg-card p-5">
        <MetricLabel>Community members</MetricLabel>
        {isNil(memberCount) ? (
          <Unavailable />
        ) : (
          <>
            <MetricFigure className="mt-2">{memberCount}</MetricFigure>
            <p className="mt-1 text-sm text-muted-foreground">
              People with an account
            </p>
          </>
        )}
      </div>
    </div>
  )
}
