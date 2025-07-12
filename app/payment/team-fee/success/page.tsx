import { redirect } from 'next/navigation'
import { Container, Paper, Typography, Button, Link } from '@mui/material'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

type SearchParams = Promise<{
  session_id: string
}>

export default async function TeamFeePaymentSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { session_id } = await searchParams

  if (!session_id) throw new Error('Please provide a valid session_id (`cs_test_...`)')

  const { status, customer_details, metadata } = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent'],
  })

  if (!customer_details?.email) {
    throw new Error('Customer email not found')
  }

  const customerEmail = customer_details.email

  if (status === 'open') {
    return redirect('/')
  }

  if (status === 'complete') {
    // If this is a candidate payment, update the candidate status
    if (metadata?.candidateId) {
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
          <Paper
            elevation={3}
            sx={{ p: 4, my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
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
            <Typography
              variant='body1'
              className='w-fit flex items-center gap-2'
            >
              <span>If you have any questions, please contact the pre-weekend couple or email</span>
              <a href='mailto:admin@dustytrailstresdias.org'>admin@dustytrailstresdias.org</a>
            </Typography>
            <Button
              href='/home'
              variant='contained'
              sx={{ mt: 2 }}
            >
              Return to Home
            </Button>
          </Paper>
        </Container>
      )
    }

    // Default success message for non-candidate payments
    return (
      <Container maxWidth='md'>
        <Paper
          elevation={3}
          sx={{ p: 4, my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Typography
            variant='h4'
            component='h1'
            gutterBottom
          >
            Payment Successful!
          </Typography>
          <Typography variant='body1'>A confirmation email will be sent to {customerEmail}</Typography>
          <Typography
            variant='body1'
            className='w-fit flex items-center gap-1'
          >
            <span>If you have any questions, please email</span>
            <Link href='mailto:admin@dustytrailstresdias.org'>admin@dustytrailstresdias.org</Link>
          </Typography>
          <Button
            href='/home'
            variant='contained'
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Container>
    )
  }

  return null
}
