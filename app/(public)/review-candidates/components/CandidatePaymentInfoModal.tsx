'use client'

import { ExternalLink, CreditCard, Hash, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HydratedCandidate } from '@/lib/candidates/types'
import { getCandidateFee } from '@/services/payment/actions'
import { PAYMENT_CONSTANTS } from '@/lib/constants/payments'
import { Results } from '@/lib/results'
import { useQuery } from '@tanstack/react-query'

type CandidatePaymentInfoModalProps = {
  open: boolean
  onClose: () => void
  candidate: HydratedCandidate | null
}

export function CandidatePaymentInfoModal({
  open,
  onClose,
  candidate,
}: CandidatePaymentInfoModalProps) {
  const { data: stripePriceDollars, isLoading: isLoadingPrice } = useQuery({
    queryKey: ['candidateFee'],
    queryFn: async () => {
      const result = await getCandidateFee()
      const price = Results.toNullable(result)
      return price?.unit_amount ? price.unit_amount / 100 : null
    },
    staleTime: Infinity,
  })

  if (!candidate) {
    return null
  }

  const payments = candidate.candidate_payments ?? []
  const candidateName =
    candidate.candidate_sponsorship_info?.candidate_name ?? 'Unknown Candidate'

  const formatAmount = (amount: number | null) => {
    if (amount === null) return 'Not specified'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStripeDashboardUrl = (paymentIntentId: string | null) => {
    if (!paymentIntentId || paymentIntentId.startsWith('manual_')) return null
    return `https://dashboard.stripe.com/payments/${paymentIntentId}`
  }

  const totalPaid = payments.reduce(
    (sum, payment) => sum + (payment.payment_amount ?? 0),
    0
  )

  // Check if there are any manual payments to determine if discount applies
  const hasManualPayments = payments.some((p) =>
    p.payment_intent_id?.startsWith('manual_')
  )
  const totalFee = stripePriceDollars
    ? hasManualPayments
      ? stripePriceDollars - PAYMENT_CONSTANTS.MANUAL_PAYMENT_DISCOUNT
      : stripePriceDollars
    : null
  const remainingBalance = totalFee !== null ? totalFee - totalPaid : null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getPaymentTypeDisplay = (payment: (typeof payments)[0]) => {
    // Check if it's a manual payment
    if (payment.payment_intent_id?.startsWith('manual_')) {
      const method = (payment as { payment_method?: string }).payment_method
      if (method) {
        return method.charAt(0).toUpperCase() + method.slice(1)
      }
      return 'Manual'
    }
    // Stripe payment
    return 'Credit Card'
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
          {/* Candidate Name */}
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">
              Candidate:
            </span>
            <span className="ml-2 font-semibold">{candidateName}</span>
          </div>

          {/* Payment Summary */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            {isLoadingPrice ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">
                  Loading fee...
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span>Total Candidate Fee:</span>
                  <span className="font-medium">
                    {totalFee !== null ? `$${totalFee}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Paid:</span>
                  <span className="font-medium">${totalPaid}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                  <span>Balance Remaining:</span>
                  <span
                    className={
                      remainingBalance !== null && remainingBalance > 0
                        ? 'text-amber-600'
                        : 'text-green-600'
                    }
                  >
                    {remainingBalance !== null ? `$${remainingBalance}` : '—'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Payment History */}
          {payments.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Payment History
              </h4>
              {payments.map((payment) => {
                const stripeUrl = getStripeDashboardUrl(
                  payment.payment_intent_id
                )
                const paymentWithMethod = payment as typeof payment & {
                  payment_method?: string
                  notes?: string
                }
                return (
                  <div
                    key={payment.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getPaymentTypeDisplay(payment)}
                        </Badge>
                        <span className="font-medium">
                          {formatAmount(payment.payment_amount)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(payment.created_at)}
                      </span>
                    </div>

                    {/* Show payment owner if available */}
                    {payment.payment_owner && (
                      <div className="text-xs text-muted-foreground">
                        Paid by: {payment.payment_owner}
                      </div>
                    )}

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

                    {paymentWithMethod.notes && (
                      <div className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1">
                        <span className="font-medium">Notes:</span>{' '}
                        {paymentWithMethod.notes}
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
