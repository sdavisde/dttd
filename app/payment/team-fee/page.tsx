import { getHydratedCandidate } from '@/actions/candidates'
import Checkout from '@/components/checkout'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import * as Results from '@/lib/results'
import { getUrl } from '@/lib/url'

interface TeamFeesPaymentPageProps {}

/**
 * This page renders a stripe checkout page.
 * Since we accept payment for either candidate fees or team fees,
 * we need to pass the candidate_id to the page.
 *
 * The page will then validate that the candidate exists and is awaiting payment.
 * If the candidate is not awaiting payment, the page will redirect to the payment success page.
 *
 * If the candidate is awaiting payment, the page will render a stripe checkout page.
 *
 */
export default async function TeamFeesPaymentPage({}: TeamFeesPaymentPageProps) {
  const teamFeePriceId = process.env.TEAM_FEE_PRICE_ID
  if (!teamFeePriceId) {
    throw new Error('Missing team fee price id')
  }

  return (
    <div className='payment-page'>
      <Checkout
        priceId={teamFeePriceId}
        metadata={{}}
        returnUrl={getUrl('/payment/team-fee/success?session_id={CHECKOUT_SESSION_ID}')}
      />
    </div>
  )
}
