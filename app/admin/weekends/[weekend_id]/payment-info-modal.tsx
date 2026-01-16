'use client'

import { ExternalLink, CreditCard, DollarSign, Hash } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WeekendRosterMember } from '@/services/weekend'
import { PAYMENT_CONSTANTS } from '@/lib/constants/payments'

type PaymentInfoModalProps = {
  open: boolean
  onClose: () => void
  rosterMember: WeekendRosterMember | null
}

export function PaymentInfoModal({
  open,
  onClose,
  rosterMember,
}: PaymentInfoModalProps) {
  if (!rosterMember) {
    return null
  }

  const { users, all_payments = [] } = rosterMember

  const memberName =
    users?.first_name && users?.last_name
      ? `${users.first_name} ${users.last_name}`
      : 'Unknown User'

  const formatAmount = (amount: number | null) => {
    if (amount === null) return 'Not specified'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount) // Assuming amount is in dollars
  }

  const getStripeDashboardUrl = (paymentIntentId: string | null) => {
    if (!paymentIntentId || paymentIntentId.startsWith('manual_')) return null
    // Stripe dashboard URL format: https://dashboard.stripe.com/payments/{payment_intent_id}
    return `https://dashboard.stripe.com/payments/${paymentIntentId}`
  }

  const totalPaid = all_payments.reduce(
    (sum, payment) => sum + (payment.payment_amount ?? 0),
    0
  )
  const totalFee = PAYMENT_CONSTANTS.TEAM_FEE
  const remainingBalance = totalFee - totalPaid

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getPaymentTypeDisplay = (
    method: string | null,
    paymentIntentId: string | null
  ) => {
    if (!method) return 'Unknown'
    if (paymentIntentId?.startsWith('manual_')) {
      return method.charAt(0).toUpperCase() + method.slice(1)
    }
    return method === 'card' ? 'Credit Card' : method
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Member Name */}
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">Member:</span>
            <span className="ml-2 font-semibold">{memberName}</span>
          </div>

          {/* Payment Summary */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Team Fee:</span>
              <span className="font-medium">${totalFee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Paid:</span>
              <span className="font-medium">${totalPaid}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t pt-2">
              <span>Balance Remaining:</span>
              <span
                className={
                  remainingBalance > 0 ? 'text-amber-600' : 'text-green-600'
                }
              >
                ${remainingBalance}
              </span>
            </div>
          </div>

          {/* Payment History */}
          {all_payments.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Payment History
              </h4>
              {all_payments.map((payment, index) => {
                const stripeUrl = getStripeDashboardUrl(
                  payment.payment_intent_id
                )
                return (
                  <div
                    key={payment.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getPaymentTypeDisplay(
                            payment.payment_method,
                            payment.payment_intent_id
                          )}
                        </Badge>
                        <span className="font-medium">
                          {formatAmount(payment.payment_amount)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(payment.created_at)}
                      </span>
                    </div>

                    {payment.payment_intent_id &&
                      !payment.payment_intent_id.startsWith('manual_') && (
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {payment.payment_intent_id}
                          </code>
                          {stripeUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => window.open(stripeUrl, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}

                    {payment.notes && (
                      <div className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1">
                        <span className="font-medium">Notes:</span>{' '}
                        {payment.notes}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No payments recorded yet
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
