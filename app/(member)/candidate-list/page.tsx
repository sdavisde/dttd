import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { isNil } from 'lodash'
import { getCandidateListPageData } from '@/actions/candidate-list'
import type { WeekendType } from '@/lib/weekend/types'
import { WeekendFilterSelector } from '../review-candidates/components/WeekendFilterSelector'
import { CandidateListTable } from './components/CandidateListTable'
import { ShareButton } from './components/ShareButton'
import { ExportButton } from './components/ExportButton'
import { PageContent } from '@/components/member/page-content'
import { MemberBreadcrumbs } from '@/components/member/breadcrumbs'
import { PageHeader } from '@/components/ui/page-header'

interface PageProps {
  searchParams: Promise<{
    weekend?: string
    weekendType?: WeekendType
  }>
}

export default async function CandidateListPage({ searchParams }: PageProps) {
  const pageData = await getCandidateListPageData(searchParams)
  const {
    candidates,
    weekendOptions,
    currentWeekendId,
    currentWeekendType,
    user,
  } = pageData

  // Filter out rejected and sponsored candidates so both the table and export
  // show the same set of active candidates.
  const activeCandidates = candidates.filter(
    (c) => c.status !== 'rejected' && c.status !== 'sponsored'
  )

  return (
    <PageContent>
      <MemberBreadcrumbs
        title="Candidates"
        breadcrumbs={[{ label: 'Home', href: '/home' }]}
        shareable={false}
      />
      <PageHeader
        title="Candidates"
        description="Contact and personal information for the candidates on the selected weekend."
      >
        <ExportButton
          candidates={activeCandidates}
          user={user}
          weekendName={
            weekendOptions.find((w) => w.id === currentWeekendId)?.label
          }
        />
        <ShareButton
          title="Candidate List"
          text="View candidate information for the weekend"
        />
      </PageHeader>
      <div className="space-y-4">
        <WeekendFilterSelector
          weekendOptions={weekendOptions}
          currentWeekendId={currentWeekendId}
          currentWeekendType={currentWeekendType}
        />

        {!isNil(currentWeekendId) ? (
          <CandidateListTable candidates={activeCandidates} user={user} />
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Select a Weekend</AlertTitle>
            <AlertDescription>
              Please select a weekend to view the candidate list.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </PageContent>
  )
}
