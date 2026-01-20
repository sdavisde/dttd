import { Typography } from '@/components/ui/typography'
import { HydratedCandidate } from '@/lib/candidates/types'

interface CandidateInformationSectionProps {
  candidate: HydratedCandidate
}

export function CandidateInformationSection({
  candidate,
}: CandidateInformationSectionProps) {
  const sponsorshipInfo = candidate.candidate_sponsorship_info

  return (
    <section>
      <Typography variant="h3" className="mb-4">
        Candidate Information
      </Typography>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Candidate Name
          </Typography>
          <Typography variant="p">{sponsorshipInfo?.candidate_name}</Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Email
          </Typography>
          <Typography variant="p">
            {sponsorshipInfo?.candidate_email}
          </Typography>
        </div>
      </div>
    </section>
  )
}
