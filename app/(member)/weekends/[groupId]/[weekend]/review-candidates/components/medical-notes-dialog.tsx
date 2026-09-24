'use client'

import { isNil } from 'lodash'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type MedicalNotesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateName: string
  /** Only ever populated for viewers with medical access. */
  notes: string | null | undefined
}

/** Shows what the candidate wrote under medical conditions on their forms. */
export function MedicalNotesDialog({
  open,
  onOpenChange,
  candidateName,
  notes,
}: MedicalNotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-semibold tracking-tight">
            Medical history
          </DialogTitle>
          <DialogDescription>
            What {candidateName} told us on their candidate forms.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {isNil(notes) || notes.trim() === ''
            ? 'No medical notes provided.'
            : notes}
        </p>
      </DialogContent>
    </Dialog>
  )
}
