'use client'

import { createContext, useContext } from 'react'
import type { LedgerRow } from '@/lib/payments/ledger'

type PaymentsLedgerContextValue = {
  /** Whether the viewer may record, reassign, edit or void payments. */
  canWrite: boolean
  /** Opens "Record a payment", prefilled for an outstanding row's person. */
  onRecordPayment: (row: LedgerRow) => void
  /** Lists an overpaid row's person's payments, so one can be voided or reassigned. */
  onShowPayments: (row: LedgerRow) => void
}

const PaymentsLedgerContext = createContext<PaymentsLedgerContextValue>({
  canWrite: false,
  onRecordPayment: () => {},
  onShowPayments: () => {},
})

export const PaymentsLedgerProvider = PaymentsLedgerContext.Provider

/**
 * Column cells are static config, so the row actions read what they need —
 * the viewer's write access and the page's dialog opener — from here.
 */
export function usePaymentsLedger(): PaymentsLedgerContextValue {
  return useContext(PaymentsLedgerContext)
}
