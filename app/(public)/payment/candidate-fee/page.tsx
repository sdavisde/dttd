import PublicCheckout from '@/components/public-checkout'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import * as Results from '@/lib/results'
import { getUrl } from '@/lib/url'
import { Errors } from '@/lib/error'
import { isEmpty, isNil } from 'lodash'
import { getCandidateById } from '@/services/candidates'
import { PAYMENT_CONSTANTS } from '@/lib/constants/payments'

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

  if (isNil(candidate_id) || isEmpty(candidate_id)) {
    logger.error({
      path: '/payment/candidate-fee',
      error: Errors.MISSING_CANDIDATE_ID,
      msg: 'Payment page accessed without candidate_id',
    })
    redirect(`/home?error=${Errors.MISSING_CANDIDATE_ID}`)
  }

  const candidateResult = await getCandidateById(candidate_id)
  if (Results.isErr(candidateResult)) {
    logger.error({
      path: '/payment/candidate-fee',
      candidate_id,
      error: Errors.FAILED_TO_FETCH_CANDIDATE,
      errorMessage: candidateResult.error,
      msg: 'Failed to fetch candidate for payment page',
    })
    redirect(`/home?error=${Errors.FAILED_TO_FETCH_CANDIDATE}`)
  }

  const candidate = candidateResult.data

  if (isNil(candidate)) {
    logger.error({
      path: '/payment/candidate-fee',
      candidate_id,
      error: Errors.INVALID_CANDIDATE,
      msg: 'Candidate not found for payment page',
    })
    redirect(`/home?error=${Errors.INVALID_CANDIDATE}`)
  }

  // Check if candidate fees have already been paid for this candidate
  if (candidate.amountPaid >= PAYMENT_CONSTANTS.CANDIDATE_FEE) {
    logger.info({
      path: '/payment/candidate-fee',
      candidate_id,
      amountPaid: candidate.amountPaid,
      candidateFee: PAYMENT_CONSTANTS.CANDIDATE_FEE,
      msg: 'Candidate fees already paid',
    })
    redirect(`/home?error=${Errors.CANDIDATE_FEES_ALREADY_PAID}`)
  }

  // Validate payment_owner parameter
  if (!['candidate', 'sponsor'].includes(candidate.paymentOwner)) {
    logger.error({
      path: '/payment/candidate-fee',
      candidate_id,
      payment_owner: candidate.paymentOwner,
      error: Errors.INVALID_PAYMENT_OWNER,
      msg: 'Invalid payment_owner value',
    })
    redirect(`/home?error=${Errors.INVALID_PAYMENT_OWNER}`)
  }

  return (
    <div className="payment-page">
      <PublicCheckout
        priceId={candidateFeePriceId}
        metadata={{
          candidateId: candidate.id,
          payment_owner: candidate.paymentOwner,
        }}
        returnUrl={getUrl(
          '/payment/candidate-fee/success?session_id={CHECKOUT_SESSION_ID}'
        )}
      />
    </div>
  )
}
