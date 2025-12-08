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

interface PasswordResetEmailProps {
  resetUrl: string
  userEmail: string
}

export default function PasswordResetEmail({
  resetUrl,
  userEmail,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password for Dusty Trails Tres Dias</Preview>
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
                Password Reset Request
              </Heading>

              <Text className="text-gray-700 mb-6">
                We received a request to reset the password for your account (
                {userEmail}). If you made this request, click the button below
                to reset your password.
              </Text>

              {/* Call to Action */}
              <Section className="text-center mb-8">
                <Button
                  href={resetUrl}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-decoration-none inline-block"
                >
                  Reset Your Password
                </Button>
              </Section>

              <Text className="text-gray-700 mb-4">
                This link will expire in 1 hour for security reasons.
              </Text>

              <Text className="text-gray-700 mb-6">
                If you didn&apos;t request a password reset, you can safely
                ignore this email. Your password will not be changed.
              </Text>

              {/* Security Notice */}
              <Section className="bg-amber-50 p-6 rounded-lg mb-6">
                <Heading className="text-lg font-semibold text-amber-800 mb-3">
                  Security Note
                </Heading>
                <Text className="text-amber-700 mb-2">
                  • This link can only be used once
                </Text>
                <Text className="text-amber-700 mb-2">
                  • The link will expire in 1 hour
                </Text>
                <Text className="text-amber-700 mb-2">
                  • If you continue to have issues, please contact support
                </Text>
              </Section>

              <Text className="text-gray-600 text-sm">
                If the button above doesn&apos;t work, copy and paste this link
                into your browser:
                <br />
                <span className="text-blue-600 break-all">{resetUrl}</span>
              </Text>
            </Section>

            <Hr className="border-gray-200 mb-8" />

            {/* Footer */}
            <Section className="text-center text-gray-600 text-sm">
              <Text className="mb-2">
                This email was sent because a password reset was requested for
                your account.
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
