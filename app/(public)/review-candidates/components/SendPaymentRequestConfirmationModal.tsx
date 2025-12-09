'use client'

import { useState, useEffect } from 'react'
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
import { HydratedCandidate } from '@/lib/candidates/types'
import { PaymentRequestEmailPreview } from './PaymentRequestEmailPreview'
import { StatusChip } from '@/components/candidates/status-chip'
import { Info } from 'lucide-react'
import { updateCandidatePaymentOwner } from '@/actions/candidates'
import * as Results from '@/lib/results'
import { toast } from 'sonner'

interface SendPaymentRequestConfirmationModalProps {
  isOpen: boolean
  candidate: HydratedCandidate | null
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function SendPaymentRequestConfirmationModal({
  isOpen,
  candidate,
  onCancel,
  onConfirm,
}: SendPaymentRequestConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdatingPaymentOwner, setIsUpdatingPaymentOwner] = useState(false)
  const [currentPaymentOwner, setCurrentPaymentOwner] = useState<
    'candidate' | 'sponsor'
  >('candidate')

  // Initialize payment owner when candidate changes
  useEffect(() => {
    if (candidate?.candidate_sponsorship_info?.payment_owner) {
      setCurrentPaymentOwner(
        candidate.candidate_sponsorship_info.payment_owner as
          | 'candidate'
          | 'sponsor'
      )
    }
  }, [candidate])

  if (!candidate?.candidate_sponsorship_info) {
    return null
  }

  const candidateName =
    candidate.candidate_sponsorship_info.candidate_name ?? 'Candidate'
  const sponsorName =
    candidate.candidate_sponsorship_info.sponsor_name ?? 'Sponsor'

  // Determine recipient name based on payment owner
  const paymentOwnerName =
    currentPaymentOwner === 'candidate' ? candidateName : sponsorName

  // Determine recipient email based on payment owner
  const recipientEmail =
    currentPaymentOwner === 'candidate'
      ? candidate.candidate_sponsorship_info.candidate_email
      : candidate.candidate_sponsorship_info.sponsor_email

  const handlePaymentOwnerChange = async (
    newOwner: 'candidate' | 'sponsor'
  ) => {
    setIsUpdatingPaymentOwner(true)
    try {
      const result = await updateCandidatePaymentOwner(candidate.id, newOwner)
      if (Results.isOk(result)) {
        setCurrentPaymentOwner(newOwner)
        toast.success('Payment owner updated')
      } else {
        toast.error('Failed to update payment owner')
      }
    } finally {
      setIsUpdatingPaymentOwner(false)
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } catch (error) {
      // If there's an error, keep modal open
      console.error('Error in onConfirm:', error)
    } finally {
      // Always reset loading state
      // The parent will close the modal on success
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (!isLoading && !isUpdatingPaymentOwner) {
      onCancel()
    }
  }

  const handleOpenChange = (open: boolean) => {
    // Only allow closing if not loading or updating
    if (!open && !isLoading && !isUpdatingPaymentOwner) {
      onCancel()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Payment Request Email</DialogTitle>
          <DialogDescription className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Send email to</span>
              <Select
                value={currentPaymentOwner}
                onValueChange={handlePaymentOwnerChange}
                disabled={isUpdatingPaymentOwner || isLoading}
              >
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate">Candidate</SelectItem>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                </SelectContent>
              </Select>
              <span className="font-semibold text-foreground">
                {paymentOwnerName}
              </span>
              <span>({recipientEmail})</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Email Preview */}
        <div className="border rounded-lg bg-gray-50 max-h-[400px] overflow-auto">
          <PaymentRequestEmailPreview
            candidate={candidate}
            paymentOwner={currentPaymentOwner}
            paymentOwnerName={paymentOwnerName}
          />
        </div>

        {/* Status Change Notice */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex items-center gap-2 text-sm text-blue-900">
            <span>Sending this email will put the candidate into</span>
            <StatusChip status="awaiting_payment" />
            <span>status</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading || isUpdatingPaymentOwner}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || isUpdatingPaymentOwner}
          >
            {isLoading ? 'Sending...' : 'Confirm & Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
