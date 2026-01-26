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

interface CandidatePaymentCompletedEmailProps {
  candidate: HydratedCandidate
  paymentAmount: number
  paymentMethod: 'card' | 'cash' | 'check'
  paymentOwner: 'candidate' | 'sponsor'
}

export default function CandidatePaymentCompletedEmail({
  candidate,
  paymentAmount,
  paymentMethod,
  paymentOwner,
}: CandidatePaymentCompletedEmailProps) {
  const candidateName =
    candidate.candidate_info?.first_name && candidate.candidate_info?.last_name
      ? `${candidate.candidate_info.first_name} ${candidate.candidate_info.last_name}`
      : (candidate.candidate_sponsorship_info?.candidate_name ??
        'Unknown Candidate')

  const paymentMethodDisplay =
    paymentMethod === 'card'
      ? 'Credit/Debit Card'
      : paymentMethod === 'cash'
        ? 'Cash'
        : 'Check'

  const payerName =
    paymentOwner === 'candidate'
      ? candidateName
      : (candidate.candidate_sponsorship_info?.sponsor_name ?? 'Sponsor')

  return (
    <Html>
      <Head />
      <Preview>
        Candidate Payment Received: {candidateName} - $
        {paymentAmount.toFixed(2)}
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
                Candidate Payment Received
              </Heading>

              <Text className="text-gray-700 mb-6">
                A candidate fee payment has been received. Please find the
                payment details below for your records.
              </Text>

              {/* Payment Details */}
              <Section className="bg-gray-50 p-6 rounded-lg mb-6">
                <Heading className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Details
                </Heading>
                <Text className="text-gray-700 mb-2">
                  <strong>Candidate Name:</strong> {candidateName}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Payment Amount:</strong> ${paymentAmount.toFixed(2)}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Payment Method:</strong> {paymentMethodDisplay}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Paid By:</strong> {payerName} ({paymentOwner})
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Payment Status:</strong>{' '}
                  <span className="text-green-600 font-semibold">Paid</span>
                </Text>
              </Section>

              {/* Candidate Info */}
              <Section className="bg-gray-50 p-6 rounded-lg mb-6">
                <Heading className="text-lg font-semibold text-gray-900 mb-4">
                  Candidate Information
                </Heading>
                <Text className="text-gray-700 mb-2">
                  <strong>Email:</strong>{' '}
                  {candidate.candidate_info?.email ??
                    candidate.candidate_sponsorship_info?.candidate_email ??
                    'No email'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Sponsor:</strong>{' '}
                  {candidate.candidate_sponsorship_info?.sponsor_name ??
                    'Unknown'}
                </Text>
              </Section>

              <Text className="text-gray-700 mb-6">
                The candidate has been marked as confirmed in the system. You
                can view the full candidate details in the review system.
              </Text>
            </Section>

            {/* Call to Action */}
            <Section className="text-center mb-8">
              <Button
                href={getUrl(`/review-candidates/${candidate.id}`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-decoration-none inline-block"
              >
                View Candidate Details
              </Button>
            </Section>

            <Hr className="border-gray-200 mb-8" />

            {/* Footer */}
            <Section className="text-center text-gray-600 text-sm">
              <Text className="mb-2">
                This email was sent to notify you of a candidate fee payment.
              </Text>
              <Text className="mb-2">
                If you have any questions, please contact the system
                administrator.
              </Text>
              <Text>© 2025 Dusty Trails Tres Dias. All rights reserved.</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
