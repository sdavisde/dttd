// a submitted page to redurect to when a successful form submission is made

import { getHydratedCandidate } from '@/actions/candidates'
import * as Results from '@/lib/results'
import { logger } from '@/lib/logger'
import { Button, Container, Paper, Typography } from '@mui/material'

export default async function SubmittedPage({ searchParams }: { searchParams: Promise<{ id: string }> }) {
  const { id } = await searchParams

  const candidateResult = await getHydratedCandidate(id)
  if (Results.isErr(candidateResult)) {
    logger.error('Error fetching candidate:', candidateResult.error)
    return <div>Error fetching candidate</div>
  }

  const candidate = candidateResult.data

  if (!candidate) {
    logger.error('Candidate not found')
    return <div>Candidate not found</div>
  }

  return (
    <Container maxWidth='md'>
      <Paper
        elevation={3}
        sx={{ p: 4, my: 4 }}
      >
        <Typography
          variant='h5'
          component='h1'
        >
          Thank you for wanting to sponsor {candidate.candidate_sponsorship_info?.candidate_name}!
        </Typography>
        <Typography variant='body1'>
          The pre-weekend couple will review your request and get back to you soon.
        </Typography>
      </Paper>
      <Button href='/home'>Back to Home</Button>
    </Container>
  )
}
