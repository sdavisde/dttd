import { isErr, isOk, Results } from '@/lib/results'
import { getActiveWeekends } from '@/services/weekend'
import { getCandidateCountByWeekend } from '@/services/candidates'
import { getPrayerWheelUrls } from '@/services/settings'
import { getEventsForWeekendGroup } from '@/services/events'
import { WeekendType } from '@/lib/weekend/types'
import { CurrentWeekendHeader } from './CurrentWeekendHeader'
import { CandidateProgressBar } from './CandidateProgressBar'
import { PrayerWheelButtons } from './PrayerWheelButtons'
import { EmptyWeekendState } from './EmptyWeekendState'
import { CalendarEventSection } from './CalendarEventSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const CANDIDATE_CAPACITY = 42

export async function CurrentWeekendView() {
  const weekendsResult = await getActiveWeekends()

  if (isErr(weekendsResult)) {
    return <EmptyWeekendState />
  }

  const weekends = weekendsResult.data
  const mensWeekend = weekends[WeekendType.MENS]
  const womensWeekend = weekends[WeekendType.WOMENS]

  // Fetch candidate counts, prayer wheel URLs, and events in parallel
  const groupId = mensWeekend.groupId ?? womensWeekend.groupId
  const [
    mensCandidateCountResult,
    womensCandidateCountResult,
    prayerWheelUrlsResult,
    eventsResult,
  ] = await Promise.all([
    getCandidateCountByWeekend(mensWeekend.id),
    getCandidateCountByWeekend(womensWeekend.id),
    getPrayerWheelUrls(),
    groupId
      ? getEventsForWeekendGroup(groupId)
      : Promise.resolve(Results.ok([])),
  ])

  const mensCandidateCount = Results.unwrapOr(mensCandidateCountResult, 0)
  const womensCandidateCount = Results.unwrapOr(womensCandidateCountResult, 0)
  const prayerWheelUrls = isOk(prayerWheelUrlsResult)
    ? prayerWheelUrlsResult.data
    : { mens: '', womens: '' }
  const events = isOk(eventsResult) ? eventsResult.data : []

  return (
    <div className="space-y-8">
      {/* Top section: Header on left, Progress bars on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Title, dates, and prayer wheels */}
        <div className="space-y-6">
          <CurrentWeekendHeader
            mensWeekend={mensWeekend}
            womensWeekend={womensWeekend}
          />
          <PrayerWheelButtons
            mensUrl={prayerWheelUrls.mens}
            womensUrl={prayerWheelUrls.womens}
          />
        </div>

        {/* Right column: Progress bars stacked */}
        <div className="space-y-4 h-full">
          <Card className="h-full gap-2">
            <CardHeader>
              <CardTitle>Sponsored Candidates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CandidateProgressBar
                label="Men's Weekend"
                count={mensCandidateCount}
                capacity={CANDIDATE_CAPACITY}
              />
              <CandidateProgressBar
                label="Women's Weekend"
                count={womensCandidateCount}
                capacity={CANDIDATE_CAPACITY}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Bottom section: Calendar and Events */}
      <CalendarEventSection events={events} />
    </div>
  )
}
