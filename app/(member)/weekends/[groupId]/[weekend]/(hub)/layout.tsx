import { isNil } from 'lodash'
import { UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MemberBreadcrumbs } from '@/components/member/breadcrumbs'
import { PageContent } from '@/components/member/page-content'
import { HubTabs, HubWeekendSwitch } from '@/components/weekend-hub/hub-tabs'
import { Results } from '@/lib/results'
import { formatWeekendGender, formatWeekendGroupTitle } from '@/lib/weekend'
import { formatCompactDateRange, weekendLocation } from '@/lib/weekend/hub'
import { loadHubContextFromParams, type HubParams } from '../../hub-context'
import { loadHubEvents } from '../../hub-data'

type HubLayoutProps = {
  params: HubParams
  children: React.ReactNode
}

/**
 * The hub's shared opening: breadcrumb, serif title, the sponsor button
 * with the Men's / Women's switch beneath it, and the section tabs. As a layout it stays mounted while tabs
 * change — only the body below the tabs reloads (with its own skeleton).
 */
export default async function WeekendHubLayout({
  params,
  children,
}: HubLayoutProps) {
  const { group, weekendType, weekend } = await loadHubContextFromParams(params)
  const groupTitle = formatWeekendGroupTitle(weekend.number)
  const gender = formatWeekendGender(weekendType, 'possessive') ?? ''

  const events = Results.unwrapOr(await loadHubEvents(group.groupId), [])
  const location = weekendLocation(events, weekend)
  const range = formatCompactDateRange(weekend.start_date, weekend.end_date)
  const description = [range, location]
    .filter((part): part is string => !isNil(part))
    .join(' · ')

  return (
    <PageContent>
      <MemberBreadcrumbs
        title={groupTitle}
        breadcrumbs={[
          { label: 'Home', href: '/home' },
          { label: 'The weekends', href: '/weekends' },
        ]}
      />
      {/* PageHeader's shape, but with the actions pinned to the title's top
          line, and the Men's / Women's switch tucked under the button. */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <h1 className="font-serif text-3xl font-semibold tracking-tight lg:text-4xl">
            {`${groupTitle} — ${gender} Weekend`}
          </h1>
          {description !== '' && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-start gap-3 sm:mt-1 sm:items-end">
          <Button size="default" href="/sponsor">
            <UsersRound aria-hidden />
            Sponsor a candidate
          </Button>
          <HubWeekendSwitch groupId={group.groupId} weekendType={weekendType} />
        </div>
      </div>

      <div className="mb-4">
        <HubTabs groupId={group.groupId} weekendType={weekendType} />
      </div>

      <div className="flex flex-col gap-4">{children}</div>
    </PageContent>
  )
}
