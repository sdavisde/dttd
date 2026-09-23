import { CandidateReviewTable } from './components/CandidateReviewTable'
import { WeekendFilterSelector } from './components/WeekendFilterSelector'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { getReviewPageData } from '@/actions/review-candidates'
import type { WeekendType } from '@/lib/weekend/types'
import { isNil } from 'lodash'
import { getLoggedInUser } from '@/services/identity/user'
import { Permission, userHasPermission } from '@/lib/security'
import { isOk } from '@/lib/results'
import { PageContent } from '@/components/member/page-content'
import { MemberBreadcrumbs } from '@/components/member/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'

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

  const { candidates, weekendOptions, currentWeekendId, currentWeekendType } =
    pageData

  // Check if user has permission to record payments
  const canEditPayments =
    isOk(userResult) &&
    userHasPermission(userResult.data, [Permission.WRITE_PAYMENTS])

  return (
    <PageContent>
      <MemberBreadcrumbs
        title="Review candidates"
        breadcrumbs={[{ label: 'Home', href: '/home' }]}
      />
      <PageHeader
        title="Review candidates"
        description="Candidates on the upcoming weekends, from sponsorship through confirmation."
      />
      <div className="space-y-4">
        <WeekendFilterSelector
          weekendOptions={weekendOptions}
          currentWeekendId={currentWeekendId}
          currentWeekendType={currentWeekendType}
        />

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
    </PageContent>
  )
}
