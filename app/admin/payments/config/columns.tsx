'use client'

import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { isNil } from 'lodash'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { PaymentRowActions } from '../components/PaymentRowActions'
import { formatCurrency, formatPersonName } from '@/lib/payments/formatters'
import {
  formatLedgerFor,
  ledgerMethodLabel,
  ledgerRowMatchesSearch,
  type LedgerRow,
  type LedgerStatus,
} from '@/lib/payments/ledger'
import { cn } from '@/lib/utils'
import '@/components/ui/data-table/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Board-style short date: "Aug 25", with the year once it is not this year. */
export function formatLedgerDate(dateString: string | null): string {
  if (isNil(dateString)) return '—'
  const date = new Date(dateString)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

const STATUS_LABELS: Record<LedgerStatus, string> = {
  paid: 'Paid',
  waived: 'Waived',
  outstanding: 'Outstanding',
  voided: 'Voided',
}

const STATUS_PILL_CLASSES: Record<LedgerStatus, string> = {
  paid: 'bg-success/15 text-success',
  waived: 'bg-muted text-muted-foreground',
  outstanding:
    'border border-secondary-border bg-secondary text-secondary-foreground',
  voided: 'border border-border text-muted-foreground',
}

export function LedgerStatusPill({
  status,
  title,
}: {
  status: LedgerStatus
  title?: string
}) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        STATUS_PILL_CLASSES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

const isVoided = (row: LedgerRow) => row.status === 'voided'

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

/**
 * Columns hidden from the table but kept so their filters still apply.
 * Pass to DataTable's `columnVisibility`.
 */
export const LEDGER_HIDDEN_COLUMNS = { type: false } as const

export const paymentsColumns: ColumnDef<LedgerRow>[] = [
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <PaymentRowActions row={row.original} />,
    enableSorting: false,
    meta: {
      showOnMobile: true,
      mobileLabel: 'Actions',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'paidBy',
    accessorFn: (row) => row.paidBy ?? '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paid by" />
    ),
    cell: ({ row }) => (
      <span
        className={cn(
          'font-semibold',
          isVoided(row.original) && 'text-muted-foreground line-through'
        )}
      >
        {formatPersonName(row.original.paidBy)}
      </span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Paid by',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'for',
    // Sort and search on the person, not the fee-type prefix.
    accessorFn: (row) => row.personName ?? '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="For" />
    ),
    cell: ({ row }) => (
      <span
        className={cn(
          isVoided(row.original) && 'text-muted-foreground line-through'
        )}
      >
        {formatLedgerFor(row.original)}
      </span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'For',
      mobilePriority: 'primary',
    },
  },
  {
    id: 'role',
    accessorFn: (row) => row.roleLabel,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue<string>()}</span>
    ),
    meta: {
      filterType: 'select',
      showOnMobile: true,
      mobileLabel: 'Role',
      mobilePriority: 'detail',
    },
  },
  {
    // Hidden: exists so the Type chip can filter on it.
    id: 'type',
    accessorFn: (row) => row.typeLabel,
    header: 'Type',
    enableSorting: false,
    meta: { filterType: 'select', showOnMobile: false },
  },
  {
    id: 'weekend',
    accessorFn: (row) => row.weekendLabel,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weekend" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue<string>()}</span>
    ),
    meta: {
      filterType: 'select',
      showOnMobile: true,
      mobileLabel: 'Weekend',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'amount',
    accessorFn: (row) => row.amount,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => (
      <span
        className={cn(
          'tabular-nums',
          isVoided(row.original) && 'text-muted-foreground line-through'
        )}
      >
        {formatCurrency(row.original.amount)}
      </span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Amount',
      mobilePriority: 'secondary',
    },
  },
  {
    id: 'method',
    accessorFn: (row) => ledgerMethodLabel(row),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Method" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue<string>()}</span>
    ),
    meta: {
      filterType: 'select',
      showOnMobile: true,
      mobileLabel: 'Method',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'status',
    accessorFn: (row) => STATUS_LABELS[row.status],
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <LedgerStatusPill
        status={row.original.status}
        title={row.original.payment?.void_reason ?? undefined}
      />
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Status',
      mobilePriority: 'secondary',
    },
  },
  {
    id: 'date',
    // Undefined (not null) so `sortUndefined` keeps unpaid fees at the end
    // whichever way the dates are sorted.
    accessorFn: (row) => row.date ?? undefined,
    sortUndefined: 'last',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <span
        className="text-muted-foreground tabular-nums"
        title={
          isNil(row.original.date)
            ? undefined
            : new Date(row.original.date).toLocaleString('en-US')
        }
      >
        {formatLedgerDate(row.original.date)}
      </span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Date',
      mobilePriority: 'detail',
    },
  },
]

// ---------------------------------------------------------------------------
// Global filter function
// ---------------------------------------------------------------------------

export const paymentsGlobalFilterFn: FilterFn<LedgerRow> = (
  row,
  _columnId,
  filterValue
) => ledgerRowMatchesSearch(row.original, String(filterValue ?? ''))
