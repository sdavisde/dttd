import { HydratedCandidate } from '@/lib/candidates/types'
import { getUrl } from '@/lib/url'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'

interface CandidateFeePaymentRequestEmailProps {
  candidate: HydratedCandidate
  paymentOwner: 'candidate' | 'sponsor'
  paymentOwnerName: string
}

export default function CandidateFeePaymentRequestEmail({
  candidate,
  paymentOwner,
  paymentOwnerName,
}: CandidateFeePaymentRequestEmailProps) {
  const paymentUrl = getUrl(
    `/payment/candidate-fee?candidate_id=${candidate.id}&payment_owner=${paymentOwner}`
  )

  return (
    <Html>
      <Head />
      <Preview>
        Last Step! Complete Payment for{' '}
        {candidate.candidate_sponsorship_info?.candidate_name ?? 'Candidate'} -
        Dusty Trails Tres Dias Weekend
      </Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-8 px-4">
            {/* Header */}
            <Section className="text-center mb-8">
              <Heading className="text-2xl font-bold text-gray-900 mb-2">
                Dusty Trails Tres Dias
              </Heading>
            </Section>

            <Hr className="border-gray-200 mb-8" />

            {/* Main Content */}
            <Section className="mb-8">
              <Heading className="text-xl font-semibold text-gray-900 mb-4">
                Payment Request
              </Heading>

              <Text className="text-gray-700 mb-6">
                Dear {paymentOwnerName},
              </Text>

              <Text className="text-gray-700 mb-6">
                {paymentOwner === 'candidate'
                  ? `We're so excited to have you join us for the upcoming Dusty Trails Tres Dias weekend.`
                  : `The sponsorship request for ${candidate.candidate_sponsorship_info?.candidate_name} has been approved for the Dusty Trails Tres Dias weekend. As the designated payment owner, we need you to complete the payment to confirm their spot.`}
              </Text>

              {/* Candidate Information - only show if sponsor is paying */}
              {paymentOwner === 'sponsor' && (
                <Section className="bg-gray-50 p-6 rounded-lg mb-6">
                  <Heading className="text-lg font-semibold text-gray-900 mb-4">
                    Candidate Information
                  </Heading>
                  <Text className="text-gray-700 mb-2">
                    <strong>Candidate Name:</strong>{' '}
                    {candidate.candidate_sponsorship_info?.candidate_name ??
                      'No name'}
                  </Text>
                  {candidate.candidate_sponsorship_info?.sponsor_name && (
                    <Text className="text-gray-700 mb-2">
                      <strong>Sponsor Name:</strong>{' '}
                      {candidate.candidate_sponsorship_info?.sponsor_name}
                    </Text>
                  )}
                  <Text className="text-gray-700 mb-2">
                    <strong>Status:</strong> Awaiting Payment
                  </Text>
                </Section>
              )}

              <Text className="text-gray-700 mb-6">
                To complete the registration process and secure your spot for
                the weekend, please click the button below to proceed with
                payment.
              </Text>

              <Text className="text-gray-700 mb-6">
                <strong>Important:</strong> Your spot is not confirmed until
                payment is received. Please complete this payment as soon as
                possible to ensure your participation in the weekend.
              </Text>
            </Section>

            {/* Call to Action */}
            <Section className="text-center mb-8">
              <Button
                href={paymentUrl}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-decoration-none inline-block"
              >
                Complete Payment
              </Button>
            </Section>

            <Hr className="border-gray-200 mb-8" />

            {/* Footer */}
            <Section className="text-center text-gray-600 text-sm">
              <Text className="mb-2">
                If you have any questions about the payment process or the
                weekend, please don&apos;t hesitate to contact us.
              </Text>
              <Text className="mb-2">
                If the button above doesn&apos;t work, you can copy and paste
                this link into your browser:
              </Text>
              <Text className="mb-4 text-blue-600">{paymentUrl}</Text>
              <Text className="mb-2">
                © 2025 Dusty Trails Tres Dias. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
