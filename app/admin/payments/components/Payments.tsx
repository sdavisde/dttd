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
import { Search } from 'lucide-react'
import { PaymentRecord } from '@/lib/payments/types'
import { useTablePagination } from '@/hooks/use-table-pagination'
import { TablePagination } from '@/components/ui/table-pagination'

type PaymentsProps = {
  payments: PaymentRecord[]
}

export function Payments({ payments }: PaymentsProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Format currency for display
  const formatCurrency = (amount: number) => {
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

  // Get badge color for payment type
  const getPaymentTypeBadgeColor = (type: PaymentRecord['type']) => {
    switch (type) {
      case 'team_fee':
        return 'default'
      case 'candidate_fee':
        return 'secondary'
      case 'refund':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Format payment type for display
  const formatPaymentType = (type: PaymentRecord['type']) => {
    switch (type) {
      case 'team_fee':
        return 'Team Fee'
      case 'candidate_fee':
        return 'Candidate Fee'
      case 'refund':
        return 'Refund'
      default:
        return type
    }
  }

  // Format payment method for display
  const formatPaymentMethod = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'credit_card':
        return 'Credit Card'
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
      const name = payment.payer_name?.toLowerCase()
      const email = payment.payer_email?.toLowerCase()
      const type = formatPaymentType(payment.type).toLowerCase()
      const method = formatPaymentMethod(payment.payment_method).toLowerCase()
      const amount = formatCurrency(payment.payment_amount).toLowerCase()
      const intentId = payment.payment_intent_id.toLowerCase()

      return (
        (name?.includes(query) ?? false) ||
        (email?.includes(query) ?? false) ||
        type.includes(query) ||
        method.includes(query) ||
        amount.includes(query) ||
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

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search payments by name, email, type, method, or amount..."
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
                <TableHead className="font-bold min-w-[100px]">Type</TableHead>
                <TableHead className="font-bold min-w-[200px]">Name</TableHead>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="min-w-[120px]">Amount</TableHead>
                <TableHead className="min-w-[120px]">Method</TableHead>
                <TableHead className="min-w-[150px]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
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
                      <Badge variant={getPaymentTypeBadgeColor(payment.type)}>
                        {formatPaymentType(payment.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.payer_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.payer_email}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(payment.payment_amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatPaymentMethod(payment.payment_method)}
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
              {/* Header with Name and Type */}
              <div className="flex items-center justify-between">
                <div className="font-medium text-lg">{payment.payer_name}</div>
                <Badge variant={getPaymentTypeBadgeColor(payment.type)}>
                  {formatPaymentType(payment.type)}
                </Badge>
              </div>

              {/* Payment Details */}
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground w-16">Email:</span>
                  <span className="text-foreground">{payment.payer_email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground w-16">Amount:</span>
                  <span className="text-green-600 font-medium">
                    {formatCurrency(payment.payment_amount)}
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
              </div>
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
