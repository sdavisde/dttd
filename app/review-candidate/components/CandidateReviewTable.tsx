'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from '@mui/material'
import { useState } from 'react'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { StatusFlow } from './StatusFlow'
import { CandidateStatus } from '@/lib/candidates/types'

interface Candidate {
  id: string
  name: string | null
  email: string | null
  sponsor_name: string | null
  sponsor_email: string | null
  status: CandidateStatus
  created_at: string
  weekend: string
}

interface CandidateReviewTableProps {
  candidates: Candidate[]
}

export function CandidateReviewTable({ candidates }: CandidateReviewTableProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsDialogOpen(true)
  }

  const handleApprove = async (id: string) => {
    // TODO: Implement approval logic
    console.log('Approving candidate:', id)
  }

  const handleReject = async (id: string) => {
    // TODO: Implement rejection logic
    console.log('Rejecting candidate:', id)
  }

  const getStatusChip = (status: CandidateStatus) => {
    const statusConfig: Record<CandidateStatus, { color: string; label: string }> = {
      sponsored: { color: 'default', label: 'Sponsored' },
      awaiting_forms: { color: 'warning', label: 'Awaiting Forms' },
      pending_approval: { color: 'info', label: 'Pending Approval' },
      awaiting_payment: { color: 'secondary', label: 'Awaiting Payment' },
      confirmed: { color: 'success', label: 'Confirmed' },
      rejected: { color: 'error', label: 'Rejected' },
    }

    const config = statusConfig[status]
    return (
      <Chip
        label={config.label}
        color={config.color as any}
        size='small'
      />
    )
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Candidate Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Sponsor</TableCell>
              <TableCell>Weekend</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>{candidate.sponsor_name}</TableCell>
                <TableCell>{candidate.weekend}</TableCell>
                <TableCell>{new Date(candidate.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusChip(candidate.status)}</TableCell>
                <TableCell>
                  <IconButton
                    size='small'
                    onClick={() => handleViewDetails(candidate)}
                    title='View Details'
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {candidate.status === 'pending_approval' && (
                    <>
                      <IconButton
                        size='small'
                        color='success'
                        onClick={() => handleApprove(candidate.id)}
                        title='Approve'
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => handleReject(candidate.id)}
                        title='Reject'
                      >
                        <CancelIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        {selectedCandidate && (
          <>
            <DialogTitle>Candidate Details</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant='h6'
                  gutterBottom
                >
                  Application Status
                </Typography>
                <StatusFlow currentStatus={selectedCandidate.status} />

                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ mt: 3 }}
                >
                  Basic Information
                </Typography>
                <Typography>
                  <strong>Name:</strong> {selectedCandidate.name}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {selectedCandidate.email}
                </Typography>
                <Typography>
                  <strong>Weekend:</strong> {selectedCandidate.weekend}
                </Typography>

                <Typography
                  variant='h6'
                  sx={{ mt: 3 }}
                  gutterBottom
                >
                  Sponsor Information
                </Typography>
                <Typography>
                  <strong>Name:</strong> {selectedCandidate.sponsor_name}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {selectedCandidate.sponsor_email}
                </Typography>

                {/* TODO: Add more detailed information from the sponsorship form */}
              </Box>
            </DialogContent>
            <DialogActions>
              {selectedCandidate.status === 'pending_approval' && (
                <>
                  <Button
                    color='success'
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleApprove(selectedCandidate.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    color='error'
                    startIcon={<CancelIcon />}
                    onClick={() => handleReject(selectedCandidate.id)}
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  )
}
