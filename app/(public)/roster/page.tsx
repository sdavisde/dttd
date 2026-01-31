import { getActiveWeekends, Weekend } from '@/services/weekend'
import { isErr } from '@/lib/results'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WeekendRosterView, WeekendStatusBadge } from '@/components/weekend'

export default async function RosterPage() {
  const userResult = await getLoggedInUser()
  if (isErr(userResult)) {
    redirect('/login')
  }
  const user = userResult.data

  // Get active weekends to determine which weekend IDs to display
  const activeWeekendsResult = await getActiveWeekends()
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

    return (
      <div className="container mx-auto px-8 pt-6 pb-2 md:pt-8 md:pb-4">
        <WeekendRosterView
          weekendId={weekend.id}
          user={user}
          headerSlot={
            weekend.status && <WeekendStatusBadge status={weekend.status} />
          }
        />
      </div>
    )
  }

  // Tabbed view for both weekends
  return (
    <div className="container mx-auto px-8 pt-6 pb-2 md:pt-8 md:pb-4">
      <Tabs defaultValue={user.gender === 'male' ? 'mens' : 'womens'}>
        {weekends.map(({ value, weekend }) => (
          <TabsContent key={value} value={value}>
            <WeekendRosterView
              weekendId={weekend.id}
              user={user}
              headerSlot={
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
              }
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
