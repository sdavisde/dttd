import { Container, Typography, Box } from '@mui/material'
import { CandidateReviewTable } from './components/CandidateReviewTable'
import { StatusFlow } from './components/StatusFlow'
import { HydratedCandidate } from '@/lib/candidates/types'
import { getAllCandidatesWithDetails } from '@/actions/candidates'
import * as Results from '@/lib/results'

async function getCandidates(): Promise<HydratedCandidate[]> {
  // Get all candidates with their related information
  const candidatesResult = await getAllCandidatesWithDetails()

  if (Results.isErr(candidatesResult)) {
    console.error('Error fetching candidates:', candidatesResult.error)
    return []
  }

  return candidatesResult.data
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
          Review Candidates
        </Typography>
        <CandidateReviewTable candidates={candidates} />
      </Box>
    </Container>
  )
}
