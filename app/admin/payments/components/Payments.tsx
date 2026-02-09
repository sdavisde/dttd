'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Search, Info } from 'lucide-react'
import { PaymentTransactionDTO } from '@/services/payment'
import { useTablePagination } from '@/hooks/use-table-pagination'
import { TablePagination } from '@/components/ui/table-pagination'
import { isNil } from 'lodash'

type PaymentsProps = {
  payments: PaymentTransactionDTO[]
}

export function Payments({ payments }: PaymentsProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Format currency for display
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get badge color for target type
  const getTargetTypeBadgeColor = (
    targetType: PaymentTransactionDTO['target_type']
  ) => {
    switch (targetType) {
      case 'weekend_roster':
        return 'default'
      case 'candidate':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // Format target type for display
  const formatTargetType = (
    targetType: PaymentTransactionDTO['target_type']
  ) => {
    switch (targetType) {
      case 'weekend_roster':
        return 'Team'
      case 'candidate':
        return 'Candidate'
      default:
        return 'Other'
    }
  }

  // Format payment method for display
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

  // Fuzzy search filtering
  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) {
      return payments
    }

    const query = searchQuery.toLowerCase().trim()

    return payments.filter((payment) => {
      const owner = payment.payment_owner?.toLowerCase() ?? ''
      const targetType = formatTargetType(payment.target_type).toLowerCase()
      const method = formatPaymentMethod(payment.payment_method).toLowerCase()
      const grossAmount = formatCurrency(payment.gross_amount).toLowerCase()
      const notes = payment.notes?.toLowerCase() ?? ''
      const intentId = payment.payment_intent_id?.toLowerCase() ?? ''

      return (
        owner.includes(query) ||
        targetType.includes(query) ||
        method.includes(query) ||
        grossAmount.includes(query) ||
        notes.includes(query) ||
        intentId.includes(query)
      )
    })
  }, [payments, searchQuery])

  // Pagination setup
  const { paginatedData, pagination, setPage, setPageSize } =
    useTablePagination(filteredPayments, {
      initialPageSize: 10,
      initialPage: 1,
    })

  // Metadata popover content
  const MetadataPopover = ({ payment }: { payment: PaymentTransactionDTO }) => {
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

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by payer, type, method, amount, or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results Summary */}
      {searchQuery.trim() && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredPayments.length} of {payments.length} payments
        </div>
      )}

      {/* Desktop Table - Hidden on mobile */}
      <div className="relative hidden md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold min-w-[80px]">Type</TableHead>
                <TableHead className="font-bold min-w-[150px]">Payer</TableHead>
                <TableHead className="min-w-[100px]">Gross</TableHead>
                <TableHead className="min-w-[100px]">Net</TableHead>
                <TableHead className="min-w-[100px]">Method</TableHead>
                <TableHead className="min-w-[200px]">Notes</TableHead>
                <TableHead className="min-w-[50px]">Meta</TableHead>
                <TableHead className="min-w-[150px]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">
                      {payments.length === 0
                        ? 'No payments found.'
                        : searchQuery.trim()
                          ? 'No payments found matching your search.'
                          : 'No payments found.'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((payment, index) => (
                  <TableRow
                    key={payment.id}
                    className={`hover:bg-muted/50 ${index % 2 === 0 ? '' : 'bg-muted/25'}`}
                  >
                    <TableCell>
                      <Badge
                        variant={getTargetTypeBadgeColor(payment.target_type)}
                      >
                        {formatTargetType(payment.target_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.payment_owner ?? '—'}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(payment.gross_amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatCurrency(payment.net_amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatPaymentMethod(payment.payment_method)}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {payment.notes ?? '—'}
                    </TableCell>
                    <TableCell>
                      <MetadataPopover payment={payment} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(payment.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <TablePagination
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Mobile Card Layout - Shown only on mobile */}
      <div className="md:hidden space-y-3">
        {paginatedData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {payments.length === 0
                ? 'No payments found.'
                : searchQuery.trim()
                  ? 'No payments found matching your search.'
                  : 'No payments found.'}
            </p>
          </div>
        ) : (
          paginatedData.map((payment) => (
            <div
              key={payment.id}
              className="bg-card border rounded-lg p-4 space-y-3"
            >
              {/* Header with Payer and Type */}
              <div className="flex items-center justify-between">
                <div className="font-medium text-lg">
                  {payment.payment_owner ?? 'Unknown'}
                </div>
                <Badge variant={getTargetTypeBadgeColor(payment.target_type)}>
                  {formatTargetType(payment.target_type)}
                </Badge>
              </div>

              {/* Payment Details */}
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground w-16">Gross:</span>
                  <span className="text-green-600 font-medium">
                    {formatCurrency(payment.gross_amount)}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground w-16">Net:</span>
                  <span className="text-foreground">
                    {formatCurrency(payment.net_amount)}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground w-16">Method:</span>
                  <span className="text-foreground">
                    {formatPaymentMethod(payment.payment_method)}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground w-16">Date:</span>
                  <span className="text-foreground">
                    {formatDate(payment.created_at)}
                  </span>
                </div>
                {payment.notes && (
                  <div className="flex items-start text-sm">
                    <span className="text-muted-foreground w-16">Notes:</span>
                    <span className="text-foreground">{payment.notes}</span>
                  </div>
                )}
              </div>

              {/* Metadata */}
              {(!isNil(payment.payment_intent_id) ||
                !isNil(payment.charge_id)) && (
                <div className="pt-2 border-t">
                  <MetadataPopover payment={payment} />
                </div>
              )}
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        <div className="mt-4">
          <TablePagination
            pagination={pagination}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      </div>
    </div>
  )
}
