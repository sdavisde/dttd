import { Typography } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import { HydratedCandidate } from '@/lib/candidates/types'

interface SponsorInformationSectionProps {
  candidate: HydratedCandidate
}

export function SponsorInformationSection({
  candidate,
}: SponsorInformationSectionProps) {
  const sponsorshipInfo = candidate.candidate_sponsorship_info

  return (
    <section>
      <Separator className="my-4" />
      <Typography variant="h3" className="mb-4">
        Sponsor Information
      </Typography>

      {/* Basic Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Sponsor Name
          </Typography>
          <Typography variant="p">
            {sponsorshipInfo?.sponsor_name ?? 'Not provided'}
          </Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Sponsor Email
          </Typography>
          <Typography variant="p">
            {sponsorshipInfo?.sponsor_email ?? 'Not provided'}
          </Typography>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Sponsor Phone
          </Typography>
          <Typography variant="p">
            {sponsorshipInfo?.sponsor_phone ?? 'Not provided'}
          </Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Sponsor Church
          </Typography>
          <Typography variant="p">
            {sponsorshipInfo?.sponsor_church ?? 'Not provided'}
          </Typography>
        </div>
      </div>

      {/* Address */}
      {sponsorshipInfo?.sponsor_address && (
        <div className="mb-4">
          <Typography variant="small" className="text-muted-foreground">
            Sponsor Address
          </Typography>
          <Typography variant="p">{sponsorshipInfo.sponsor_address}</Typography>
        </div>
      )}

      {/* Sponsor Background */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Sponsor Weekend Attended
          </Typography>
          <Typography variant="p">
            {sponsorshipInfo?.sponsor_weekend ?? 'Not provided'}
          </Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Reunion Group
          </Typography>
          <Typography variant="p">
            {sponsorshipInfo?.reunion_group ?? 'Not provided'}
          </Typography>
        </div>
      </div>

      {/* Sponsor Involvement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Attends Secuela
          </Typography>
          <Typography variant="p">
            {sponsorshipInfo?.attends_secuela === 'yes'
              ? 'Yes'
              : sponsorshipInfo?.attends_secuela === 'no'
                ? 'No'
                : (sponsorshipInfo?.attends_secuela ?? 'Not specified')}
          </Typography>
        </div>
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Contact Frequency with Candidate
          </Typography>
          <Typography variant="p">
            {sponsorshipInfo?.contact_frequency ?? 'Not provided'}
          </Typography>
        </div>
      </div>

      {/* Payment Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Typography variant="small" className="text-muted-foreground">
            Payment Owner
          </Typography>
          <Typography variant="p">
            {sponsorshipInfo?.payment_owner === 'sponsor'
              ? 'Sponsor'
              : sponsorshipInfo?.payment_owner === 'candidate'
                ? 'Candidate'
                : 'Not specified'}
          </Typography>
        </div>
      </div>
    </section>
  )
}
