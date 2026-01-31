'use client'

import { useState } from 'react'
import { DollarSign, CreditCard, FileText, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
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
import { WeekendRosterMember, recordManualPayment } from '@/services/weekend'
import { getTeamFee } from '@/services/payment/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { isOk, Results } from '@/lib/results'
import { PAYMENT_CONSTANTS } from '@/lib/constants/payments'
import { useQuery } from '@tanstack/react-query'

type CashCheckPaymentModalProps = {
  open: boolean
  onClose: () => void
  rosterMember: WeekendRosterMember | null
}

export function CashCheckPaymentModal({
  open,
  onClose,
  rosterMember,
}: CashCheckPaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentType, setPaymentType] = useState<'cash' | 'check' | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const { data: stripePriceDollars, isLoading: isLoadingPrice } = useQuery({
    queryKey: ['teamFee'],
    queryFn: async () => {
      const result = await getTeamFee()
      const price = Results.toNullable(result)
      return price?.unitAmount ? price.unitAmount / 100 : null
    },
    staleTime: Infinity,
  })

  if (!rosterMember?.users) {
    return null
  }

  const { users } = rosterMember
  const memberName =
    users?.first_name && users?.last_name
      ? `${users.first_name} ${users.last_name}`
      : 'Unknown User'

  const totalFee =
    paymentType && stripePriceDollars
      ? stripePriceDollars - PAYMENT_CONSTANTS.MANUAL_PAYMENT_DISCOUNT
      : null
  const currentPaid = rosterMember.total_paid ?? 0
  const remainingBalance = totalFee !== null ? totalFee - currentPaid : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentType) return
    setIsSubmitting(true)

    try {
      const result = await recordManualPayment(
        rosterMember.id,
        parseFloat(paymentAmount),
        paymentType,
        notes
      )

      if (isOk(result)) {
        toast.success(
          `${paymentType === 'cash' ? 'Cash' : 'Check'} payment of $${paymentAmount} recorded successfully`
        )

        // Reset form and close modal
        setPaymentAmount('')
        setPaymentType(null)
        setNotes('')
        onClose()

        // Refresh the page to update the payment display
        router.refresh()
      } else {
        toast.error(`Failed to record payment: ${result.error}`)
      }
    } catch (error) {
      console.error('Error recording payment:', error)
      toast.error('An unexpected error occurred while recording the payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setPaymentAmount('')
    setPaymentType(null)
    setNotes('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Record Cash/Check Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Member Name */}
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">Member:</span>
            <span className="ml-2 font-semibold">{memberName}</span>
          </div>

          {/* Payment Type - moved above summary */}
          <div className="space-y-2">
            <Label htmlFor="payment-type">Payment Type</Label>
            <Select
              value={paymentType ?? ''}
              onValueChange={(value: 'cash' | 'check') => setPaymentType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Cash
                  </div>
                </SelectItem>
                <SelectItem value="check">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Check
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Summary - conditional display */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            {isLoadingPrice ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">
                  Loading fee...
                </span>
              </div>
            ) : !paymentType ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                Select a payment method to see fee details
              </p>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span>Total Team Fee:</span>
                  <span className="font-medium">${totalFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Already Paid:</span>
                  <span className="font-medium">${currentPaid}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Remaining Balance:</span>
                  <span
                    className={
                      remainingBalance !== null && remainingBalance > 0
                        ? 'text-amber-600'
                        : 'text-green-600'
                    }
                  >
                    ${remainingBalance}
                  </span>
                </div>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Amount */}
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Payment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="payment-amount"
                  type="number"
                  min="0"
                  max={remainingBalance ?? undefined}
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                  required
                  disabled={!paymentType}
                />
              </div>
              {remainingBalance !== null &&
                parseFloat(paymentAmount) > remainingBalance && (
                  <p className="text-xs text-amber-600">
                    Amount exceeds remaining balance
                  </p>
                )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="payment-notes">
                Notes {paymentType === 'check' && '(Check Number, etc.)'}
              </Label>
              <Textarea
                id="payment-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  paymentType === 'check'
                    ? 'Check #1234, Bank Name, etc.'
                    : 'Optional notes about the payment...'
                }
                rows={3}
                disabled={!paymentType}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || !paymentAmount || !paymentType}
              >
                {isSubmitting ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
