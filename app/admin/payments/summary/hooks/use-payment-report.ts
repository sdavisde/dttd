import { useMemo, useState } from 'react'
import type { PaymentTransactionDTO } from '@/services/payment'
import {
  computeWeekendReport,
  computeGrandTotals,
} from '@/lib/payments/compute-totals'
import type {
  WeekendGroup,
  ReportGrandTotals,
} from '@/lib/payments/compute-totals'

export type UsePaymentReportReturn = {
  weekendGroupOptions: string[]
  selectedGroup: string
  setSelectedGroup: (group: string) => void
  report: WeekendGroup[]
  grandTotals: ReportGrandTotals
}

export function usePaymentReport(
  payments: PaymentTransactionDTO[]
): UsePaymentReportReturn {
  const weekendGroupOptions = useMemo(() => {
    const labels = new Set<string>()
    for (const p of payments) {
      labels.add(p.weekend_title ?? 'No Weekend')
    }
    return [...labels].sort()
  }, [payments])

  const [selectedGroup, setSelectedGroup] = useState<string>('all')

  const filteredPayments = useMemo(() => {
    if (selectedGroup === 'all') return payments
    return payments.filter(
      (p) => (p.weekend_title ?? 'No Weekend') === selectedGroup
    )
  }, [payments, selectedGroup])

  const report = useMemo(
    () => computeWeekendReport(filteredPayments),
    [filteredPayments]
  )

  const grandTotals = useMemo(() => computeGrandTotals(report), [report])

  return {
    weekendGroupOptions,
    selectedGroup,
    setSelectedGroup,
    report,
    grandTotals,
  }
}
