'use client'

import { useMemo, useState } from 'react'
import { isNil } from 'lodash'
import type { PaymentTransactionDTO } from '@/services/payment'
import type { User } from '@/lib/users/types'
import { DataTable, useDataTableUrlState } from '@/components/ui/data-table'
import { paymentsColumns, paymentsGlobalFilterFn } from '../config/columns'
import { PaymentsSummary } from './PaymentsSummary'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'
import {
  formatTargetType,
  formatPaymentMethod,
  formatWeekendLabel,
} from '@/lib/payments/formatters'

type PaymentsProps = {
  /** Includes voided payments — they are filtered out below unless shown. */
  payments: PaymentTransactionDTO[]
  user: User | null
}

export function Payments({ payments, user }: PaymentsProps) {
  const [showVoided, setShowVoided] = useState(false)
  const urlState = useDataTableUrlState({
    defaultSort: [{ id: 'created_at', desc: true }],
    defaultPageSize: 25,
  })

  const hasVoidedPayments = payments.some((p) => !isNil(p.voided_at))

  // Voided payments are hidden unless explicitly shown, so a correction stays
  // visible on the record without cluttering the default view.
  const visiblePayments = useMemo(
    () => (showVoided ? payments : payments.filter((p) => isNil(p.voided_at))),
    [payments, showVoided]
  )

  // Compute which payments match current filters for summary. Voided payments
  // are always excluded here regardless of the toggle — voided money must
  // never reach a total.
  const filteredPayments = useMemo(() => {
    const globalFilter = (urlState.globalFilter ?? '').trim().toLowerCase()
    const columnFilters = urlState.columnFilters ?? []

    return payments.filter((p) => {
      if (!isNil(p.voided_at)) return false

      // Apply global filter
      if (globalFilter !== '') {
        const searchable = [
          p.target_name,
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
        data={visiblePayments}
        user={user}
        initialSort={[{ id: 'created_at', desc: true }]}
        globalFilterFn={paymentsGlobalFilterFn}
        urlState={urlState}
        searchPlaceholder="Search by who it was paid for or by, type, method, amount, weekend, or notes..."
        emptyState={{
          noData: 'No payments found.',
          noResults: 'No payments matching your search.',
        }}
        toolbarChildren={
          <>
            {hasVoidedPayments && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-voided"
                  checked={showVoided}
                  onCheckedChange={(checked) => setShowVoided(checked === true)}
                />
                <Label
                  htmlFor="show-voided"
                  className="text-muted-foreground text-sm font-normal"
                >
                  Show voided
                </Label>
              </div>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/payments/summary">
                <BarChart3 className="mr-1 h-4 w-4" />
                Report
              </Link>
            </Button>
          </>
        }
      />
      <PaymentsSummary payments={filteredPayments} isFiltered={isFiltered} />
    </div>
  )
}
