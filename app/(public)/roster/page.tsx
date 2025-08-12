import { getActiveWeekends, getWeekendRoster } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { WeekendRosterTable } from '@/app/admin/weekends/[weekend_id]/weekend-roster-table'
import { Typography } from '@/components/ui/typography'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CHARole } from '@/lib/weekend/types'
import { Permission, userHasCHARole, userHasPermission } from '@/lib/security'

// todo: replace with lib funciton when merged in
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function RosterPage() {
  const userResult = await getLoggedInUser()
  if (isErr(userResult)) {
    redirect('/login')
  }
  const user = userResult.data
  const canViewPaymentInfo =
    userHasPermission(user, [Permission.READ_TEAM_PAYMENTS]) ||
    userHasCHARole(user, [
      CHARole.RECTOR,
      CHARole.BACKUP_RECTOR,
      CHARole.ASSISTANT_HEAD,
      CHARole.ROSTER,
    ])

  const canEditRoster =
    userHasPermission(user, [Permission.WRITE_TEAM_ROSTER]) ||
    userHasCHARole(user, [
      CHARole.RECTOR,
      CHARole.BACKUP_RECTOR,
      CHARole.ASSISTANT_HEAD,
      CHARole.ROSTER,
    ])

  // Get active weekends
  const activeWeekendsResult = await getActiveWeekends()
  if (isErr(activeWeekendsResult)) {
    throw new Error(
      `Failed to fetch active weekends: ${activeWeekendsResult.error.message}`
    )
  }

  const mensRosterResult = activeWeekendsResult.data.MENS
    ? await getWeekendRoster(activeWeekendsResult.data.MENS.id)
    : null
  const womensRosterResult = activeWeekendsResult.data.WOMENS
    ? await getWeekendRoster(activeWeekendsResult.data.WOMENS.id)
    : null

  // Generally it wouldn't make sense to use an array here, because we know we should have mens and womens weekends, and that's it.
  // I've added this here to make the render function cleaner by using a map - and gives type safety by handling edge case when mens or womens fail to fetch.
  const rosters = []
  if (mensRosterResult && !isErr(mensRosterResult)) {
    rosters.push({ value: 'mens', roster: mensRosterResult.data })
  }
  if (womensRosterResult && !isErr(womensRosterResult)) {
    rosters.push({ value: 'womens', roster: womensRosterResult.data })
  }

  if (rosters.length === 0) {
    throw new Error(`Could not find either the mens or womens rosters`)
  }

  if (rosters.length === 1) {
    const { roster } = rosters[0]
    return (
      <div className="container mx-auto px-8 py-8">
        <div className="mb-8">
          <Typography variant="h1" className="text-2xl mb-2">
            Weekend Roster
          </Typography>
          <Typography variant="h2" className="text-xl mb-4 flex items-center">
            Team Members
            <span className="text-black/30 font-light text-base ms-2">
              ({roster.length} members)
            </span>
          </Typography>

          <WeekendRosterTable
            roster={roster}
            isEditable={false}
            includePaymentInformation={false}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-8 py-8">
      <div className="mb-8">
        <Tabs defaultValue={user.gender === 'male' ? 'mens' : 'womens'}>
          <Typography
            variant="h2"
            className="text-2xl mb-2 flex items-center justify-between"
          >
            <span>Weekend Rosters</span>
            <TabsList className="md:w-sm lg:w-md">
              {rosters.map((roster) => (
                <TabsTrigger
                  key={roster.value}
                  value={roster.value}
                  className="capitalize font-bold"
                >
                  {roster.value}
                </TabsTrigger>
              ))}
            </TabsList>
          </Typography>
          {rosters.map(({ roster, value }) => (
            <TabsContent key={value} value={value}>
              <Typography
                variant="h3"
                className="text-xl mb-4 flex items-center"
              >
                Team Members
                <span className="text-black/30 font-light text-base ms-2">
                  ({roster.length} members)
                </span>
              </Typography>

              <WeekendRosterTable
                roster={roster}
                isEditable={canEditRoster}
                includePaymentInformation={canViewPaymentInfo}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
