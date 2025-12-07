'use client'

import { Button } from '@/components/ui/button'

interface CandidateActionsProps {
  onClose: () => void
}

export function CandidateActions({
  onClose,
}: CandidateActionsProps) {
  return (
    <div className="w-full flex items-center justify-between gap-1">
      <div className="flex gap-1 w-full justify-between">
        <Button onClick={onClose} className="flex-1 max-w-40">
          Close
        </Button>
      </div>
    </div>
  )
}
