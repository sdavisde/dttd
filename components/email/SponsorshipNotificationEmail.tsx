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

export default function SponsorshipNotificationEmail({
  candidate_sponsorship_info,
}: HydratedCandidate) {
  return (
    <Html>
      <Head />
      <Preview>
        New Sponsorship Request:{' '}
        {candidate_sponsorship_info?.candidate_name ?? 'No name'} from{' '}
        {candidate_sponsorship_info?.sponsor_name ?? 'Sponsor'}
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
                New Sponsorship Request
              </Heading>

              <Text className="text-gray-700 mb-6">
                A new sponsorship request has been submitted and requires your
                review. Please review the details below and take action through
                the candidate review system.
              </Text>

              {/* Candidate and Sponsor Info */}
              <Section className="bg-gray-50 p-6 rounded-lg mb-6">
                <Heading className="text-lg font-semibold text-gray-900 mb-4">
                  Candidate Information
                </Heading>
                <Text className="text-gray-700 mb-2">
                  <strong>Candidate Name:</strong>{' '}
                  {candidate_sponsorship_info?.candidate_name ?? 'No name'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Candidate Email:</strong>{' '}
                  {candidate_sponsorship_info?.candidate_email ?? 'No email'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Sponsor Name:</strong>{' '}
                  {candidate_sponsorship_info?.sponsor_name ?? 'Sponsor'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Sponsor Phone:</strong>{' '}
                  {candidate_sponsorship_info?.sponsor_phone ?? 'No phone'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Sponsor Church:</strong>{' '}
                  {candidate_sponsorship_info?.sponsor_church ?? 'No church'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Sponsor Weekend:</strong>{' '}
                  {candidate_sponsorship_info?.sponsor_weekend ?? 'No weekend'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Reunion Group:</strong>{' '}
                  {candidate_sponsorship_info?.reunion_group ??
                    'No reunion group'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Contact Frequency:</strong>{' '}
                  {candidate_sponsorship_info?.contact_frequency ??
                    'No contact frequency'}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Payment Owner:</strong>{' '}
                  {candidate_sponsorship_info?.payment_owner ??
                    'No payment owner'}
                </Text>
              </Section>

              {/* Environment Descriptions */}
              <Section className="mb-6">
                <Heading className="text-lg font-semibold text-gray-900 mb-4">
                  Environment Descriptions
                </Heading>

                <Text className="text-gray-700 mb-3">
                  <strong>Church Environment:</strong>
                </Text>
                <Text className="text-gray-600 mb-4 pl-4">
                  {candidate_sponsorship_info?.church_environment ??
                    'No church environment'}
                </Text>

                <Text className="text-gray-700 mb-3">
                  <strong>Home Environment:</strong>
                </Text>
                <Text className="text-gray-600 mb-4 pl-4">
                  {candidate_sponsorship_info?.home_environment ??
                    'No home environment'}
                </Text>

                <Text className="text-gray-700 mb-3">
                  <strong>Social Environment:</strong>
                </Text>
                <Text className="text-gray-600 mb-4 pl-4">
                  {candidate_sponsorship_info?.social_environment ??
                    'No social environment'}
                </Text>

                <Text className="text-gray-700 mb-3">
                  <strong>Work Environment:</strong>
                </Text>
                <Text className="text-gray-600 mb-4 pl-4">
                  {candidate_sponsorship_info?.work_environment ??
                    'No work environment'}
                </Text>
              </Section>

              {/* God's Evidence and Support Plan */}
              <Section className="mb-6">
                <Text className="text-gray-700 mb-3">
                  <strong>Evidence of God's Leading:</strong>
                </Text>
                <Text className="text-gray-600 mb-4 pl-4">
                  {candidate_sponsorship_info?.god_evidence ??
                    'No god evidence'}
                </Text>

                <Text className="text-gray-700 mb-3">
                  <strong>Support Plan:</strong>
                </Text>
                <Text className="text-gray-600 mb-4 pl-4">
                  {candidate_sponsorship_info?.support_plan ??
                    'No support plan'}
                </Text>

                {candidate_sponsorship_info?.prayer_request && (
                  <>
                    <Text className="text-gray-700 mb-3">
                      <strong>Prayer Request:</strong>
                    </Text>
                    <Text className="text-gray-600 mb-4 pl-4">
                      {candidate_sponsorship_info?.prayer_request ??
                        'No prayer request'}
                    </Text>
                  </>
                )}
              </Section>
            </Section>

            {/* Call to Action */}
            <Section className="text-center mb-8">
              <Button
                href={getUrl('/review-candidates')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-decoration-none inline-block"
              >
                Review Sponsorship Request
              </Button>
            </Section>

            <Hr className="border-gray-200 mb-8" />

            {/* Footer */}
            <Section className="text-center text-gray-600 text-sm">
              <Text className="mb-2">
                This email was sent to notify you of a new sponsorship request
                that requires review.
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
