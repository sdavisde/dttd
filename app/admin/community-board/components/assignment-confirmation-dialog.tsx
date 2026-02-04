'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatMemberName } from '@/lib/formatting/member-utils'
import type { BoardMember } from '@/services/community/board'

type AssignmentConfirmationDialogProps = {
  open: boolean
  pendingMember: BoardMember | null
  currentHolders: BoardMember[]
  isSaving: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function AssignmentConfirmationDialog({
  open,
  pendingMember,
  currentHolders,
  isSaving,
  onCancel,
  onConfirm,
}: AssignmentConfirmationDialogProps) {
  const holderNames = currentHolders
    .map((holder) => formatMemberName(holder))
    .filter(Boolean)
    .join(', ')

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel()
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm assignment</DialogTitle>
          <DialogDescription>
            This will update role assignments for the community board.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          {currentHolders.length > 0 && (
            <div>
              <span className="text-foreground font-medium">
                Replacing current holder(s):
              </span>{' '}
              {holderNames || 'Unknown user'}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isSaving}>
            {isSaving ? 'Assigning...' : 'Confirm Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
