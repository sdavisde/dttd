import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { stripe } from '@/lib/stripe'
import { notifyAssistantHeadForTeamPayment } from '@/actions/emails'

type SearchParams = Promise<{
  session_id: string
}>

export default async function TeamFeePaymentSuccessPage({
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

  if (status !== 'complete') {
    return redirect('/')
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <h1 className="text-3xl font-bold text-green-600">
            Payment Successful!
          </h1>
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
