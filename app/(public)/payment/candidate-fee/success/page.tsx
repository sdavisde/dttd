import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

type SearchParams = Promise<{
  session_id: string
}>

export default async function CandidateFeePaymentSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { session_id } = await searchParams

  if (!session_id)
    throw new Error('Please provide a valid session_id (`cs_test_...`)')

  const { status, customer_details, metadata } =
    await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'payment_intent'],
    })

  if (!customer_details?.email) {
    throw new Error('Customer email not found')
  }

  const customerEmail = customer_details.email

  if (status !== 'complete') {
    logger.error('Payment not completed')
    return redirect('/')
  }

  if (!metadata?.candidateId) {
    logger.error('Candidate ID not found')
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
    logger.error('Failed to update candidate status:', updateError)
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <h1 className="text-3xl font-bold text-green-600">
            Payment Successful!
          </h1>
          <p className="text-lg">
            Thank you for your payment. Your spot for the Dusty Trails Tres Dias
            weekend has been confirmed.
          </p>
          <div className="pt-4">
            <Button asChild>
              <a href="/home">Return to Home</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
