import { redirect } from 'next/navigation'
import { Container, Typography, Button, Stack } from '@mui/material'

import { stripe } from '@/lib/stripe'

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

  if (status !== 'complete') {
    return redirect('/')
  }

  if (!metadata?.weekendId) {
    return redirect('/')
  }

  return (
    <Container maxWidth='md'>
      <Stack
        spacing={2}
        sx={{ p: 4, my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
          align='center'
        >
          Payment Successful!
        </Typography>
        <Typography
          variant='body1'
          align='center'
          gutterBottom
        >
          A confirmation email will be sent to {customerEmail}
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
