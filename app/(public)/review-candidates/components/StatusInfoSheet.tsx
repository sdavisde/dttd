'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { CandidateStatus } from '@/lib/candidates/types'
import { StatusChip } from '@/components/candidates/status-chip'

interface StatusInfoSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function StatusInfoSheet({ isOpen, onClose }: StatusInfoSheetProps) {
  const statusDescriptions: Record<CandidateStatus, string> = {
    sponsored: 'Candidate has been sponsored and is ready for the next step',
    awaiting_forms: 'Candidate needs to complete their information forms',
    awaiting_payment: 'Payment is required to confirm the candidate',
    confirmed: 'Candidate has been confirmed and is ready for the weekend',
    rejected: 'Candidate application has been rejected',
  }

  const allStatuses: CandidateStatus[] = [
    'sponsored',
    'awaiting_forms',
    'awaiting_payment',
    'confirmed',
    'rejected',
  ]

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Status Information</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 px-4">
          <p className="text-sm text-muted-foreground">
            Below are all possible candidate statuses and what they mean:
          </p>
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
        </div>
        <SheetFooter>
          <Button onClick={onClose}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
