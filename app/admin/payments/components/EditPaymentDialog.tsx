'use client'

import { useState } from 'react'
import { DollarSign } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { isOk } from '@/lib/results'
import { toastError } from '@/lib/toast-error'
import { updatePaymentDetails } from '@/services/payment/actions'
import type { PaymentMethod, PaymentTransactionDTO } from '@/services/payment'
import { formatCurrency } from '@/lib/payments/formatters'

type EditPaymentDialogProps = {
  open: boolean
  onClose: () => void
  payment: PaymentTransactionDTO
}

export function EditPaymentDialog({
  open,
  onClose,
  payment,
}: EditPaymentDialogProps) {
  const [grossAmount, setGrossAmount] = useState(String(payment.gross_amount))
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    payment.payment_method
  )
  const [paymentOwner, setPaymentOwner] = useState(payment.payment_owner ?? '')
  const [notes, setNotes] = useState(payment.notes ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const parsedAmount = Number.parseFloat(grossAmount)
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0

  const handleClose = () => {
    // Reset back to the payment's stored values so reopening starts clean.
    setGrossAmount(String(payment.gross_amount))
    setPaymentMethod(payment.payment_method)
    setPaymentOwner(payment.payment_owner ?? '')
    setNotes(payment.notes ?? '')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAmountValid) return
    setIsSubmitting(true)

    const result = await updatePaymentDetails({
      paymentId: payment.id,
      grossAmount: parsedAmount,
      paymentMethod,
      paymentOwner: paymentOwner.trim() !== '' ? paymentOwner.trim() : null,
      notes: notes.trim() !== '' ? notes.trim() : null,
    })

    setIsSubmitting(false)

    if (isOk(result)) {
      toast.success(`Payment updated to ${formatCurrency(parsedAmount)}`)
      onClose()
      router.refresh()
      return
    }

    toastError('Unable to update this payment. Please try again.', {
      error: result.error,
      paymentId: payment.id,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>
            Correct a mistyped amount, the wrong method, or the payer&apos;s
            name. To move this payment to someone else, use Reassign instead.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Amount</Label>
            <div className="relative">
              <DollarSign className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="edit-amount"
                type="number"
                min="0"
                step="0.01"
                value={grossAmount}
                onChange={(e) => setGrossAmount(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-method">Method</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
            >
              <SelectTrigger id="edit-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-paid-by">Paid By</Label>
            <Input
              id="edit-paid-by"
              type="text"
              value={paymentOwner}
              onChange={(e) => setPaymentOwner(e.target.value)}
              placeholder="Name of the person who paid"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Check #1234, bank name, etc."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isAmountValid}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
