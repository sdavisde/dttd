'use client'

import { useState } from 'react'
import { isNil } from 'lodash'
import { Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ReviewCandidate } from '@/lib/candidates/review'
import { CandidateFormsEmailPreview } from './CandidateFormsEmailPreview'
import { ReviewStatusPill } from './review-status-pill'

interface SendFormsConfirmationModalProps {
  isOpen: boolean
  candidate: ReviewCandidate | null
  /** True when the forms already went out and this is a nudge. */
  resend: boolean
  onCancel: () => void
  onConfirm: () => Promise<void>
}

/** Confirms emailing the candidate their forms link, with a preview. */
export function SendFormsConfirmationModal({
  isOpen,
  candidate,
  resend,
  onCancel,
  onConfirm,
}: SendFormsConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (isNil(candidate)) return null

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
        if (!open && !isLoading) onCancel()
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-semibold tracking-tight">
            {resend ? 'Resend the candidate forms' : 'Send the candidate forms'}
          </DialogTitle>
          <DialogDescription>
            Email the forms link to{' '}
            <span className="font-semibold text-foreground">
              {candidate.name}
            </span>
            {!isNil(candidate.email) && <> ({candidate.email})</>}?
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-auto rounded-md border bg-muted">
          <CandidateFormsEmailPreview
            candidateId={candidate.id}
            candidateName={candidate.name}
          />
        </div>

        {!resend && (
          <div className="flex items-start gap-2 rounded-md border border-secondary-border bg-secondary p-3">
            <Info
              className="mt-0.5 size-4 shrink-0 text-secondary-foreground"
              aria-hidden
            />
            <div className="flex flex-wrap items-center gap-2 text-sm text-secondary-foreground">
              <span>Sending this moves the candidate to</span>
              <ReviewStatusPill status="awaiting_forms" />
              <span>until they submit.</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            size="default"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button size="default" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Sending…' : resend ? 'Resend forms' : 'Send forms'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
