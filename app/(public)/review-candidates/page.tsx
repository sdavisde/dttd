import { Typography } from '@/components/ui/typography'
import { CandidateReviewTable } from './components/CandidateReviewTable'
import { WeekendFilterSelector } from './components/WeekendFilterSelector'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { getReviewPageData } from '@/actions/review-candidates'
import { WeekendType } from '@/lib/weekend/types'
import { isNil } from 'lodash'
import { getLoggedInUser } from '@/services/identity/user'
import { Permission, userHasPermission } from '@/lib/security'
import { isOk } from '@/lib/results'

interface PageProps {
  searchParams: Promise<{
    weekend?: string
    weekendType?: WeekendType
  }>
}

export default async function ReviewCandidatePage({ searchParams }: PageProps) {
  const [pageData, userResult] = await Promise.all([
    getReviewPageData(searchParams),
    getLoggedInUser(),
  ])

  const { candidates, weekendOptions, currentWeekendId } = pageData

  // Check if user has permission to record payments
  const canEditPayments =
    isOk(userResult) &&
    userHasPermission(userResult.data, [Permission.WRITE_PAYMENTS])

  return (
    <div className="container mx-auto p-4 min-h-[80vh]">
      <div className="my-4">
        <Typography variant="h1">Candidate List</Typography>
        <Typography variant="p" className="mb-4">
          A list of candidates for the upcoming weekends.
        </Typography>

        <WeekendFilterSelector weekendOptions={weekendOptions} />

        {!isNil(currentWeekendId) ? (
          <CandidateReviewTable
            candidates={candidates}
            canEditPayments={canEditPayments}
          />
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
