import Checkout from '@/components/checkout'
import { notFound } from 'next/navigation'
import { getCheckoutQuote } from '@/services/payment/payment-service'
import {
  CHECKOUT_REFUSAL_MESSAGES,
  type CheckoutTarget,
} from '@/lib/payments/checkout-price'
import { formatFee } from '@/lib/payments/group-fees'
import { logger } from '@/lib/logger'
import { getActiveGroupMemberForUser } from '@/services/weekend-group-member/repository'
import { getLoggedInUser } from '@/services/identity/user'
import { isErr } from '@/lib/results'
import { isNil } from 'lodash'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getUrl } from '@/lib/url'
import { PageContent } from '@/components/member/page-content'
import { MemberBreadcrumbs } from '@/components/member/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'

export default async function TeamFeesPaymentPage() {
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
      <PageContent className="flex min-h-[60vh] items-center justify-center">
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
      </PageContent>
    )
  }

  const target: CheckoutTarget = {
    kind: 'team',
    groupMemberId: groupMemberResult.data.id,
  }

  // The price comes from the member's weekend group, worked out on the server.
  const quoteResult = await getCheckoutQuote(target)
  if (isErr(quoteResult)) {
    logger.error({ error: quoteResult.error }, 'Team fee quote failed')
    return notFound()
  }
  const { price } = quoteResult.data
  const description = isErr(price)
    ? 'Your team fee for the upcoming weekend.'
    : price.data.coveredSoFar > 0
      ? `${formatFee(price.data.amountDue)} left of your ${formatFee(price.data.fee)} team fee, plus ${formatFee(price.data.onlineSurcharge)} card processing.`
      : `Your ${formatFee(price.data.fee)} team fee, plus ${formatFee(price.data.onlineSurcharge)} card processing.`

  return (
    <PageContent size="narrow">
      <MemberBreadcrumbs
        title="Team fee"
        breadcrumbs={[
          { label: 'Home', href: '/home' },
          { label: 'Online payment', href: '/payment' },
        ]}
      />
      <PageHeader title="Team fee" description={description} />
      {isErr(price) ? (
        <Alert>
          <CheckCircle2 className="h-5 w-5" />
          <AlertTitle>Nothing to pay online</AlertTitle>
          <AlertDescription>
            {CHECKOUT_REFUSAL_MESSAGES.team[price.error]}
          </AlertDescription>
        </Alert>
      ) : (
        <Checkout
          target={target}
          returnUrl={getUrl(
            '/payment/team-fee/success?session_id={CHECKOUT_SESSION_ID}'
          )}
        />
      )}
    </PageContent>
  )
}
