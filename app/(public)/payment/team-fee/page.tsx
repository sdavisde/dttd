import Checkout from '@/components/checkout'
import { notFound } from 'next/navigation'
import { logger } from '@/lib/logger'
import { getUrl } from '@/lib/url'
import { getWeekendRosterRecord } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { User } from '@/lib/users/types'
import { getValidatedUser } from '@/lib/security'

interface TeamFeesPaymentPageProps {
  searchParams: Promise<{
    weekend_id: string
  }>
}

export default async function TeamFeesPaymentPage({ searchParams }: TeamFeesPaymentPageProps) {
  const teamFeePriceId = process.env.TEAM_FEE_PRICE_ID
  if (!teamFeePriceId) {
    logger.error('Missing team fee price id')
    return notFound()
  }

  const weekend_id = (await searchParams).weekend_id

  if (!weekend_id) {
    logger.error('Missing weekend id query parameter')
    return notFound()
  }

  let user: User

  try {
    user = await getValidatedUser()
  } catch (e: unknown) {
    logger.error(e)
    return notFound()
  }

  const weekendRosterRecord = await getWeekendRosterRecord(user.id, weekend_id)
  if (isErr(weekendRosterRecord)) {
    logger.error('Error fetching weekend roster record', weekendRosterRecord.error)
    return (
      <div className='h-[80vh] w-screen flex items-center justify-center p-4'>
        <Alert className="max-w-md text-center">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <AlertTitle className="text-lg font-semibold">Registration Issue</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>It doesn't look like you're registered for the weekend yet.</p>
            <p>Please contact your Rector to ensure you're on the roster.</p>
            <p className="text-sm mt-4">
              If this issue persists, please contact Sean Davis at 214-799-7708 or sdavisde@gmail.com for assistance in paying your team fees.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className='payment-page'>
      <Checkout
        priceId={teamFeePriceId}
        metadata={{ weekend_id }}
        returnUrl={getUrl('/payment/team-fee/success?session_id={CHECKOUT_SESSION_ID}')}
      />
    </div>
  )
}
