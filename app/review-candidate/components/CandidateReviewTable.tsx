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
import { Candidate, CandidateStatus } from '@/lib/candidates/types'
import { StatusChip } from '@/components/candidates/status-chip'

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

  const sendEmail = async (id: string) => {
    // TODO: Implement email sending logic
    console.log('Sending email to candidate:', id)
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Candidate Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Sponsor</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((candidate, index) => (
              <TableRow
                key={candidate.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? 'inherit' : 'rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 'bold' }}>{candidate.name}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>{candidate.sponsor_name}</TableCell>
                <TableCell>{new Date(candidate.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <StatusChip status={candidate.status} />
                </TableCell>
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
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{selectedCandidate.name}</span>
              <StatusChip status={selectedCandidate.status} />
            </DialogTitle>
            <DialogContent>
              <Box>
                <Typography variant='body1'>{selectedCandidate.sponsor_name}</Typography>
                <Typography variant='body1'>{selectedCandidate.sponsor_email}</Typography>
                {/* TODO: Add more detailed information from the sponsorship form */}
              </Box>
            </DialogContent>
            <DialogActions sx={{ padding: 2 }}>
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
              {selectedCandidate.status === 'sponsored' && (
                <Button
                  color='primary'
                  variant='contained'
                  onClick={() => sendEmail(selectedCandidate.id)}
                >
                  Send Candidate Forms
                </Button>
              )}
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  )
}
