'use client'

import { useEffect, useState } from 'react'
import { isNil } from 'lodash'
import { Info } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateCandidatePaymentOwner } from '@/actions/candidates'
import type { PaymentOwner, ReviewCandidate } from '@/lib/candidates/review'
import * as Results from '@/lib/results'
import { toastError } from '@/lib/toast-error'
import { PaymentRequestEmailPreview } from './PaymentRequestEmailPreview'
import { ReviewStatusPill } from './review-status-pill'

interface SendPaymentRequestConfirmationModalProps {
  isOpen: boolean
  candidate: ReviewCandidate | null
  /** True when the request already went out once and this is a nudge. */
  resend: boolean
  onCancel: () => void
  onConfirm: () => Promise<void>
}

/**
 * The "Approve" step: approving a candidate means asking for their fee. The
 * dialog picks who receives the request (candidate or sponsor), previews the
 * email, and says plainly what happens to the candidate's status.
 */
export function SendPaymentRequestConfirmationModal({
  isOpen,
  candidate,
  resend,
  onCancel,
  onConfirm,
}: SendPaymentRequestConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdatingPaymentOwner, setIsUpdatingPaymentOwner] = useState(false)
  const [paymentOwner, setPaymentOwner] = useState<PaymentOwner>('candidate')

  useEffect(() => {
    if (!isNil(candidate)) setPaymentOwner(candidate.sponsor.paymentOwner)
  }, [candidate])

  if (isNil(candidate)) return null

  const sponsorName = candidate.sponsor.name ?? 'Sponsor'
  const recipientName =
    paymentOwner === 'candidate' ? candidate.name : sponsorName
  const recipientEmail =
    paymentOwner === 'candidate' ? candidate.email : candidate.sponsor.email

  const handlePaymentOwnerChange = async (next: PaymentOwner) => {
    setIsUpdatingPaymentOwner(true)
    try {
      const result = await updateCandidatePaymentOwner(candidate.id, next)
      if (Results.isOk(result)) {
        setPaymentOwner(next)
        toast.success('Payment owner updated')
      } else {
        toastError('Unable to change who pays. Please try again.', {
          error: result.error,
        })
      }
    } finally {
      setIsUpdatingPaymentOwner(false)
    }
  }

  const busy = isLoading || isUpdatingPaymentOwner

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !busy) onCancel()
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-semibold tracking-tight">
            {resend ? 'Resend the fee request' : 'Approve and request the fee'}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span>Send the request to</span>
              <Select
                value={paymentOwner}
                onValueChange={(value) =>
                  handlePaymentOwnerChange(value as PaymentOwner)
                }
                disabled={busy}
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate">Candidate</SelectItem>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                </SelectContent>
              </Select>
              <span className="font-semibold text-foreground">
                {recipientName}
              </span>
              {!isNil(recipientEmail) && <span>({recipientEmail})</span>}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-auto rounded-md border bg-muted">
          <PaymentRequestEmailPreview
            candidate={candidate}
            paymentOwner={paymentOwner}
            paymentOwnerName={recipientName}
          />
        </div>

        <div className="flex items-start gap-2 rounded-md border border-secondary-border bg-secondary p-3">
          <Info
            className="mt-0.5 size-4 shrink-0 text-secondary-foreground"
            aria-hidden
          />
          <div className="flex flex-wrap items-center gap-2 text-sm text-secondary-foreground">
            <span>Sending this moves the candidate to</span>
            <ReviewStatusPill status="awaiting_payment" />
            <span>until the fee arrives.</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="default"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button size="default" onClick={handleConfirm} disabled={busy}>
            {isLoading
              ? 'Sending…'
              : resend
                ? 'Resend request'
                : 'Approve and send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
