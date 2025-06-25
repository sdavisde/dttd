import { Container, Typography, Box } from '@mui/material'
import { CandidateReviewTable } from './components/CandidateReviewTable'
import { StatusFlow } from './components/StatusFlow'
import { createClient } from '@/lib/supabase/server'
import { Candidate, CandidateStatus } from '@/lib/candidates/types'

async function getCandidates(): Promise<Candidate[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('candidates').select(`
      *,
      weekends (
        title
      )
    `)

  const { data: sponsorshipRequests, error: sponsorshipRequestsError } = await supabase
    .from('sponsorship_request')
    .select('*')

  if (error) {
    console.error(error)
    return []
  }

  if (sponsorshipRequestsError) {
    console.error(sponsorshipRequestsError)
    return []
  }

  const candidates: Array<Candidate> = data.map((candidate) => ({
    ...candidate,
    weekend: candidate.weekends?.title || 'Unknown',
  }))

  const sponsoredCandidates: Array<Candidate> = sponsorshipRequests.map((sponsorshipRequest) => ({
    id: sponsorshipRequest.id.toString(),
    created_at: sponsorshipRequest.created_at,
    updated_at: sponsorshipRequest.created_at,
    sponsor_name: sponsorshipRequest.sponsor_name,
    sponsor_email: null,
    status: 'sponsored' as CandidateStatus,
    weekends: { title: 'Unknown' },
    name: sponsorshipRequest.candidate_name,
    email: sponsorshipRequest.candidate_email,
    weekend: null,
    // Sponsorship information
    sponsor_phone: sponsorshipRequest.sponsor_phone,
    sponsor_address: sponsorshipRequest.sponsor_address,
    sponsor_church: sponsorshipRequest.sponsor_church,
    sponsor_weekend: sponsorshipRequest.sponsor_weekend,
    reunion_group: sponsorshipRequest.reunion_group,
    contact_frequency: sponsorshipRequest.contact_frequency,
    church_environment: sponsorshipRequest.church_environment,
    home_environment: sponsorshipRequest.home_environment,
    social_environment: sponsorshipRequest.social_environment,
    work_environment: sponsorshipRequest.work_environment,
    god_evidence: sponsorshipRequest.god_evidence,
    support_plan: sponsorshipRequest.support_plan,
    prayer_request: sponsorshipRequest.prayer_request,
    payment_owner: sponsorshipRequest.payment_owner,
    attends_secuela: sponsorshipRequest.attends_secuela,
  }))
  return [...candidates, ...sponsoredCandidates]
}

export default async function ReviewCandidatePage() {
  const candidates = await getCandidates()
  return (
    <Container maxWidth='xl'>
      <Box sx={{ my: 4 }}>
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
        >
          Review Candidate Applications
        </Typography>
        <Typography
          variant='subtitle1'
          color='text.secondary'
          sx={{ mb: 2, mt: 2 }}
        >
          Review and manage candidate sponsorship requests for upcoming weekends.
        </Typography>
        <CandidateReviewTable candidates={candidates} />
      </Box>
    </Container>
  )
}
