'use client'

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  candidateName: string | null | undefined
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteConfirmationDialog({
  isOpen,
  candidateName,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete {candidateName}? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color='error'
          variant='contained'
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
