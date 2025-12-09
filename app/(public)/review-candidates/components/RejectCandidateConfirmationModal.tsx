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
import { StatusChip } from '@/components/candidates/status-chip'
import { Info } from 'lucide-react'

interface RejectCandidateConfirmationModalProps {
  isOpen: boolean
  candidate: HydratedCandidate | null
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function RejectCandidateConfirmationModal({
  isOpen,
  candidate,
  onCancel,
  onConfirm,
}: RejectCandidateConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!candidate?.candidate_sponsorship_info) {
    return null
  }

  const candidateName = candidate.candidate_sponsorship_info.candidate_name

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
    if (!isLoading) {
      onCancel()
    }
  }

  const handleOpenChange = (open: boolean) => {
    // Only allow closing if not loading
    if (!open && !isLoading) {
      onCancel()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reject Candidate</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject{' '}
            <span className="font-semibold text-foreground">
              {candidateName}
            </span>
            ?
            <br />
            <span className="text-muted-foreground text-sm">
              Rejected candidates can be restored using the &apos;Show
              Archived&apos; toggle.
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Status Change Notice */}
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <Info className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-2 text-sm text-red-900">
            <span className="flex items-center gap-2">
              <span>This will put the candidate into</span>
              <StatusChip status="rejected" />
              <span>status.</span>
            </span>
            <span>
              It will also hide this candidate from the candidate list.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
