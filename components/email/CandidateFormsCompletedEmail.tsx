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

export default function CandidateFormsCompletedEmail({
  id,
  candidate_sponsorship_info,
  candidate_info,
}: HydratedCandidate) {
  const candidateName =
    candidate_info?.first_name && candidate_info?.last_name
      ? `${candidate_info.first_name} ${candidate_info.last_name}`
      : (candidate_sponsorship_info?.candidate_name ?? 'Unknown Candidate')

  return (
    <Html>
      <Head />
      <Preview>
        Candidate Forms Completed: {candidateName} has submitted their forms
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
                Candidate Forms Completed
              </Heading>

              <Text className="text-gray-700 mb-6">
                A candidate has completed and submitted their forms. The
                candidate is now ready for your review and approval.
              </Text>

              {/* Candidate Info */}
              <Section className="bg-gray-50 p-6 rounded-lg mb-6">
                <Heading className="text-lg font-semibold text-gray-900 mb-4">
                  Candidate Information
                </Heading>
                <Text className="text-gray-700 mb-2">
                  <strong>Candidate Name:</strong> {candidateName}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Candidate Email:</strong>{' '}
                  {candidate_info?.email ??
                    candidate_sponsorship_info?.candidate_email ??
                    'No email'}
                </Text>
                {candidate_info?.phone && (
                  <Text className="text-gray-700 mb-2">
                    <strong>Candidate Phone:</strong> {candidate_info.phone}
                  </Text>
                )}
              </Section>

              {/* Sponsor Info */}
              <Section className="bg-gray-50 p-6 rounded-lg mb-6">
                <Heading className="text-lg font-semibold text-gray-900 mb-4">
                  Sponsor Information
                </Heading>
                <Text className="text-gray-700 mb-2">
                  <strong>Sponsor Name:</strong>{' '}
                  {candidate_sponsorship_info?.sponsor_name ?? 'Unknown'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Sponsor Email:</strong>{' '}
                  {candidate_sponsorship_info?.sponsor_email ?? 'No email'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Sponsor Phone:</strong>{' '}
                  {candidate_sponsorship_info?.sponsor_phone ?? 'No phone'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Sponsor Church:</strong>{' '}
                  {candidate_sponsorship_info?.sponsor_church ?? 'No church'}
                </Text>
              </Section>

              <Text className="text-gray-700 mb-6">
                Please review the candidate&apos;s information and take
                appropriate action through the candidate review system.
              </Text>
            </Section>

            {/* Call to Action */}
            <Section className="text-center mb-8">
              <Button
                href={getUrl(`/review-candidates/${id}`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-decoration-none inline-block"
              >
                Review Candidate
              </Button>
            </Section>

            <Hr className="border-gray-200 mb-8" />

            {/* Footer */}
            <Section className="text-center text-gray-600 text-sm">
              <Text className="mb-2">
                This email was sent to notify you that a candidate has completed
                their forms.
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
