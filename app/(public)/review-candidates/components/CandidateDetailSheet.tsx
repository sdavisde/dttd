import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { HydratedCandidate } from '@/lib/candidates/types'
import { StatusChip } from '@/components/candidates/status-chip'
import { CandidateActions } from './CandidateActions'
import { PaymentOwnerForm } from './PaymentOwnerForm'

interface CandidateDetailSheetProps {
  candidate: HydratedCandidate | null
  isOpen: boolean
  onClose: () => void
  onDataChange?: () => void
}

export function CandidateDetailSheet({
  candidate,
  isOpen,
  onClose,
  onDataChange,
}: CandidateDetailSheetProps) {
  if (!candidate) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span>{candidate.candidate_sponsorship_info?.candidate_name}</span>
            <StatusChip status={candidate.status} />
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-6 px-4 overflow-y-auto">
          {/* Candidate Basic Information */}
          <Typography variant="h6" className="mb-2">
            Candidate Information
          </Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div>
              <Typography variant="small" className="text-muted-foreground">
                Candidate Name
              </Typography>
              <Typography variant="p">
                {candidate.candidate_sponsorship_info?.candidate_name}
              </Typography>
            </div>
            <div>
              <Typography variant="small" className="text-muted-foreground">
                Email
              </Typography>
              <Typography variant="p">
                {candidate.candidate_sponsorship_info?.candidate_email}
              </Typography>
            </div>
          </div>

          {/* Weekend Assignment */}
          {/*<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div>
              <Typography variant="small" className="text-muted-foreground">
                Weekend Assignment
              </Typography>
              <Typography variant="p">
                {candidate.weekends?.type === 'MENS' ? "Men's Weekend" :
                 candidate.weekends?.type === 'WOMENS' ? "Women's Weekend" :
                 'Not yet assigned'}
              </Typography>
            </div>
            <div>
              <Typography variant="small" className="text-muted-foreground">
                Weekend Title
              </Typography>
              <Typography variant="p">
                {candidate.weekends?.title ?? 'N/A'}
              </Typography>
            </div>
          </div>*/}

          {/* Candidate Assessment (from Sponsor) */}
          <Typography variant="h6" className="mb-2">
            Candidate Assessment
          </Typography>
          <Typography variant="small" className="text-muted-foreground mb-2">
            Environment descriptions provided by sponsor:
          </Typography>
          <div className="mb-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <Typography variant="small" className="text-muted-foreground">
                  Church Environment
                </Typography>
                <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
                  {candidate.candidate_sponsorship_info?.church_environment}
                </Typography>
              </div>
              <div>
                <Typography variant="small" className="text-muted-foreground">
                  Home Environment
                </Typography>
                <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
                  {candidate.candidate_sponsorship_info?.home_environment}
                </Typography>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Typography variant="small" className="text-muted-foreground">
                  Social Environment
                </Typography>
                <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
                  {candidate.candidate_sponsorship_info?.social_environment}
                </Typography>
              </div>
              <div>
                <Typography variant="small" className="text-muted-foreground">
                  Work Environment
                </Typography>
                <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
                  {candidate.candidate_sponsorship_info?.work_environment}
                </Typography>
              </div>
            </div>
          </div>

          {/* Sponsor's Assessment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div>
              <Typography variant="small" className="text-muted-foreground">
                Evidence of God&apos;s Leading
              </Typography>
              <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
                {candidate.candidate_sponsorship_info?.god_evidence}
              </Typography>
            </div>
            <div>
              <Typography variant="small" className="text-muted-foreground">
                Support Plan
              </Typography>
              <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
                {candidate.candidate_sponsorship_info?.support_plan}
              </Typography>
            </div>
          </div>

          {/* Prayer Request (if provided) */}
          {candidate.candidate_sponsorship_info?.prayer_request && (
            <div className="mb-3">
              <Typography variant="small" className="text-muted-foreground">
                Prayer Request
              </Typography>
              <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
                {candidate.candidate_sponsorship_info?.prayer_request}
              </Typography>
            </div>
          )}

          {/* Candidate Form Data (if submitted) */}
          {candidate.candidate_info && (
            <>
              <Separator className="my-2" />
              <Typography variant="h6" className="mb-2">
                Candidate Form Details
              </Typography>
              <Typography
                variant="small"
                className="text-muted-foreground mb-2"
              >
                Information provided by the candidate:
              </Typography>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <Typography variant="small" className="text-muted-foreground">
                    Full Name
                  </Typography>
                  <Typography variant="p">
                    {candidate.candidate_info.first_name}{' '}
                    {candidate.candidate_info.last_name}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-muted-foreground">
                    Email
                  </Typography>
                  <Typography variant="p">
                    {candidate.candidate_info.email}
                  </Typography>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <Typography variant="small" className="text-muted-foreground">
                    Phone
                  </Typography>
                  <Typography variant="p">
                    {candidate.candidate_info.phone}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-muted-foreground">
                    Age
                  </Typography>
                  <Typography variant="p">
                    {candidate.candidate_info.age ?? 'Not provided'}
                  </Typography>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <Typography variant="small" className="text-muted-foreground">
                    Address
                  </Typography>
                  <Typography variant="p">
                    {candidate.candidate_info.address_line_1}
                    {candidate.candidate_info.address_line_2 && (
                      <>, {candidate.candidate_info.address_line_2}</>
                    )}
                    <br />
                    {candidate.candidate_info.city},{' '}
                    {candidate.candidate_info.state}{' '}
                    {candidate.candidate_info.zip}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-muted-foreground">
                    Emergency Contact
                  </Typography>
                  <Typography variant="p">
                    {candidate.candidate_info.emergency_contact_name}
                    <br />
                    {candidate.candidate_info.emergency_contact_phone}
                  </Typography>
                </div>
              </div>
            </>
          )}

          <Separator className="my-2" />

          {/* Sponsor Information */}
          <Typography variant="h6" className="mb-2">
            Sponsor Information
          </Typography>
          <div className="mb-3">
            {/* Basic Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <Typography variant="small" className="text-muted-foreground">
                  Sponsor Name
                </Typography>
                <Typography variant="p">
                  {candidate.candidate_sponsorship_info?.sponsor_name}
                </Typography>
              </div>
              <div>
                <Typography variant="small" className="text-muted-foreground">
                  Sponsor Email
                </Typography>
                <Typography variant="p">
                  {candidate.candidate_sponsorship_info?.sponsor_email}
                </Typography>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <Typography variant="small" className="text-muted-foreground">
                  Sponsor Phone
                </Typography>
                <Typography variant="p">
                  {candidate.candidate_sponsorship_info?.sponsor_phone}
                </Typography>
              </div>
              <div>
                <Typography variant="small" className="text-muted-foreground">
                  Sponsor Church
                </Typography>
                <Typography variant="p">
                  {candidate.candidate_sponsorship_info?.sponsor_church}
                </Typography>
              </div>
            </div>

            {/* Address (if provided) */}
            {candidate.candidate_sponsorship_info?.sponsor_address && (
              <div className="mb-2">
                <Typography variant="small" className="text-muted-foreground">
                  Sponsor Address
                </Typography>
                <Typography variant="p">
                  {candidate.candidate_sponsorship_info?.sponsor_address}
                </Typography>
              </div>
            )}

            {/* Sponsor Background */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <Typography variant="small" className="text-muted-foreground">
                  Sponsor Weekend Attended
                </Typography>
                <Typography variant="p">
                  {candidate.candidate_sponsorship_info?.sponsor_weekend}
                </Typography>
              </div>
              <div>
                <Typography variant="small" className="text-muted-foreground">
                  Reunion Group
                </Typography>
                <Typography variant="p">
                  {candidate.candidate_sponsorship_info?.reunion_group}
                </Typography>
              </div>
            </div>

            {/* Sponsor Involvement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <Typography variant="small" className="text-muted-foreground">
                  Attends Secuela
                </Typography>
                <Typography variant="p">
                  {candidate.candidate_sponsorship_info?.attends_secuela ===
                  'yes'
                    ? 'Yes'
                    : candidate.candidate_sponsorship_info?.attends_secuela ===
                        'no'
                      ? 'No'
                      : candidate.candidate_sponsorship_info?.attends_secuela ||
                        'Not specified'}
                </Typography>
              </div>
              <div>
                <Typography variant="small" className="text-muted-foreground">
                  Contact Frequency with Candidate
                </Typography>
                <Typography variant="p">
                  {candidate.candidate_sponsorship_info?.contact_frequency}
                </Typography>
              </div>
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <Typography
                  variant="small"
                  className="text-muted-foreground mb-2 block"
                >
                  Payment Owner
                </Typography>
                <PaymentOwnerForm
                  candidateId={candidate.id}
                  initialPaymentOwner={
                    candidate.candidate_sponsorship_info?.payment_owner
                  }
                  onUpdate={onDataChange}
                />
              </div>
            </div>
          </div>
        </div>

        <SheetFooter>
          <CandidateActions onClose={onClose} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
