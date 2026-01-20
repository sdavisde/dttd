import { Typography } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import { HydratedCandidate } from '@/lib/candidates/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'

interface CandidateFormDetailsSectionProps {
  candidate: HydratedCandidate
}

export function CandidateFormDetailsSection({
  candidate,
}: CandidateFormDetailsSectionProps) {
  const candidateInfo = candidate.candidate_info
  const candidateName =
    candidate.candidate_sponsorship_info?.candidate_name ?? 'This candidate'

  // Show message if candidate hasn't completed their forms
  if (!candidateInfo) {
    return (
      <section>
        <Typography variant="h3" className="mb-4">
          Candidate Form Details
        </Typography>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Forms Not Completed</AlertTitle>
          <AlertDescription>
            {candidateName} has not completed their forms yet.
          </AlertDescription>
        </Alert>
      </section>
    )
  }

  return (
    <section>
      <Separator className="my-4" />
      <Typography variant="h3" className="mb-4">
        Candidate Form Details
      </Typography>
      <Typography variant="small" className="text-muted-foreground mb-4 block">
        Information provided by the candidate:
      </Typography>

      {/* Personal Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Full Name
          </Typography>
          <Typography variant="p">
            {candidateInfo.first_name} {candidateInfo.last_name}
          </Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Email
          </Typography>
          <Typography variant="p">{candidateInfo.email}</Typography>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Phone
          </Typography>
          <Typography variant="p">{candidateInfo.phone}</Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Date of Birth
          </Typography>
          <Typography variant="p">
            {candidateInfo.date_of_birth
              ? new Date(candidateInfo.date_of_birth).toLocaleDateString()
              : 'Not provided'}
          </Typography>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Age
          </Typography>
          <Typography variant="p">
            {candidateInfo.age ?? 'Not provided'}
          </Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Shirt Size
          </Typography>
          <Typography variant="p">{candidateInfo.shirt_size}</Typography>
        </div>
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Address
          </Typography>
          <Typography variant="p">
            {candidateInfo.address_line_1}
            {candidateInfo.address_line_2 && (
              <>, {candidateInfo.address_line_2}</>
            )}
            <br />
            {candidateInfo.city}, {candidateInfo.state} {candidateInfo.zip}
          </Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Church
          </Typography>
          <Typography variant="p">
            {candidateInfo.church ?? 'Not provided'}
          </Typography>
        </div>
      </div>

      {/* Marital Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Marital Status
          </Typography>
          <Typography variant="p">
            {candidateInfo.marital_status ?? 'Not provided'}
          </Typography>
        </div>
        {candidateInfo.spouse_name && (
          <div>
            <Typography variant="small" className="text-muted-foreground">
              Spouse Name
            </Typography>
            <Typography variant="p">{candidateInfo.spouse_name}</Typography>
          </div>
        )}
      </div>

      {/* Spouse Weekend Info */}
      {candidateInfo.has_spouse_attended_weekend !== null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Typography variant="small" className="text-muted-foreground">
              Has Spouse Attended Weekend?
            </Typography>
            <Typography variant="p">
              {candidateInfo.has_spouse_attended_weekend ? 'Yes' : 'No'}
            </Typography>
          </div>
          {candidateInfo.spouse_weekend_location && (
            <div>
              <Typography variant="small" className="text-muted-foreground">
                Spouse Weekend Location
              </Typography>
              <Typography variant="p">
                {candidateInfo.spouse_weekend_location}
              </Typography>
            </div>
          )}
        </div>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Has Friends Attending Weekend?
          </Typography>
          <Typography variant="p">
            {candidateInfo.has_friends_attending_weekend === null
              ? 'Not provided'
              : candidateInfo.has_friends_attending_weekend
                ? 'Yes'
                : 'No'}
          </Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Is Christian?
          </Typography>
          <Typography variant="p">
            {candidateInfo.is_christian === null
              ? 'Not provided'
              : candidateInfo.is_christian
                ? 'Yes'
                : 'No'}
          </Typography>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Member of Clergy?
          </Typography>
          <Typography variant="p">
            {candidateInfo.member_of_clergy === null
              ? 'Not provided'
              : candidateInfo.member_of_clergy
                ? 'Yes'
                : 'No'}
          </Typography>
        </div>
      </div>

      {/* Reason for Attending */}
      {candidateInfo.reason_for_attending && (
        <div className="mb-4">
          <Typography variant="small" className="text-muted-foreground">
            Reason for Attending
          </Typography>
          <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
            {candidateInfo.reason_for_attending}
          </Typography>
        </div>
      )}

      {/* Medical Conditions */}
      {candidateInfo.medical_conditions && (
        <div className="mb-4">
          <Typography variant="small" className="text-muted-foreground">
            Medical Conditions
          </Typography>
          <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
            {candidateInfo.medical_conditions}
          </Typography>
        </div>
      )}

      {/* Emergency Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Emergency Contact Name
          </Typography>
          <Typography variant="p">
            {candidateInfo.emergency_contact_name}
          </Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Emergency Contact Phone
          </Typography>
          <Typography variant="p">
            {candidateInfo.emergency_contact_phone}
          </Typography>
        </div>
      </div>
    </section>
  )
}
