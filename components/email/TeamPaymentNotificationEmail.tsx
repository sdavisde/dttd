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

interface TeamPaymentNotificationEmailProps {
  teamMemberName: string
  teamMemberEmail: string | null
  weekendName: string
  paymentAmount: number
}

export default function TeamPaymentNotificationEmail({
  teamMemberName,
  teamMemberEmail,
  weekendName,
  paymentAmount,
}: TeamPaymentNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Team Payment Received: {teamMemberName} has paid for {weekendName}
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
                Team Payment Received
              </Heading>

              <Text className="text-gray-700 mb-6">
                A team member has successfully paid their team fees. Please find
                the payment details below for your records.
              </Text>

              {/* Payment Details */}
              <Section className="bg-gray-50 p-6 rounded-lg mb-6">
                <Heading className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Details
                </Heading>
                <Text className="text-gray-700 mb-2">
                  <strong>Team Member Name:</strong> {teamMemberName}
                </Text>
                {teamMemberEmail && (
                  <Text className="text-gray-700 mb-2">
                    <strong>Team Member Email:</strong> {teamMemberEmail}
                  </Text>
                )}
                <Text className="text-gray-700 mb-2">
                  <strong>Weekend:</strong> {weekendName}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Payment Amount:</strong> ${paymentAmount.toFixed(2)}
                </Text>
                <Text className="text-gray-700 mb-2">
                  <strong>Payment Status:</strong> <span className="text-green-600 font-semibold">Paid</span>
                </Text>
              </Section>

              <Text className="text-gray-700 mb-6">
                The team member has been marked as paid in the system. No further
                action is required from you at this time.
              </Text>
            </Section>

            {/* Call to Action */}
            <Section className="text-center mb-8">
              <Button
                href={getUrl('/admin')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-decoration-none inline-block"
              >
                View Admin Dashboard
              </Button>
            </Section>

            <Hr className="border-gray-200 mb-8" />

            {/* Footer */}
            <Section className="text-center text-gray-600 text-sm">
              <Text className="mb-2">
                This email was sent to notify you of a team member payment.
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