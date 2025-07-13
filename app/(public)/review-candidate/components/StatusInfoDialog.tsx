'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, IconButton, Button } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
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
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth='md'
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Status Information</span>
        <IconButton
          size='small'
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography
          variant='body1'
          sx={{ mb: 3 }}
        >
          Below are all possible candidate statuses and what they mean:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {allStatuses.map((status) => (
            <Box
              key={status}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <StatusChip status={status} />
              <Typography
                variant='body2'
                sx={{ flex: 1 }}
              >
                {statusDescriptions[status]}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
