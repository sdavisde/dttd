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
  Divider,
} from '@mui/material'
import { useState } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import CloseIcon from '@mui/icons-material/Close'
import { Candidate } from '@/lib/candidates/types'
import { StatusChip } from '@/components/candidates/status-chip'
import { logger } from '@/lib/logger'

interface CandidateReviewTableProps {
  candidates: Candidate[]
}

export function CandidateReviewTable({ candidates }: CandidateReviewTableProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleRowClick = (candidate: Candidate) => {
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
    logger.info('Not implmeneted yet')
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
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((candidate, index) => (
              <TableRow
                key={candidate.id}
                onClick={() => handleRowClick(candidate)}
                sx={{
                  backgroundColor: index % 2 === 0 ? 'inherit' : 'rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    cursor: 'pointer',
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth='lg'
        fullWidth
      >
        {selectedCandidate && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{selectedCandidate.name}</span>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StatusChip status={selectedCandidate.status} />
                <IconButton
                  size='small'
                  onClick={() => setIsDialogOpen(false)}
                  sx={{ ml: 1 }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                {/* Candidate Information */}
                <Typography
                  variant='h6'
                  gutterBottom
                >
                  Candidate Information
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      Candidate Name
                    </Typography>
                    <Typography variant='body1'>{selectedCandidate.name}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      Email
                    </Typography>
                    <Typography variant='body1'>{selectedCandidate.email}</Typography>
                  </Box>
                </Box>

                {/* Environment Descriptions */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Church Environment
                      </Typography>
                      <Typography
                        variant='body1'
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {selectedCandidate.church_environment}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Home Environment
                      </Typography>
                      <Typography
                        variant='body1'
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {selectedCandidate.home_environment}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 4 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Social Environment
                      </Typography>
                      <Typography
                        variant='body1'
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {selectedCandidate.social_environment}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Work Environment
                      </Typography>
                      <Typography
                        variant='body1'
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {selectedCandidate.work_environment}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Additional Information */}
                <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      Evidence of God's Leading
                    </Typography>
                    <Typography
                      variant='body1'
                      sx={{ whiteSpace: 'pre-wrap' }}
                    >
                      {selectedCandidate.god_evidence}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      Support Plan
                    </Typography>
                    <Typography
                      variant='body1'
                      sx={{ whiteSpace: 'pre-wrap' }}
                    >
                      {selectedCandidate.support_plan}
                    </Typography>
                  </Box>
                </Box>

                {/* Optional Information */}
                {(selectedCandidate.prayer_request || selectedCandidate.attends_secuela) && (
                  <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                    {selectedCandidate.prayer_request && (
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                        >
                          Prayer Request
                        </Typography>
                        <Typography
                          variant='body1'
                          sx={{ whiteSpace: 'pre-wrap' }}
                        >
                          {selectedCandidate.prayer_request}
                        </Typography>
                      </Box>
                    )}
                    {selectedCandidate.attends_secuela && (
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                        >
                          Attends Secuela
                        </Typography>
                        <Typography variant='body1'>{selectedCandidate.attends_secuela}</Typography>
                      </Box>
                    )}
                    {!selectedCandidate.prayer_request && <Box sx={{ flex: 1 }}></Box>}
                    {!selectedCandidate.attends_secuela && <Box sx={{ flex: 1 }}></Box>}
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Sponsor Information */}
                <Typography
                  variant='h6'
                  gutterBottom
                >
                  Sponsor Information
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Sponsor Name
                      </Typography>
                      <Typography variant='body1'>{selectedCandidate.sponsor_name}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Sponsor Email
                      </Typography>
                      <Typography variant='body1'>{selectedCandidate.sponsor_email}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Sponsor Phone
                      </Typography>
                      <Typography variant='body1'>{selectedCandidate.sponsor_phone}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Sponsor Church
                      </Typography>
                      <Typography variant='body1'>{selectedCandidate.sponsor_church}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Sponsor Weekend
                      </Typography>
                      <Typography variant='body1'>{selectedCandidate.sponsor_weekend}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Reunion Group
                      </Typography>
                      <Typography variant='body1'>{selectedCandidate.reunion_group}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Contact Frequency
                      </Typography>
                      <Typography variant='body1'>{selectedCandidate.contact_frequency}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Payment Owner
                      </Typography>
                      <Typography variant='body1'>{selectedCandidate.payment_owner}</Typography>
                    </Box>
                  </Box>
                  {selectedCandidate.sponsor_address && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Sponsor Address
                      </Typography>
                      <Typography variant='body1'>{selectedCandidate.sponsor_address}</Typography>
                    </Box>
                  )}
                </Box>
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
