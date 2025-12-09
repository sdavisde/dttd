import { HydratedCandidate } from '@/lib/candidates/types'

interface PaymentRequestEmailPreviewProps {
  candidate: HydratedCandidate
  paymentOwner: 'candidate' | 'sponsor'
  paymentOwnerName: string
}

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
      <div className="mx-auto py-8 px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dusty Trails Tres Dias
          </h1>
        </div>

        <hr className="border-gray-200 mb-8" />

        {/* Main Content */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Payment Request
          </h2>

          <p className="text-gray-700 mb-6">Dear {paymentOwnerName},</p>

          <p className="text-gray-700 mb-6">
            {paymentOwner === 'candidate'
              ? `We're so excited to have you join us for the upcoming Dusty Trails Tres Dias weekend.`
              : `The sponsorship request for ${candidate.candidate_sponsorship_info?.candidate_name} has been approved for the Dusty Trails Tres Dias weekend. As the designated payment owner, we need you to complete the payment to confirm their spot.`}
          </p>

          {/* Candidate Information - only show if sponsor is paying */}
          {paymentOwner === 'sponsor' && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Candidate Information
              </h3>
              <p className="text-gray-700 mb-2">
                <strong>Candidate Name:</strong>{' '}
                {candidate.candidate_sponsorship_info?.candidate_name ??
                  'No name'}
              </p>
              {candidate.candidate_sponsorship_info?.sponsor_name && (
                <p className="text-gray-700 mb-2">
                  <strong>Sponsor Name:</strong>{' '}
                  {candidate.candidate_sponsorship_info?.sponsor_name}
                </p>
              )}
              <p className="text-gray-700 mb-2">
                <strong>Status:</strong> Awaiting Payment
              </p>
            </div>
          )}

          <p className="text-gray-700 mb-6">
            To complete the registration process and secure your spot for the
            weekend, please click the button below to proceed with payment.
          </p>

          <p className="text-gray-700 mb-6">
            <strong>Important:</strong> Your spot is not confirmed until payment
            is received. Please complete this payment as soon as possible to
            ensure your participation in the weekend.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-8">
          <a
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold no-underline"
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Complete Payment
          </a>
        </div>

        <hr className="border-gray-200 mb-8" />

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
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
            © 2025 Dusty Trails Tres Dias. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
