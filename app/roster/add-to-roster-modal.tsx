'use client'

import { Modal, Paper, Typography } from '@mui/material'

type AddToRosterModalProps = {
  open: boolean
  onClose: () => void
}
export function AddToRosterModal({ open, onClose }: AddToRosterModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <Paper>
        <Typography variant='h6'>Add to Roster</Typography>
      </Paper>
    </Modal>
  )
}
