import { Container, Typography, Box, Paper } from '@mui/material'
import { notFound } from 'next/navigation'
import { logger } from '@/lib/logger'
import { getHydratedCandidate } from '@/actions/candidates'
import * as Results from '@/lib/results'

export default async function CandidateFormsPage({ params }: { params: Promise<{ candidateId: string }> }) {
  const { candidateId } = await params
  const candidateResult = await getHydratedCandidate(candidateId)

  if (Results.isErr(candidateResult)) {
    logger.error(`Failed to fetch candidate ${candidateId}:`, candidateResult.error)
    notFound()
  }

  const candidate = candidateResult.data

  return (
    <Container
      maxWidth='lg'
      sx={{ py: 4 }}
    >
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 4 }}
      >
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
        >
          Candidate Forms
        </Typography>
        <Typography
          variant='h6'
          color='text.secondary'
        >
          {candidate.candidate_sponsorship_info?.candidate_name}
        </Typography>
      </Paper>

      <Box>
        <Typography variant='body1'>
          Forms page for candidate: {candidate.candidate_sponsorship_info?.candidate_name}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ mt: 1 }}
        >
          Candidate ID: {candidate.id}
        </Typography>
      </Box>
    </Container>
  )
}
