'use client'

import { Button, Box } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import DeleteIcon from '@mui/icons-material/Delete'
import { Candidate } from '@/lib/candidates/types'

interface CandidateActionsProps {
  candidate: Candidate
  onDelete: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onSendForms: (id: string) => void
  onClose: () => void
}

export function CandidateActions({
  candidate,
  onDelete,
  onApprove,
  onReject,
  onSendForms,
  onClose,
}: CandidateActionsProps) {
  return (
    <>
      <Button
        color='error'
        startIcon={<DeleteIcon />}
        onClick={onDelete}
      >
        Delete
      </Button>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {candidate.status === 'pending_approval' && (
          <>
            <Button
              color='success'
              startIcon={<CheckCircleIcon />}
              onClick={() => onApprove(candidate.id)}
            >
              Approve
            </Button>
            <Button
              color='error'
              startIcon={<CancelIcon />}
              onClick={() => onReject(candidate.id)}
            >
              Reject
            </Button>
          </>
        )}
        {candidate.status === 'sponsored' && (
          <Button
            color='primary'
            variant='contained'
            onClick={() => onSendForms(candidate.id)}
          >
            Send Candidate Forms
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </Box>
    </>
  )
}
