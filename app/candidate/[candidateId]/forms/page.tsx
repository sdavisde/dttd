import { createClient } from '@/lib/supabase/server'
import { Container, Typography, Box, Paper } from '@mui/material'
import { notFound } from 'next/navigation'
import { logger } from '@/lib/logger'

async function getCandidate(candidateId: string) {
  const supabase = await createClient()

  // First try to find in candidates table
  const { data: candidate, error: candidateError } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single()

  if (candidateError) {
    logger.error('Error fetching candidate:', candidateError)
    throw candidateError
  }

  return candidate
}

export default async function CandidateFormsPage({ params }: { params: Promise<{ candidateId: string }> }) {
  const { candidateId } = await params
  const candidate = await getCandidate(candidateId)

  if (!candidate) {
    logger.error(`Candidate with ID ${candidateId} not found`)
    notFound()
  }

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
          {candidate.name}
        </Typography>
      </Paper>

      <Box>
        <Typography variant='body1'>Forms page for candidate: {candidate.name}</Typography>
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
