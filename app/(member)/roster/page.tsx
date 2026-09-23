import { Suspense } from 'react'
import { getActiveWeekends } from '@/services/weekend'
import { isErr } from '@/lib/results'
import { isNil } from 'lodash'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  WeekendRosterView,
  WeekendRosterViewSkeleton,
  WeekendStatusBadge,
} from '@/components/weekend'

export default async function RosterPage() {
  // Auth runs concurrently with the active-weekends lookup; the redirect below
  // still fires before anything renders.
  const [userResult, activeWeekendsResult] = await Promise.all([
    getLoggedInUser(),
    getActiveWeekends(),
  ])

  if (isErr(userResult)) {
    redirect('/login')
  }
  const user = userResult.data

  if (isErr(activeWeekendsResult)) {
    throw new Error(
      `Failed to fetch active weekends: ${activeWeekendsResult.error}`
    )
  }

  const weekends = Object.entries(activeWeekendsResult.data).map(
    ([type, weekend]) => ({
      value: type.toLowerCase(),
      weekend,
    })
  )

  if (weekends.length === 0) {
    throw new Error(`Could not find either the mens or womens rosters`)
  }

  // Single weekend view
  if (weekends.length === 1) {
    const { weekend } = weekends[0]
    const headerSlot = !isNil(weekend.status) && (
      <WeekendStatusBadge status={weekend.status} />
    )

    return (
      <div className="container mx-auto px-8 pt-6 pb-2 md:pt-8 md:pb-4">
        <Suspense
          fallback={<WeekendRosterViewSkeleton headerSlot={headerSlot} />}
        >
          <WeekendRosterView
            weekendId={weekend.id}
            user={user}
            headerSlot={headerSlot}
          />
        </Suspense>
      </div>
    )
  }

  // Tab labels come from the already-awaited active weekends, so they render
  // (and stay clickable) inside the skeleton while each roster streams in.
  const tabList = (
    <TabsList>
      {weekends.map((w) => (
        <TabsTrigger
          key={w.value}
          value={w.value}
          className="capitalize font-bold"
        >
          {w.value}
        </TabsTrigger>
      ))}
    </TabsList>
  )

  // Tabbed view for both weekends
  return (
    <div className="container mx-auto px-8 pt-6 pb-2 md:pt-8 md:pb-4">
      <Tabs defaultValue={user.gender === 'male' ? 'mens' : 'womens'}>
        {weekends.map(({ value, weekend }) => (
          <TabsContent key={value} value={value}>
            <Suspense
              fallback={<WeekendRosterViewSkeleton headerSlot={tabList} />}
            >
              <WeekendRosterView
                weekendId={weekend.id}
                user={user}
                headerSlot={tabList}
              />
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
