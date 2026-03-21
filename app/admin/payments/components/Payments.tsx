'use client'

import { useMemo } from 'react'
import type { PaymentTransactionDTO } from '@/services/payment'
import { DataTable, useDataTableUrlState } from '@/components/ui/data-table'
import { paymentsColumns, paymentsGlobalFilterFn } from '../config/columns'
import { PaymentsSummary } from './PaymentsSummary'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'
import {
  formatTargetType,
  formatPaymentMethod,
  formatWeekendLabel,
} from '@/lib/payments/formatters'

type PaymentsProps = {
  payments: PaymentTransactionDTO[]
}

export function Payments({ payments }: PaymentsProps) {
  const urlState = useDataTableUrlState({
    defaultSort: [{ id: 'created_at', desc: true }],
    defaultPageSize: 25,
  })

  // Compute which payments match current filters for summary
  const filteredPayments = useMemo(() => {
    const globalFilter = (urlState.globalFilter ?? '').trim().toLowerCase()
    const columnFilters = urlState.columnFilters ?? []

    return payments.filter((p) => {
      // Apply global filter
      if (globalFilter !== '') {
        const searchable = [
          p.payment_owner,
          formatTargetType(p.target_type),
          formatPaymentMethod(p.payment_method),
          String(p.gross_amount),
          p.notes,
          p.payment_intent_id,
          formatWeekendLabel(p),
        ]
          .filter((v): v is string => v !== null && v !== '')
          .join(' ')
          .toLowerCase()
        if (!searchable.includes(globalFilter)) return false
      }

      // Apply column filters
      for (const cf of columnFilters) {
        const values = cf.value as string[]
        if (values === null || values === undefined || values.length === 0)
          continue

        if (cf.id === 'type') {
          if (!values.includes(formatTargetType(p.target_type))) return false
        } else if (cf.id === 'method') {
          if (!values.includes(formatPaymentMethod(p.payment_method)))
            return false
        } else if (cf.id === 'weekend') {
          if (!values.includes(formatWeekendLabel(p))) return false
        }
      }

      return true
    })
  }, [payments, urlState.globalFilter, urlState.columnFilters])

  const isFiltered =
    (urlState.globalFilter ?? '').trim() !== '' ||
    (urlState.columnFilters ?? []).length > 0

  return (
    <div className="space-y-4">
      <DataTable
        columns={paymentsColumns}
        data={payments}
        user={null}
        initialSort={[{ id: 'created_at', desc: true }]}
        globalFilterFn={paymentsGlobalFilterFn}
        urlState={urlState}
        searchPlaceholder="Search by payer, type, method, amount, weekend, or notes..."
        emptyState={{
          noData: 'No payments found.',
          noResults: 'No payments matching your search.',
        }}
        toolbarChildren={
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/payments/summary">
              <BarChart3 className="mr-1 h-4 w-4" />
              Report
            </Link>
          </Button>
        }
      />
      <PaymentsSummary payments={filteredPayments} isFiltered={isFiltered} />
    </div>
  )
}
