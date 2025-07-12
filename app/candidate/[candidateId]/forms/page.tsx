import { Container, Typography, Box, Paper } from '@mui/material'
import { notFound } from 'next/navigation'
import { logger } from '@/lib/logger'
import { getHydratedCandidate } from '@/actions/candidates'
import * as Results from '@/lib/results'
import { CandidateForms } from './candidate-forms'

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
          Hello {candidate.candidate_sponsorship_info?.candidate_name}!
        </Typography>

        <Typography>
          You have been sponsored by {candidate.candidate_sponsorship_info?.sponsor_name} to attend Dusty Trails Tres
          Dias.
          <br />
          Please fill out the this form to complete your registration.
        </Typography>
      </Paper>

      <CandidateForms />
    </Container>
  )
}
