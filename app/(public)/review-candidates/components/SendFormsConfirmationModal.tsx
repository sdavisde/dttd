'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HydratedCandidate } from '@/lib/candidates/types'
import { CandidateFormsEmailPreview } from './CandidateFormsEmailPreview'
import { StatusChip } from '@/components/candidates/status-chip'
import { Info } from 'lucide-react'

interface SendFormsConfirmationModalProps {
  isOpen: boolean
  candidate: HydratedCandidate | null
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function SendFormsConfirmationModal({
  isOpen,
  candidate,
  onCancel,
  onConfirm,
}: SendFormsConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!candidate?.candidate_sponsorship_info) {
    return null
  }

  const candidateName = candidate.candidate_sponsorship_info.candidate_name
  const candidateEmail = candidate.candidate_sponsorship_info.candidate_email

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (!isLoading) {
      onCancel()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Candidate Forms Email</DialogTitle>
          <DialogDescription>
            Do you want to send this email to{' '}
            <span className="font-semibold text-foreground">
              {candidateName}
            </span>{' '}
            ({candidateEmail})?
          </DialogDescription>
        </DialogHeader>

        {/* Email Preview */}
        <div className="border rounded-lg bg-gray-50 max-h-[400px] overflow-auto">
          <CandidateFormsEmailPreview
            candidateSponsorshipInfo={candidate.candidate_sponsorship_info}
          />
        </div>

        {/* Status Change Notice */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex items-center gap-2 text-sm text-blue-900">
            <span>Sending this email will put the candidate into</span>
            <StatusChip status="awaiting_forms" />
            <span>status</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Confirm & Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
