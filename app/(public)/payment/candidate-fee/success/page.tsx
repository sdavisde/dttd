import { redirect } from 'next/navigation'
import { Container, Typography, Button, Stack } from '@mui/material'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<{
  session_id: string
}>

export default async function CandidateFeePaymentSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { session_id } = await searchParams

  if (!session_id) throw new Error('Please provide a valid session_id (`cs_test_...`)')

  const { status, customer_details, metadata } = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent'],
  })

  if (!customer_details?.email) {
    throw new Error('Customer email not found')
  }

  const customerEmail = customer_details.email

  if (status !== 'complete') {
    return redirect('/')
  }

  if (!metadata?.candidateId) {
    return redirect('/')
  }

  // If this is a candidate payment, update the candidate status
  const supabase = await createClient()

  // Update candidate status to confirmed
  const { error: updateError } = await supabase
    .from('candidates')
    .update({ status: 'confirmed' })
    .eq('id', metadata.candidateId)

  if (updateError) {
    console.error('Failed to update candidate status:', updateError)
  }

  return (
    <Container maxWidth='md'>
      <Stack
        spacing={2}
        sx={{ p: 4, my: 4, textAlign: 'center' }}
      >
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
        >
          Payment Successful!
        </Typography>
        <Typography variant='body1'>
          Thank you for your payment. Your spot for the Dusty Trails Tres Dias weekend has been confirmed.
        </Typography>
        <Typography variant='body1'>
          A confirmation email will be sent to {customerEmail} with additional details about the weekend.
        </Typography>
        <Button
          href='/home'
          variant='contained'
          sx={{ mt: 2 }}
        >
          Return to Home
        </Button>
      </Stack>
    </Container>
  )
}
