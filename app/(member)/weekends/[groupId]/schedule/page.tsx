import { CalendarEventSection } from '@/components/current-weekend/CalendarEventSection'
import { Results } from '@/lib/results'
import { eventsForWeekend } from '@/lib/weekend/hub'
import { loadHubEvents } from '../hub-data'
import {
  loadHubContext,
  WeekendHubFrame,
  type HubSearchParams,
} from '../hub-frame'

type PageProps = {
  params: Promise<{ groupId: string }>
  searchParams: HubSearchParams
}

export default async function WeekendSchedulePage({
  params,
  searchParams,
}: PageProps) {
  const { groupId } = await params
  const context = await loadHubContext(groupId, searchParams)

  const eventsResult = await loadHubEvents(context.group.groupId)
  Results.logFailures(eventsResult)
  const events = eventsForWeekend(
    Results.unwrapOr(eventsResult, []),
    context.weekend
  )

  return (
    <WeekendHubFrame context={context} active="schedule">
      <CalendarEventSection events={events} />
    </WeekendHubFrame>
  )
}
