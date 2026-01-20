import { Typography } from '@/components/ui/typography'
import { HydratedCandidate } from '@/lib/candidates/types'

interface CandidateAssessmentSectionProps {
  candidate: HydratedCandidate
}

export function CandidateAssessmentSection({
  candidate,
}: CandidateAssessmentSectionProps) {
  const sponsorshipInfo = candidate.candidate_sponsorship_info

  return (
    <section>
      <Typography variant="h3" className="mb-4">
        Candidate Assessment
      </Typography>
      <Typography variant="small" className="text-muted-foreground mb-4 block">
        Environment descriptions provided by sponsor:
      </Typography>

      {/* Environment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Church Environment
          </Typography>
          <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
            {sponsorshipInfo?.church_environment ?? 'Not provided'}
          </Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Home Environment
          </Typography>
          <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
            {sponsorshipInfo?.home_environment ?? 'Not provided'}
          </Typography>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Social Environment
          </Typography>
          <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
            {sponsorshipInfo?.social_environment ?? 'Not provided'}
          </Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Work Environment
          </Typography>
          <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
            {sponsorshipInfo?.work_environment ?? 'Not provided'}
          </Typography>
        </div>
      </div>

      {/* Sponsor's Assessment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Evidence of God&apos;s Leading
          </Typography>
          <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
            {sponsorshipInfo?.god_evidence ?? 'Not provided'}
          </Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Support Plan
          </Typography>
          <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
            {sponsorshipInfo?.support_plan ?? 'Not provided'}
          </Typography>
        </div>
      </div>

      {/* Prayer Request */}
      {sponsorshipInfo?.prayer_request && (
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Prayer Request
          </Typography>
          <Typography variant="p" style={{ whiteSpace: 'pre-wrap' }}>
            {sponsorshipInfo.prayer_request}
          </Typography>
        </div>
      )}
    </section>
  )
}
