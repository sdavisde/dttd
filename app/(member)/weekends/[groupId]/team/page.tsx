import { Suspense } from 'react'
import {
  WeekendRosterView,
  WeekendRosterViewSkeleton,
} from '@/components/weekend'
import {
  loadHubContext,
  WeekendHubFrame,
  type HubSearchParams,
} from '../hub-frame'

type PageProps = {
  params: Promise<{ groupId: string }>
  searchParams: HubSearchParams
}

export default async function WeekendTeamPage({
  params,
  searchParams,
}: PageProps) {
  const { groupId } = await params
  const context = await loadHubContext(groupId, searchParams)

  return (
    <WeekendHubFrame context={context} active="team">
      <Suspense fallback={<WeekendRosterViewSkeleton hideWeekendHeader />}>
        <WeekendRosterView
          weekendId={context.weekend.id}
          user={context.user}
          hideWeekendHeader
        />
      </Suspense>
    </WeekendHubFrame>
  )
}
