import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { isNil } from 'lodash'
import { getCandidateListPageData } from '@/actions/candidate-list'
import { WeekendType } from '@/lib/weekend/types'
import { WeekendFilterSelector } from '../review-candidates/components/WeekendFilterSelector'
import { CandidateListTable } from './components/CandidateListTable'
import { ShareButton } from './components/ShareButton'
import { ExportButton } from './components/ExportButton'

interface PageProps {
  searchParams: Promise<{
    weekend?: string
    weekendType?: WeekendType
  }>
}

export default async function CandidateListPage({ searchParams }: PageProps) {
  const pageData = await getCandidateListPageData(searchParams)
  const { candidates, weekendOptions, currentWeekendId, user } = pageData

  return (
    <div className="container mx-auto p-4 min-h-[80vh]">
      <div className="my-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Typography variant="h1">Candidate Information</Typography>
            <Typography variant="p" className="mb-4">
              View candidate contact and personal information for the selected
              weekend.
            </Typography>
          </div>
          <div className="flex gap-2">
            <ExportButton
              candidates={candidates}
              user={user}
              weekendName={
                weekendOptions.find((w) => w.id === currentWeekendId)?.label
              }
            />
            <ShareButton
              title="Candidate List"
              text="View candidate information for the weekend"
            />
          </div>
        </div>

        <WeekendFilterSelector weekendOptions={weekendOptions} />

        {!isNil(currentWeekendId) ? (
          <CandidateListTable candidates={candidates} user={user} />
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
    </div>
  )
}
