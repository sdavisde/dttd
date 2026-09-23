import { getAllCandidatesWithDetails } from '@/actions/candidates'
import { Results } from '@/lib/results'
import { formatWeekendTitle } from '@/lib/weekend'
import { CandidateListTable } from './components/CandidateListTable'
import { ExportButton } from './components/ExportButton'
import { ShareButton } from './components/ShareButton'
import {
  loadHubContext,
  WeekendHubFrame,
  type HubSearchParams,
} from '../hub-frame'

type PageProps = {
  params: Promise<{ groupId: string }>
  searchParams: HubSearchParams
}

/**
 * The hub's Candidates tab: contact and personal information for everyone
 * with a spot on the selected weekend (columns gated per permission inside
 * the table). Rejected candidates and sponsorships that haven't produced a
 * candidate yet are left out so the table and the export agree.
 */
export default async function WeekendCandidatesPage({
  params,
  searchParams,
}: PageProps) {
  const { groupId } = await params
  const context = await loadHubContext(groupId, searchParams)
  const { user, group, weekend, weekendType } = context

  const candidatesResult = await getAllCandidatesWithDetails({
    weekendGroupId: group.groupId,
    weekendType,
  })
  Results.logFailures(candidatesResult)
  const candidates = Results.unwrapOr(candidatesResult, []).filter(
    (c) => c.status !== 'rejected' && c.status !== 'sponsored'
  )

  return (
    <WeekendHubFrame context={context} active="candidates">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Contact and personal information for the candidates on this weekend.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButton
            candidates={candidates}
            user={user}
            weekendName={formatWeekendTitle(weekend)}
          />
          <ShareButton
            title="Candidate List"
            text="View candidate information for the weekend"
          />
        </div>
      </div>
      <CandidateListTable candidates={candidates} user={user} />
    </WeekendHubFrame>
  )
}
