// a submitted page to redurect to when a successful form submission is made

import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { Button, Container, Paper, Typography } from '@mui/material'

export default async function SubmittedPage({ searchParams }: { searchParams: Promise<{ id: string }> }) {
  const { id } = await searchParams

  const supabase = await createClient()
  const { data: sponsorshipRequest, error: sponsorshipRequestError } = await supabase
    .from('sponsorship_request')
    .select('*')
    .eq('id', Number(id))
    .single()

  if (sponsorshipRequestError) {
    logger.error('Error fetching sponsorship request:', sponsorshipRequestError)
    return <div>Error fetching sponsorship request</div>
  }

  if (!sponsorshipRequest) {
    logger.error('Sponsorship request not found')
    return <div>Sponsorship request not found</div>
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
          Thank you for wanting to sponsor {sponsorshipRequest.candidate_name}!
        </Typography>
        <Typography variant='body1'>
          The pre-weekend couple will review your request and get back to you soon.
        </Typography>
      </Paper>
      <Button href='/home'>Back to Home</Button>
    </Container>
  )
}
