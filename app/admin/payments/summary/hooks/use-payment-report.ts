import { useMemo, useState } from 'react'
import { isNil } from 'lodash'
import type { PaymentTransactionDTO } from '@/services/payment'
import { computeWeekendReport } from '@/lib/payments/compute-totals'
import type { WeekendGroup } from '@/lib/payments/compute-totals'
import {
  formatWeekendGroupLabel,
  NO_WEEKEND_GROUP_LABEL,
} from '@/lib/payments/formatters'
import { formatWeekendGroupTitle } from '@/lib/weekend'

export type UsePaymentReportReturn = {
  weekendGroupOptions: string[]
  selectedGroup: string
  setSelectedGroup: (group: string) => void
  report: WeekendGroup[]
}

export function usePaymentReport(
  payments: PaymentTransactionDTO[]
): UsePaymentReportReturn {
  const weekendGroupOptions = useMemo(() => {
    // Sort on the number, not the label — otherwise "#10" sorts before "#9".
    const numbers = new Set<number | null>()
    for (const p of payments) {
      numbers.add(p.weekend_number)
    }
    return [...numbers]
      .sort((a, b) => {
        if (isNil(a)) return 1
        if (isNil(b)) return -1
        return b - a
      })
      .map((number) =>
        isNil(number) ? NO_WEEKEND_GROUP_LABEL : formatWeekendGroupTitle(number)
      )
  }, [payments])

  const [selectedGroup, setSelectedGroup] = useState<string>('all')

  const filteredPayments = useMemo(() => {
    if (selectedGroup === 'all') return payments
    return payments.filter((p) => formatWeekendGroupLabel(p) === selectedGroup)
  }, [payments, selectedGroup])

  const report = useMemo(
    () => computeWeekendReport(filteredPayments),
    [filteredPayments]
  )

  return {
    weekendGroupOptions,
    selectedGroup,
    setSelectedGroup,
    report,
  }
}
