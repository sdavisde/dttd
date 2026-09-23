import Checkout from '@/components/checkout'
import { notFound } from 'next/navigation'
import { logger } from '@/lib/logger'
import { getActiveGroupMemberForUser } from '@/services/weekend-group-member/repository'
import { getLoggedInUser } from '@/services/identity/user'
import { isErr } from '@/lib/results'
import { isNil } from 'lodash'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getUrl } from '@/lib/url'

export default async function TeamFeesPaymentPage() {
  const teamFeePriceId = process.env.TEAM_FEE_PRICE_ID
  if (isNil(teamFeePriceId) || teamFeePriceId === '') {
    logger.error('Missing team fee price id')
    return notFound()
  }

  const userResult = await getLoggedInUser()
  const user = userResult?.data
  if (isErr(userResult) || isNil(user)) {
    logger.error('User not found')
    return notFound()
  }

  const groupMemberResult = await getActiveGroupMemberForUser(user.id)
  if (isErr(groupMemberResult) || isNil(groupMemberResult.data)) {
    logger.error('No active group member found for user')
    return (
      <div className="h-[80vh] w-screen flex items-center justify-center p-4">
        <Alert className="max-w-md text-center">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <AlertTitle className="text-lg font-semibold">
            Registration Issue
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              It doesn&apos;t look like you&apos;re registered for the weekend
              yet.
            </p>
            <p>
              Please contact your Rector to ensure you&apos;re on the roster.
            </p>
            <p className="text-sm mt-4">
              If this issue persists, please contact Sean Davis at 214-799-7708
              or sdavisde@gmail.com for assistance in paying your team fees.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const groupMemberId = groupMemberResult.data.id

  // Build payer name for payment tracking
  const payerName =
    !isNil(user.firstName) && !isNil(user.lastName)
      ? `${user.firstName} ${user.lastName}`
      : (user.email ?? 'Unknown')

  return (
    <div className="payment-page">
      <Checkout
        priceId={teamFeePriceId}
        metadata={{ group_member_id: groupMemberId, payment_owner: payerName }}
        returnUrl={getUrl(
          '/payment/team-fee/success?session_id={CHECKOUT_SESSION_ID}'
        )}
      />
    </div>
  )
}
