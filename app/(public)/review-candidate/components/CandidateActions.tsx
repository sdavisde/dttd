'use client'

import { Button } from '@/components/ui/button'
import { HydratedCandidate } from '@/lib/candidates/types'
import {
  CheckCircleIcon,
  SendIcon,
  Trash2Icon,
  XIcon,
  CreditCardIcon,
} from 'lucide-react'

interface CandidateActionsProps {
  candidate: HydratedCandidate
  onDelete: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onSendForms: (id: string) => void
  onSendPaymentRequest: (id: string) => void
  onClose: () => void
}

export function CandidateActions({
  candidate,
  onDelete,
  onApprove,
  onReject,
  onSendForms,
  onSendPaymentRequest,
  onClose,
}: CandidateActionsProps) {
  return (
    <div className="w-full flex items-center justify-between gap-1">
      {/* <Button
        variant='destructive'
        onClick={onDelete}
      >
        <Trash2Icon />
        Delete
      </Button> */}
      <div className="flex gap-1 w-full justify-between">
        {candidate.status === 'pending_approval' && (
          <>
            <Button variant="default" onClick={() => onApprove(candidate.id)}>
              <CheckCircleIcon />
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => onReject(candidate.id)}
            >
              <XIcon />
              Reject
            </Button>
          </>
        )}
        {candidate.status === 'sponsored' && (
          <Button variant="outline" onClick={() => onSendForms(candidate.id)}>
            <SendIcon />
            Send Candidate Forms
          </Button>
        )}
        {(candidate.status === 'awaiting_forms' ||
          candidate.status === 'awaiting_payment') && (
          <Button
            variant="default"
            onClick={() => onSendPaymentRequest(candidate.id)}
          >
            <SendIcon />
            Send Payment Request
          </Button>
        )}
        <Button onClick={onClose} className="flex-1 max-w-40">
          Close
        </Button>
      </div>
    </div>
  )
}
