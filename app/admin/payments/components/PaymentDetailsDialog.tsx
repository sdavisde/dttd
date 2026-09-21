'use client'

import type { ReactNode } from 'react'
import { isNil } from 'lodash'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency, formatPersonName } from '@/lib/payments/formatters'
import {
  formatLedgerFor,
  ledgerMethodLabel,
  type LedgerRow,
} from '@/lib/payments/ledger'
import { isWaived } from '@/lib/payments/waived'
import { LedgerStatusPill } from '../config/columns'

type PaymentDetailsDialogProps = {
  open: boolean
  onClose: () => void
  row: LedgerRow
}

const formatTimestamp = (value: string | null) =>
  isNil(value)
    ? '—'
    : new Date(value).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })

function DetailRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-baseline gap-3 text-sm">
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  )
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md bg-muted px-1 py-0.5 text-xs break-all">
      {children}
    </code>
  )
}

/**
 * Everything on a payment that the ledger's columns leave out: net and Stripe
 * fee, notes, the Stripe references, and the correction trail.
 */
export function PaymentDetailsDialog({
  open,
  onClose,
  row,
}: PaymentDetailsDialogProps) {
  const payment = row.payment
  if (isNil(payment)) return null

  const waived = isWaived(payment)
  const hasStripeReferences =
    payment.payment_method === 'stripe' &&
    (!isNil(payment.payment_intent_id) ||
      !isNil(payment.charge_id) ||
      !isNil(payment.balance_transaction_id))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment details</DialogTitle>
          <DialogDescription>{formatLedgerFor(row)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <DetailRow label="Status">
              <LedgerStatusPill status={row.status} />
            </DetailRow>
            <DetailRow label="Paid by">
              {formatPersonName(payment.payment_owner)}
            </DetailRow>
            <DetailRow label="For">
              {formatPersonName(payment.target_name)}
            </DetailRow>
            <DetailRow label="Weekend">{row.weekendLabel}</DetailRow>
            <DetailRow label="Method">{ledgerMethodLabel(row)}</DetailRow>
            <DetailRow label="Date">
              {formatTimestamp(payment.created_at)}
            </DetailRow>
          </div>

          <div className="space-y-2 border-t border-divider pt-4">
            <DetailRow label={waived ? 'Fee waived' : 'Amount'}>
              <span className="font-semibold tabular-nums">
                {formatCurrency(payment.gross_amount)}
              </span>
            </DetailRow>
            {waived ? (
              <p className="text-[13px] text-muted-foreground">
                Covered by the community. No money was collected, so this never
                counts toward collected totals.
              </p>
            ) : (
              <>
                <DetailRow label="Stripe fee">
                  <span className="tabular-nums">
                    {formatCurrency(payment.stripe_fee)}
                  </span>
                </DetailRow>
                <DetailRow label="Net">
                  <span className="tabular-nums">
                    {formatCurrency(
                      payment.net_amount ??
                        (payment.payment_method === 'stripe'
                          ? null
                          : payment.gross_amount)
                    )}
                  </span>
                </DetailRow>
              </>
            )}
          </div>

          <div className="space-y-2 border-t border-divider pt-4">
            <DetailRow label="Notes">
              {isNil(payment.notes) || payment.notes === ''
                ? '—'
                : payment.notes}
            </DetailRow>
            {!isNil(payment.updated_at) && (
              <DetailRow label="Last corrected">
                {formatTimestamp(payment.updated_at)}
              </DetailRow>
            )}
            {!isNil(payment.voided_at) && (
              <>
                <DetailRow label="Voided">
                  {formatTimestamp(payment.voided_at)}
                </DetailRow>
                <DetailRow label="Void reason">
                  {payment.void_reason ?? '—'}
                </DetailRow>
              </>
            )}
          </div>

          {hasStripeReferences && (
            <div className="space-y-2 border-t border-divider pt-4">
              {!isNil(payment.payment_intent_id) && (
                <DetailRow label="Payment intent">
                  <Code>{payment.payment_intent_id}</Code>
                </DetailRow>
              )}
              {!isNil(payment.charge_id) && (
                <DetailRow label="Charge">
                  <Code>{payment.charge_id}</Code>
                </DetailRow>
              )}
              {!isNil(payment.balance_transaction_id) && (
                <DetailRow label="Balance txn">
                  <Code>{payment.balance_transaction_id}</Code>
                </DetailRow>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
