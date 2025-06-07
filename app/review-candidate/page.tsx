import { Container, Typography, Box } from '@mui/material'
import { CandidateReviewTable } from './components/CandidateReviewTable'
import { StatusFlow } from './components/StatusFlow'
import { createClient } from '@/lib/supabase/server'

async function getCandidates() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('candidates').select(`
      *,
      weekends (
        title
      )
    `)

  if (error) {
    console.error(error)
    return []
  }
  const candidates = data.map((candidate) => ({
    ...candidate,
    weekend: candidate.weekends?.title || 'Unknown',
  }))
  return candidates
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
