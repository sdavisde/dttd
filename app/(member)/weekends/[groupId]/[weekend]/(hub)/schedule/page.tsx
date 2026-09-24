import { CalendarEventSection } from '@/components/current-weekend/CalendarEventSection'
import { Results } from '@/lib/results'
import { eventsForWeekend } from '@/lib/weekend/hub'
import { loadHubContextFromParams, type HubParams } from '../../../hub-context'
import { loadHubEvents } from '../../../hub-data'

export default async function WeekendSchedulePage({
  params,
}: {
  params: HubParams
}) {
  const { group, weekend } = await loadHubContextFromParams(params)

  const eventsResult = await loadHubEvents(group.groupId)
  Results.logFailures(eventsResult)
  const events = eventsForWeekend(Results.unwrapOr(eventsResult, []), weekend)

  return <CalendarEventSection events={events} />
}
