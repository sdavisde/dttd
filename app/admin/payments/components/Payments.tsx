'use client'

import { PaymentTransactionDTO } from '@/services/payment'
import { DataTable, useDataTableUrlState } from '@/components/ui/data-table'
import { paymentsColumns, paymentsGlobalFilterFn } from '../config/columns'

type PaymentsProps = {
  payments: PaymentTransactionDTO[]
}

export function Payments({ payments }: PaymentsProps) {
  const urlState = useDataTableUrlState({
    defaultSort: [{ id: 'created_at', desc: true }],
    defaultPageSize: 25,
  })

  return (
    <DataTable
      columns={paymentsColumns}
      data={payments}
      user={null}
      initialSort={[{ id: 'created_at', desc: true }]}
      globalFilterFn={paymentsGlobalFilterFn}
      urlState={urlState}
      searchPlaceholder="Search by payer, type, method, amount, or notes..."
      emptyState={{
        noData: 'No payments found.',
        noResults: 'No payments matching your search.',
      }}
    />
  )
}
