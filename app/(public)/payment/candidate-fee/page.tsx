import { getHydratedCandidate } from '@/actions/candidates'
import Checkout from '@/components/checkout'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import * as Results from '@/lib/results'
import { getUrl } from '@/lib/url'

interface CandidateFeesPaymentPageProps {
  searchParams: Promise<{
    candidate_id?: string
  }>
}

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
export default async function CandidateFeesPaymentPage({
  searchParams,
}: CandidateFeesPaymentPageProps) {
  const { candidate_id } = await searchParams

  const candidateFeePriceId = process.env.CANDIDATE_FEE_PRICE_ID
  if (!candidateFeePriceId) {
    throw new Error('Missing candidate fee price id')
  }

  if (!candidate_id) {
    redirect('/home?error=missing_candidate_id')
  }

  const candidateResult = await getHydratedCandidate(candidate_id)
  if (Results.isErr(candidateResult)) {
    logger.error(
      `Failed to fetch candidate ${candidate_id}: ${candidateResult.error.message}`
    )
    return Results.err(
      new Error(`Failed to fetch candidate: ${candidateResult.error.message}`)
    )
  }

  const candidate = candidateResult.data

  if (!candidate) {
    redirect('/home?error=invalid_candidate')
  }

  // Check if candidate is in the correct status for payment
  if (candidate.status !== 'awaiting_payment') {
    redirect('/home?error=invalid_candidate_status')
  }

  // Validate payment_owner parameter
  if (
    candidate.candidate_sponsorship_info?.payment_owner &&
    !['candidate', 'sponsor'].includes(
      candidate.candidate_sponsorship_info.payment_owner
    )
  ) {
    redirect('/home?error=invalid_payment_owner')
  }

  return (
    <div className="payment-page">
      <Checkout
        priceId={candidateFeePriceId}
        metadata={{
          candidate_id,
          payment_owner:
            candidate.candidate_sponsorship_info?.payment_owner ?? '',
        }}
        returnUrl={getUrl(
          '/payment/candidate-fee/success?session_id={CHECKOUT_SESSION_ID}'
        )}
      />
    </div>
  )
}
