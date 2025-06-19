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
    phone: sponsorshipRequest.sponsor_phone,
    address: sponsorshipRequest.sponsor_address,
    church: sponsorshipRequest.sponsor_church,
    weekend_attended: sponsorshipRequest.sponsor_weekend,
    reunion_group: sponsorshipRequest.reunion_group,
    weekend: null,
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
        <StatusFlow />
        <CandidateReviewTable candidates={candidates} />
      </Box>
    </Container>
  )
}
