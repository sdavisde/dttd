'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Divider, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { Candidate } from '@/lib/candidates/types'
import { StatusChip } from '@/components/candidates/status-chip'
import { CandidateActions } from './CandidateActions'

interface CandidateDetailDialogProps {
  candidate: Candidate | null
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onSendForms: (id: string) => void
}

export function CandidateDetailDialog({
  candidate,
  isOpen,
  onClose,
  onDelete,
  onApprove,
  onReject,
  onSendForms,
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
        <span>{candidate.name}</span>
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
              <Typography variant='body1'>{candidate.name}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant='body2'
                color='text.secondary'
              >
                Email
              </Typography>
              <Typography variant='body1'>{candidate.email}</Typography>
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
                  {candidate.church_environment}
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
                  {candidate.home_environment}
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
                  {candidate.social_environment}
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
                  {candidate.work_environment}
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
                {candidate.god_evidence}
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
                {candidate.support_plan}
              </Typography>
            </Box>
          </Box>

          {/* Optional Information */}
          {(candidate.prayer_request || candidate.attends_secuela) && (
            <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
              {candidate.prayer_request && (
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
                    {candidate.prayer_request}
                  </Typography>
                </Box>
              )}
              {candidate.attends_secuela && (
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                  >
                    Attends Secuela
                  </Typography>
                  <Typography variant='body1'>{candidate.attends_secuela}</Typography>
                </Box>
              )}
              {!candidate.prayer_request && <Box sx={{ flex: 1 }}></Box>}
              {!candidate.attends_secuela && <Box sx={{ flex: 1 }}></Box>}
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
                <Typography variant='body1'>{candidate.sponsor_name}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Sponsor Email
                </Typography>
                <Typography variant='body1'>{candidate.sponsor_email}</Typography>
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
                <Typography variant='body1'>{candidate.sponsor_phone}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Sponsor Church
                </Typography>
                <Typography variant='body1'>{candidate.sponsor_church}</Typography>
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
                <Typography variant='body1'>{candidate.sponsor_weekend}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Reunion Group
                </Typography>
                <Typography variant='body1'>{candidate.reunion_group}</Typography>
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
                <Typography variant='body1'>{candidate.contact_frequency}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Payment Owner
                </Typography>
                <Typography variant='body1'>{candidate.payment_owner}</Typography>
              </Box>
            </Box>
            {candidate.sponsor_address && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                >
                  Sponsor Address
                </Typography>
                <Typography variant='body1'>{candidate.sponsor_address}</Typography>
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
          onClose={onClose}
        />
      </DialogActions>
    </Dialog>
  )
}
