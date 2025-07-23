'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { CandidateStatus } from '@/lib/candidates/types'
import { StatusChip } from '@/components/candidates/status-chip'

interface StatusInfoDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function StatusInfoDialog({ isOpen, onClose }: StatusInfoDialogProps) {
  const statusDescriptions: Record<CandidateStatus, string> = {
    sponsored: 'Candidate has been sponsored and is ready for the next step',
    awaiting_forms: 'Candidate needs to complete and submit required forms',
    pending_approval: 'Candidate is waiting for approval from the review committee',
    awaiting_payment: 'Payment is required before proceeding',
    confirmed: 'Candidate has been confirmed and is ready for the weekend',
    rejected: 'Candidate application has been rejected',
  }

  const allStatuses: CandidateStatus[] = [
    'sponsored',
    'awaiting_forms',
    'pending_approval',
    'awaiting_payment',
    'confirmed',
    'rejected',
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Status Information</DialogTitle>
          <DialogDescription>
            Below are all possible candidate statuses and what they mean:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {allStatuses.map((status) => (
            <div
              key={status}
              className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
            >
              <StatusChip status={status} />
              <p className="flex-1 text-sm text-gray-600">
                {statusDescriptions[status]}
              </p>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
