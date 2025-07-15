// a submitted page to redurect to when a successful form submission is made

import { getHydratedCandidate } from '@/actions/candidates'
import * as Results from '@/lib/results'
import { logger } from '@/lib/logger'
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function SubmittedPage({ searchParams }: { searchParams: Promise<{ id: string }> }) {
  const { id } = await searchParams

  const candidateResult = await getHydratedCandidate(id)
  if (Results.isErr(candidateResult)) {
    logger.error('Error fetching candidate:', candidateResult.error)
    return <div>Error fetching candidate</div>
  }

  const candidate = candidateResult.data

  if (!candidate) {
    logger.error('Candidate not found')
    return <div>Candidate not found</div>
  }

  return (
    <div className='container mx-auto p-4 md:p-8'>
      <Card className='border-0 md:border-[1px] shadow-none md:shadow-sm'>
        <CardHeader>
          <CardTitle className='text-lg'>
            Thank you for wanting to sponsor {candidate.candidate_sponsorship_info?.candidate_name}!
          </CardTitle>
        </CardHeader>
        <CardContent>The pre-weekend couple will review your request and get back to you soon.</CardContent>
        <CardFooter>
          <Button href='/home'>Back to Home</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
