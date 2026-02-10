'use client'

import { ColumnDef, FilterFn } from '@tanstack/react-table'
import { PaymentTransactionDTO } from '@/services/payment'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Info } from 'lucide-react'
import { isNil } from 'lodash'
import '@/components/ui/data-table/types'

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

const formatCurrency = (amount: number | null) => {
  if (amount === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatTargetType = (targetType: PaymentTransactionDTO['target_type']) => {
  switch (targetType) {
    case 'weekend_roster':
      return 'Team'
    case 'candidate':
      return 'Candidate'
    default:
      return 'Other'
  }
}

const getTargetTypeBadgeColor = (
  targetType: PaymentTransactionDTO['target_type']
) => {
  switch (targetType) {
    case 'weekend_roster':
      return 'default' as const
    case 'candidate':
      return 'secondary' as const
    default:
      return 'outline' as const
  }
}

const formatPaymentMethod = (
  method: PaymentTransactionDTO['payment_method']
) => {
  switch (method) {
    case 'stripe':
      return 'Stripe'
    case 'cash':
      return 'Cash'
    case 'check':
      return 'Check'
    default:
      return method ?? 'Unknown'
  }
}

// ---------------------------------------------------------------------------
// Metadata Popover Component
// ---------------------------------------------------------------------------

function MetadataPopover({ payment }: { payment: PaymentTransactionDTO }) {
  const hasMetadata =
    !isNil(payment.payment_intent_id) ||
    !isNil(payment.charge_id) ||
    !isNil(payment.balance_transaction_id)

  if (!hasMetadata) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2 text-sm">
          <h4 className="font-medium">Payment Metadata</h4>
          {!isNil(payment.payment_intent_id) && (
            <div>
              <span className="text-muted-foreground">Payment Intent:</span>
              <code className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">
                {payment.payment_intent_id}
              </code>
            </div>
          )}
          {!isNil(payment.charge_id) && (
            <div>
              <span className="text-muted-foreground">Charge ID:</span>
              <code className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">
                {payment.charge_id}
              </code>
            </div>
          )}
          {!isNil(payment.balance_transaction_id) && (
            <div>
              <span className="text-muted-foreground">Balance Txn:</span>
              <code className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">
                {payment.balance_transaction_id}
              </code>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

export const paymentsColumns: ColumnDef<PaymentTransactionDTO>[] = [
  {
    id: 'type',
    accessorFn: (p) => formatTargetType(p.target_type),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ getValue, row }) => (
      <Badge variant={getTargetTypeBadgeColor(row.original.target_type)}>
        {getValue<string>()}
      </Badge>
    ),
    meta: {
      filterType: 'select',
      showOnMobile: true,
      mobileLabel: 'Type',
      mobilePriority: 'secondary',
    },
  },
  {
    id: 'payer',
    accessorKey: 'payment_owner',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payer" />
    ),
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string | null>() ?? '—'}</span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Payer',
      mobilePriority: 'primary',
    },
  },
  {
    id: 'gross',
    accessorKey: 'gross_amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gross" />
    ),
    cell: ({ getValue }) => (
      <span className="font-medium text-green-600">
        {formatCurrency(getValue<number>())}
      </span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Gross',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'net',
    accessorKey: 'net_amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Net" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {formatCurrency(getValue<number | null>())}
      </span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Net',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'method',
    accessorFn: (p) => formatPaymentMethod(p.payment_method),
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
    id: 'notes',
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground max-w-[200px] truncate block">
        {getValue<string | null>() ?? '—'}
      </span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Notes',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'meta',
    header: 'Meta',
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <MetadataPopover payment={row.original} />
      </div>
    ),
    enableSorting: false,
    meta: {
      showOnMobile: false,
    },
  },
  {
    id: 'date',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {formatDate(getValue<string>())}
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

export const paymentsGlobalFilterFn: FilterFn<PaymentTransactionDTO> = (
  row,
  _columnId,
  filterValue
) => {
  const query = (filterValue as string).toLowerCase().trim()
  if (!query) return true

  const payment = row.original
  const payer = (payment.payment_owner ?? '').toLowerCase()
  const targetType = formatTargetType(payment.target_type).toLowerCase()
  const method = formatPaymentMethod(payment.payment_method).toLowerCase()
  const grossAmount = formatCurrency(payment.gross_amount).toLowerCase()
  const notes = (payment.notes ?? '').toLowerCase()
  const intentId = (payment.payment_intent_id ?? '').toLowerCase()

  return (
    payer.includes(query) ||
    targetType.includes(query) ||
    method.includes(query) ||
    grossAmount.includes(query) ||
    notes.includes(query) ||
    intentId.includes(query)
  )
}
