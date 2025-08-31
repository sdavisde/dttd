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
import { WeekendRosterMember } from '@/actions/weekend'

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
  if (!rosterMember?.payment_info) {
    return null
  }

  const { payment_info } = rosterMember
  const { users } = rosterMember

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
    if (!paymentIntentId) return null
    // Stripe dashboard URL format: https://dashboard.stripe.com/payments/{payment_intent_id}
    return `https://dashboard.stripe.com/payments/${paymentIntentId}`
  }

  const stripeUrl = getStripeDashboardUrl(payment_info.payment_intent_id)

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

          {/* Payment Method */}
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Method:
            </span>
            <span className="ml-2">
              {payment_info.payment_method ? (
                <Badge variant="outline">{payment_info.payment_method}</Badge>
              ) : (
                <span className="text-muted-foreground">Not specified</span>
              )}
            </span>
          </div>

          {/* Payment Amount */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Amount:
            </span>
            <span className="ml-2 font-semibold">
              {formatAmount(payment_info.payment_amount)}
            </span>
          </div>

          {/* Payment Intent ID */}
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Payment Intent:
            </span>
            <span className="ml-2">
              {payment_info.payment_intent_id ? (
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {payment_info.payment_intent_id}
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
              ) : (
                <span className="text-muted-foreground">Not available</span>
              )}
            </span>
          </div>
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
