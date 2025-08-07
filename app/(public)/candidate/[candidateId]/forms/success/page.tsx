import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'

export default function CandidateFormSuccessPage() {
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <Typography variant="h1" className="w-full text-center">
            Candidate Form Submitted!
          </Typography>
          <p className="text-lg">
            Thank you for submitting your candidate form. If you have any
            questions, please contact us at
            <a
              href="mailto:admin@dustytrailstresdias.org"
              className="ms-2 text-blue-500"
            >
              admin@dustytrailstresdias.org
            </a>
            .
          </p>
          <Button href="/home">Go to home</Button>
        </CardContent>
      </Card>
    </div>
  )
}
