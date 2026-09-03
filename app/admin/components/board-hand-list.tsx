import Link from 'next/link'
import { CalendarPlus, CheckCircle2, CircleDollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/payments/formatters'
import type { BoardHandItem } from '@/lib/admin/dashboard-metrics'

type BoardHandListProps = {
  items: BoardHandItem[]
  /** True when a source failed, so an empty list can't promise "all clear". */
  degraded: boolean
}

const itemCopy: Record<
  BoardHandItem['key'],
  { detail: string; linkLabel: string }
> = {
  'open-fees': {
    detail: 'Record or follow up from the payments ledger',
    linkLabel: 'Go to payments',
  },
  'start-planning': {
    detail: 'Set dates and leadership to open planning',
    linkLabel: 'Go to weekends',
  },
}

function itemTitle(item: BoardHandItem): string {
  if (item.key === 'open-fees') {
    const fees = item.openFeeCount === 1 ? 'fee is' : 'fees are'
    return `${item.openFeeCount} ${fees} still open · ${formatCurrency(item.outstandingTotal)}`
  }
  return "The next weekend group isn't scheduled yet"
}

/** "Needs a board hand" — the computable action list, or a reassurance state. */
export function BoardHandList({ items, degraded }: BoardHandListProps) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Needs a board hand
      </h2>

      {items.length === 0 && !degraded && (
        <div className="mt-4 flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-success"
            aria-hidden
          />
          <p className="text-sm text-muted-foreground">
            Nothing needs the board right now — weekend operations live with
            each weekend&apos;s leaders.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <ul className="mt-4 divide-y">
          {items.map((item) => {
            const Icon =
              item.key === 'open-fees' ? CircleDollarSign : CalendarPlus
            return (
              <li
                key={item.key}
                className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-medium">{itemTitle(item)}</p>
                    <p className="text-sm text-muted-foreground">
                      {itemCopy[item.key].detail}
                    </p>
                  </div>
                </div>
                <Link
                  href={item.href}
                  className="shrink-0 text-sm font-medium text-primary hover:text-primary-hover sm:ml-4"
                >
                  {itemCopy[item.key].linkLabel} →
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {degraded && (
        <p className="mt-4 text-sm text-muted-foreground">
          Some information couldn&apos;t be checked just now, so this list may
          be incomplete.
        </p>
      )}
    </section>
  )
}
