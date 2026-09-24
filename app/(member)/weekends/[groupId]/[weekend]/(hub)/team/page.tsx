import { Suspense } from 'react'
import {
  WeekendRosterView,
  WeekendRosterViewSkeleton,
} from '@/components/weekend'
import { loadHubContextFromParams, type HubParams } from '../../../hub-context'

export default async function WeekendTeamPage({
  params,
}: {
  params: HubParams
}) {
  const { user, weekend } = await loadHubContextFromParams(params)

  return (
    <Suspense fallback={<WeekendRosterViewSkeleton hideWeekendHeader />}>
      <WeekendRosterView weekendId={weekend.id} user={user} hideWeekendHeader />
    </Suspense>
  )
}
