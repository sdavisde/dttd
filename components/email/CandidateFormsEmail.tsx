import { Tables } from '@/database.types'
import { getUrl } from '@/lib/url'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Button } from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'

export default function CandidateFormsEmail(candidate: Tables<'candidates'>) {
  return (
    <Html>
      <Head />
      <Preview>Important Forms for Your Upcoming Tres Dias Weekend</Preview>
      <Tailwind>
        <Body className='bg-white font-sans'>
          <Container className='mx-auto py-8 px-4'>
            {/* Header */}
            <Section className='text-center mb-8'>
              <Heading className='text-2xl font-bold text-gray-900 mb-2'>Dusty Trails Tres Dias</Heading>
            </Section>

            <Hr className='border-gray-200 mb-8' />

            {/* Main Content */}
            <Section className='mb-8'>
              <Heading className='text-xl font-semibold text-gray-900 mb-4'>Welcome {candidate.name}!</Heading>

              <Text className='text-gray-700 mb-4'>
                We are excited that you will be joining us for an upcoming Tres Dias weekend! To help prepare for your
                weekend, there are some important forms we need you to complete.
              </Text>

              <Text className='text-gray-700 mb-4'>
                Please click the button below to access and complete your candidate forms. These forms help us ensure we
                can provide the best possible experience for you during your weekend.
              </Text>

              <Section className='text-center mb-8'>
                <Button
                  className='bg-blue-600 text-white px-6 py-3 rounded-md font-medium'
                  href={getUrl(`/candidate/${candidate.id}/forms`)}
                >
                  Complete Your Forms
                </Button>
              </Section>

              <Text className='text-gray-700 mb-4'>
                If you have any questions about the forms or the upcoming weekend, please don't hesitate to reach out to
                your sponsor or contact us directly.
              </Text>

              <Text className='text-gray-700 italic'>
                Note: Please complete these forms as soon as possible to help us with weekend planning.
              </Text>
            </Section>

            <Hr className='border-gray-200 mb-8' />

            <Section className='text-center text-gray-600 text-sm'>
              <Text>Dusty Trails Tres Dias</Text>
              <Text>De Colores!</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
