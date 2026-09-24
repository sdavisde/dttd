import type { PaymentOwner, ReviewCandidate } from '@/lib/candidates/review'
import { isNil } from 'lodash'

interface PaymentRequestEmailPreviewProps {
  candidate: Pick<ReviewCandidate, 'id' | 'name' | 'sponsor'>
  paymentOwner: PaymentOwner
  paymentOwnerName: string
}

/**
 * A plain-HTML echo of the payment request email, so the reviewer sees what
 * the recipient will get before sending it.
 */
export function PaymentRequestEmailPreview({
  candidate,
  paymentOwner,
  paymentOwnerName,
}: PaymentRequestEmailPreviewProps) {
  // For preview, use window.location.origin if available, otherwise show placeholder
  const siteUrl =
    typeof window !== 'undefined' ? window.location.origin : '[site-url]'
  const paymentUrl = `${siteUrl}/payment/candidate-fee?candidate_id=${candidate.id}&payment_owner=${paymentOwner}`

  return (
    <div className="bg-white font-sans">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Dusty Trails Tres Dias
          </h1>
        </div>

        <hr className="mb-8 border-gray-200" />

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Payment Request
          </h2>

          <p className="mb-6 text-gray-700">Dear {paymentOwnerName},</p>

          <p className="mb-6 text-gray-700">
            {paymentOwner === 'candidate'
              ? `We're so excited to have you join us for the upcoming Dusty Trails Tres Dias weekend.`
              : `The sponsorship request for ${candidate.name} has been approved for the Dusty Trails Tres Dias weekend. As the designated payment owner, we need you to complete the payment to confirm their spot.`}
          </p>

          {paymentOwner === 'sponsor' && (
            <div className="mb-6 rounded-lg bg-gray-50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Candidate Information
              </h3>
              <p className="mb-2 text-gray-700">
                <strong>Candidate Name:</strong> {candidate.name}
              </p>
              {!isNil(candidate.sponsor.name) && (
                <p className="mb-2 text-gray-700">
                  <strong>Sponsor Name:</strong> {candidate.sponsor.name}
                </p>
              )}
              <p className="mb-2 text-gray-700">
                <strong>Status:</strong> Awaiting Payment
              </p>
            </div>
          )}

          <p className="mb-6 text-gray-700">
            To complete the registration process and secure your spot for the
            weekend, please click the button below to proceed with payment.
          </p>

          <p className="mb-6 text-gray-700">
            <strong>Important:</strong> Your spot is not confirmed until payment
            is received. Please complete this payment as soon as possible to
            ensure your participation in the weekend.
          </p>
        </div>

        <div className="mb-8 text-center">
          <a
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white no-underline"
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Complete Payment
          </a>
        </div>

        <hr className="mb-8 border-gray-200" />

        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">
            If you have any questions about the payment process or the weekend,
            please don&apos;t hesitate to contact us.
          </p>
          <p className="mb-2">
            If the button above doesn&apos;t work, you can copy and paste this
            link into your browser:
          </p>
          <p className="mb-4 text-blue-600">{paymentUrl}</p>
          <p className="mb-2">
            © {new Date().getFullYear()} Dusty Trails Tres Dias. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
