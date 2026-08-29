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
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'

interface EmailChangeNotificationEmailProps {
  oldEmail: string
  newEmail: string
}

export default function EmailChangeNotificationEmail({
  oldEmail,
  newEmail,
}: EmailChangeNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your Dusty Trails Tres Dias account email is being changed
      </Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-8 px-4">
            <Section className="text-center mb-8">
              <Heading className="text-2xl font-bold text-gray-900 mb-2">
                Dusty Trails Tres Dias
              </Heading>
            </Section>

            <Hr className="border-gray-200 mb-8" />

            <Section className="mb-8">
              <Heading className="text-xl font-semibold text-gray-900 mb-4">
                Account Email Change Requested
              </Heading>
              <Text className="text-gray-700 mb-4">
                A request was made to change your account email from {oldEmail}{' '}
                to {newEmail}. The change takes effect once the new address
                confirms it.
              </Text>
              <Text className="text-gray-700 mb-4">
                If you made this request, no further action is needed from this
                inbox.
              </Text>
              <Text className="text-gray-700">
                If you did not request this change, please contact
                admin@dustytrailstresdias.org or reply to this email right away
                so we can secure your account.
              </Text>
            </Section>

            <Hr className="border-gray-200 mb-4" />

            <Section>
              <Text className="text-sm text-gray-500 text-center">
                This notification was sent to {oldEmail} because it is the
                current email on your account.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
