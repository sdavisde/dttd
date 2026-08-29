'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { isOk } from '@/lib/results'
import { toastError } from '@/lib/toast-error'
import { voidPayment } from '@/services/payment/actions'
import type { PaymentTransactionDTO } from '@/services/payment'
import { formatCurrency, formatPersonName } from '@/lib/payments/formatters'

type VoidPaymentDialogProps = {
  open: boolean
  onClose: () => void
  payment: PaymentTransactionDTO
}

export function VoidPaymentDialog({
  open,
  onClose,
  payment,
}: VoidPaymentDialogProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleClose = () => {
    setReason('')
    onClose()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const result = await voidPayment({
      paymentId: payment.id,
      reason: reason.trim(),
    })

    setIsSubmitting(false)

    if (isOk(result)) {
      toast.success(`${formatCurrency(payment.gross_amount)} payment voided`)
      handleClose()
      router.refresh()
      return
    }

    toastError('Unable to void this payment. Please try again.', {
      error: result.error,
      paymentId: payment.id,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Void Payment</DialogTitle>
          <DialogDescription>
            The payment stops counting toward balances and totals, but stays on
            the record with your reason so the change can be explained later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 space-y-2 rounded-lg p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">
                {formatCurrency(payment.gross_amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid for:</span>
              <span className="font-medium">
                {formatPersonName(payment.target_name)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="void-reason">Reason</Label>
            <Textarea
              id="void-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Check bounced, entered twice, etc."
              rows={3}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting || reason.trim() === ''}
          >
            {isSubmitting ? 'Voiding...' : 'Void Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
