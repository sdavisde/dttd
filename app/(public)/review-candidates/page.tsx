import { Typography } from '@/components/ui/typography'
import { CandidateReviewTable } from './components/CandidateReviewTable'
import { WeekendFilterSelector } from './components/WeekendFilterSelector'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { getReviewPageData } from '@/actions/review-candidates'
import { WeekendType } from '@/lib/weekend/types'
import { isNil } from 'lodash'

interface PageProps {
  searchParams: Promise<{
    weekend?: string
    weekendType?: WeekendType
  }>
}

export default async function ReviewCandidatePage({ searchParams }: PageProps) {
  const { candidates, weekendOptions, currentWeekendId } =
    await getReviewPageData(searchParams)

  return (
    <div className="container mx-auto p-4 min-h-[80vh]">
      <div className="my-4">
        <Typography variant="h1">Candidate List</Typography>
        <Typography variant="p" className="mb-4">
          A list of candidates for the upcoming weekends.
        </Typography>

        <WeekendFilterSelector weekendOptions={weekendOptions} />

        {!isNil(currentWeekendId) ? (
          <CandidateReviewTable candidates={candidates} />
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Select a Weekend</AlertTitle>
            <AlertDescription>
              Please select a weekend to view a candidates list.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
