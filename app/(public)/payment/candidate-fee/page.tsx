import { getHydratedCandidate } from '@/actions/candidates'
import Checkout from '@/components/checkout'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import * as Results from '@/lib/results'
import { getUrl } from '@/lib/url'
import { Errors } from '@/lib/error'

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
    logger.error({
      path: '/payment/candidate-fee',
      error: Errors.MISSING_CANDIDATE_ID,
      msg: 'Payment page accessed without candidate_id',
    })
    redirect(`/home?error=${Errors.MISSING_CANDIDATE_ID}`)
  }

  const candidateResult = await getHydratedCandidate(candidate_id)
  if (Results.isErr(candidateResult)) {
    logger.error({
      path: '/payment/candidate-fee',
      candidate_id,
      error: Errors.FAILED_TO_FETCH_CANDIDATE,
      errorMessage: candidateResult.error.message,
      msg: 'Failed to fetch candidate for payment page',
    })
    redirect(`/home?error=${Errors.FAILED_TO_FETCH_CANDIDATE}`)
  }

  const candidate = candidateResult.data

  if (!candidate) {
    logger.error({
      path: '/payment/candidate-fee',
      candidate_id,
      error: Errors.INVALID_CANDIDATE,
      msg: 'Candidate not found for payment page',
    })
    redirect(`/home?error=${Errors.INVALID_CANDIDATE}`)
  }

  // Check if candidate is in the correct status for payment
  if (candidate.status !== 'awaiting_payment') {
    logger.error({
      path: '/payment/candidate-fee',
      candidate_id,
      currentStatus: candidate.status,
      error: Errors.INVALID_CANDIDATE_STATUS,
      msg: 'Candidate not in awaiting_payment status',
    })
    redirect(`/home?error=${Errors.INVALID_CANDIDATE_STATUS}`)
  }

  // Validate payment_owner parameter
  if (
    candidate.candidate_sponsorship_info?.payment_owner &&
    !['candidate', 'sponsor'].includes(
      candidate.candidate_sponsorship_info.payment_owner
    )
  ) {
    logger.error({
      path: '/payment/candidate-fee',
      candidate_id,
      payment_owner: candidate.candidate_sponsorship_info.payment_owner,
      error: Errors.INVALID_PAYMENT_OWNER,
      msg: 'Invalid payment_owner value',
    })
    redirect(`/home?error=${Errors.INVALID_PAYMENT_OWNER}`)
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
