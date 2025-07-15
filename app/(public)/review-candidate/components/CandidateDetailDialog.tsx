'use client'

import { Dialog, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { XIcon } from 'lucide-react'
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
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogTitle className='flex items-center gap-2'>
          <span>{candidate.candidate_sponsorship_info?.candidate_name}</span>
          <StatusChip status={candidate.status} />
        </DialogTitle>
        <div className='mt-2'>
          {/* Candidate Information */}
          <Typography
            variant='h6'
            className='mb-2'
          >
            Candidate Information
          </Typography>
          <div className='flex gap-4 mb-3'>
            <div className='flex-1'>
              <Typography
                variant='small'
                className='text-muted-foreground'
              >
                Candidate Name
              </Typography>
              <Typography variant='p'>{candidate.candidate_sponsorship_info?.candidate_name}</Typography>
            </div>
            <div className='flex-1'>
              <Typography
                variant='small'
                className='text-muted-foreground'
              >
                Email
              </Typography>
              <Typography variant='p'>{candidate.candidate_sponsorship_info?.candidate_email}</Typography>
            </div>
          </div>

          {/* Environment Descriptions */}
          <div className='mb-3'>
            <div className='flex gap-4 mb-2'>
              <div className='flex-1'>
                <Typography
                  variant='small'
                  className='text-muted-foreground'
                >
                  Church Environment
                </Typography>
                <Typography
                  variant='p'
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {candidate.candidate_sponsorship_info?.church_environment}
                </Typography>
              </div>
              <div className='flex-1'>
                <Typography
                  variant='small'
                  className='text-muted-foreground'
                >
                  Home Environment
                </Typography>
                <Typography
                  variant='p'
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {candidate.candidate_sponsorship_info?.home_environment}
                </Typography>
              </div>
            </div>
            <div className='flex gap-4'>
              <div className='flex-1'>
                <Typography
                  variant='small'
                  className='text-muted-foreground'
                >
                  Social Environment
                </Typography>
                <Typography
                  variant='p'
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {candidate.candidate_sponsorship_info?.social_environment}
                </Typography>
              </div>
              <div className='flex-1'>
                <Typography
                  variant='small'
                  className='text-muted-foreground'
                >
                  Work Environment
                </Typography>
                <Typography
                  variant='p'
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {candidate.candidate_sponsorship_info?.work_environment}
                </Typography>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className='flex gap-4 mb-3'>
            <div className='flex-1'>
              <Typography
                variant='small'
                className='text-muted-foreground'
              >
                Evidence of God&apos;s Leading
              </Typography>
              <Typography
                variant='p'
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {candidate.candidate_sponsorship_info?.god_evidence}
              </Typography>
            </div>
            <div className='flex-1'>
              <Typography
                variant='small'
                className='text-muted-foreground'
              >
                Support Plan
              </Typography>
              <Typography
                variant='p'
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {candidate.candidate_sponsorship_info?.support_plan}
              </Typography>
            </div>
          </div>

          {/* Optional Information */}
          {(candidate.candidate_sponsorship_info?.prayer_request ||
            candidate.candidate_sponsorship_info?.attends_secuela) && (
            <div className='flex gap-4 mb-3'>
              {candidate.candidate_sponsorship_info?.prayer_request && (
                <div className='flex-1'>
                  <Typography
                    variant='small'
                    className='text-muted-foreground'
                  >
                    Prayer Request
                  </Typography>
                  <Typography
                    variant='p'
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {candidate.candidate_sponsorship_info?.prayer_request}
                  </Typography>
                </div>
              )}
              {candidate.candidate_sponsorship_info?.attends_secuela && (
                <div className='flex-1'>
                  <Typography
                    variant='small'
                    className='text-muted-foreground'
                  >
                    Attends Secuela
                  </Typography>
                  <Typography variant='p'>{candidate.candidate_sponsorship_info?.attends_secuela}</Typography>
                </div>
              )}
              {!candidate.candidate_sponsorship_info?.prayer_request && <div className='flex-1'></div>}
              {!candidate.candidate_sponsorship_info?.attends_secuela && <div className='flex-1'></div>}
            </div>
          )}

          <Separator className='my-2' />

          {/* Sponsor Information */}
          <Typography
            variant='h6'
            className='mb-2'
          >
            Sponsor Information
          </Typography>
          <div className='mb-3'>
            <div className='flex gap-4 mb-2'>
              <div className='flex-1'>
                <Typography
                  variant='small'
                  className='text-muted-foreground'
                >
                  Sponsor Name
                </Typography>
                <Typography variant='p'>{candidate.candidate_sponsorship_info?.sponsor_name}</Typography>
              </div>
              <div className='flex-1'>
                <Typography
                  variant='small'
                  className='text-muted-foreground'
                >
                  Sponsor Email
                </Typography>
                <Typography variant='p'>{candidate.candidate_sponsorship_info?.sponsor_email}</Typography>
              </div>
            </div>
            <div className='flex gap-4 mb-2'>
              <div className='flex-1'>
                <Typography
                  variant='small'
                  className='text-muted-foreground'
                >
                  Sponsor Phone
                </Typography>
                <Typography variant='p'>{candidate.candidate_sponsorship_info?.sponsor_phone}</Typography>
              </div>
              <div className='flex-1'>
                <Typography
                  variant='small'
                  className='text-muted-foreground'
                >
                  Sponsor Church
                </Typography>
                <Typography variant='p'>{candidate.candidate_sponsorship_info?.sponsor_church}</Typography>
              </div>
            </div>
            <div className='flex gap-4 mb-2'>
              <div className='flex-1'>
                <Typography
                  variant='small'
                  className='text-muted-foreground'
                >
                  Sponsor Weekend
                </Typography>
                <Typography variant='p'>{candidate.candidate_sponsorship_info?.sponsor_weekend}</Typography>
              </div>
              <div className='flex-1'>
                <Typography
                  variant='small'
                  className='text-muted-foreground'
                >
                  Reunion Group
                </Typography>
                <Typography variant='p'>{candidate.candidate_sponsorship_info?.reunion_group}</Typography>
              </div>
            </div>
            <div className='flex gap-4 mb-2'>
              <div className='flex-1'>
                <Typography
                  variant='small'
                  className='text-muted-foreground'
                >
                  Contact Frequency
                </Typography>
                <Typography variant='p'>{candidate.candidate_sponsorship_info?.contact_frequency}</Typography>
              </div>
              <div className='flex-1'>
                <Typography
                  variant='small'
                  className='text-muted-foreground'
                >
                  Payment Owner
                </Typography>
                <Typography variant='p'>{candidate.candidate_sponsorship_info?.payment_owner}</Typography>
              </div>
            </div>
            {candidate.candidate_sponsorship_info?.sponsor_address && (
              <div className='mb-2'>
                <Typography
                  variant='small'
                  className='text-muted-foreground'
                >
                  Sponsor Address
                </Typography>
                <Typography variant='p'>{candidate.candidate_sponsorship_info?.sponsor_address}</Typography>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <CandidateActions
            candidate={candidate}
            onDelete={onDelete}
            onApprove={onApprove}
            onReject={onReject}
            onSendForms={onSendForms}
            onSendPaymentRequest={onSendPaymentRequest}
            onClose={onClose}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
