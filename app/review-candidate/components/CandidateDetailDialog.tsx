'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Divider, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { HydratedCandidate } from '@/lib/candidates/types'
import { StatusChip } from '@/components/candidates/status-chip'
import { CandidateActions } from './CandidateActions'

interface CandidateDetailDialogProps {
  candidate: HydratedCandidate | null
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onSendForms: (id: string) => void
  onSendPaymentRequest: (id: string) => void
}

export function CandidateDetailDialog({
  candidate,
  isOpen,
  onClose,
  onDelete,
  onApprove,
  onReject,
  onSendForms,
  onSendPaymentRequest,
}: CandidateDetailDialogProps) {
  if (!candidate) return null

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{candidate.candidate_sponsorship_info?.candidate_name}</span>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusChip status={candidate.status} />
          <IconButton
            size='small'
            onClick={onClose}
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
              <Typography variant='body1'>{candidate.candidate_sponsorship_info?.candidate_name}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant='body2'
                color='text.secondary'
              >
                Email
              </Typography>
              <Typography variant='body1'>{candidate.candidate_sponsorship_info?.candidate_email}</Typography>
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
                  {candidate.candidate_sponsorship_info?.church_environment}
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
                  {candidate.candidate_sponsorship_info?.home_environment}
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
                  {candidate.candidate_sponsorship_info?.social_environment}
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
                  {candidate.candidate_sponsorship_info?.work_environment}
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
                {candidate.candidate_sponsorship_info?.god_evidence}
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
                {candidate.candidate_sponsorship_info?.support_plan}
              </Typography>
            </Box>
          </Box>

          {/* Optional Information */}
          {(candidate.candidate_sponsorship_info?.prayer_request ||
            candidate.candidate_sponsorship_info?.attends_secuela) && (
            <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
              {candidate.candidate_sponsorship_info?.prayer_request && (
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
                    {candidate.candidate_sponsorship_info?.prayer_request}
                  </Typography>
                </Box>
              )}
              {candidate.candidate_sponsorship_info?.attends_secuela && (
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                  >
                    Attends Secuela
                  </Typography>
                  <Typography variant='body1'>{candidate.candidate_sponsorship_info?.attends_secuela}</Typography>
                </Box>
              )}
              {!candidate.candidate_sponsorship_info?.prayer_request && <Box sx={{ flex: 1 }}></Box>}
              {!candidate.candidate_sponsorship_info?.attends_secuela && <Box sx={{ flex: 1 }}></Box>}
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
                <Typography variant='body1'>{candidate.candidate_sponsorship_info?.sponsor_name}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Sponsor Email
                </Typography>
                <Typography variant='body1'>{candidate.candidate_sponsorship_info?.sponsor_email}</Typography>
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
                <Typography variant='body1'>{candidate.candidate_sponsorship_info?.sponsor_phone}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Sponsor Church
                </Typography>
                <Typography variant='body1'>{candidate.candidate_sponsorship_info?.sponsor_church}</Typography>
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
                <Typography variant='body1'>{candidate.candidate_sponsorship_info?.sponsor_weekend}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Reunion Group
                </Typography>
                <Typography variant='body1'>{candidate.candidate_sponsorship_info?.reunion_group}</Typography>
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
                <Typography variant='body1'>{candidate.candidate_sponsorship_info?.contact_frequency}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Payment Owner
                </Typography>
                <Typography variant='body1'>{candidate.candidate_sponsorship_info?.payment_owner}</Typography>
              </Box>
            </Box>
            {candidate.candidate_sponsorship_info?.sponsor_address && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Sponsor Address
                </Typography>
                <Typography variant='body1'>{candidate.candidate_sponsorship_info?.sponsor_address}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: 2, justifyContent: 'space-between' }}>
        <CandidateActions
          candidate={candidate}
          onDelete={onDelete}
          onApprove={onApprove}
          onReject={onReject}
          onSendForms={onSendForms}
          onSendPaymentRequest={onSendPaymentRequest}
          onClose={onClose}
        />
      </DialogActions>
    </Dialog>
  )
}
