import { isNil } from 'lodash'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { userHasPermission, Permission } from '@/lib/security'
import { getActiveWeekends, getWeekendRoster } from '@/services/weekend'
import { getRosterBuilderCommunityData } from '@/services/roster-builder'
import { isErr, isOk } from '@/lib/results'
import type { Weekend } from '@/lib/weekend/types'
import { WeekendType } from '@/lib/weekend/types'
import { RosterBuilderBoard } from './roster-builder-board'
import { WeekendPicker } from './weekend-picker'

function weekendTitle(weekend: Weekend): string {
  const label = weekend.type === WeekendType.MENS ? 'Mens' : 'Womens'
  return `DTTD #${weekend.number ?? '?'} ${label} Roster`
}

export default async function RosterBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ weekendId?: string }>
}) {
  const userResult = await getLoggedInUser()
  if (isErr(userResult)) {
    redirect('/login')
  }

  const user = userResult.data

  if (!userHasPermission(user, [Permission.WRITE_TEAM_ROSTER])) {
    return (
      <div className="container mx-auto px-4 pt-12 pb-8 text-center">
        <h1 className="text-xl font-bold text-foreground mb-2">
          Roster Builder
        </h1>
        <p className="text-muted-foreground">
          You don&apos;t have permission to access the Roster Builder.
        </p>
      </div>
    )
  }

  const activeWeekendsResult = await getActiveWeekends()
  if (isErr(activeWeekendsResult)) {
    return (
      <div className="container mx-auto px-4 pt-12 pb-8 text-center">
        <h1 className="text-xl font-bold text-foreground mb-2">
          Roster Builder
        </h1>
        <p className="text-muted-foreground">No active weekends found.</p>
      </div>
    )
  }

  const activeWeekends = activeWeekendsResult.data
  const allWeekends = Object.values(activeWeekends)

  // If weekendId is specified in the URL, use it directly
  const params = await searchParams
  if (!isNil(params.weekendId)) {
    const selectedWeekend = allWeekends.find((w) => w.id === params.weekendId)
    if (!isNil(selectedWeekend)) {
      return renderBoard(selectedWeekend, user.id)
    }
  }

  // Try to auto-select: find a weekend the user is on the roster for
  for (const weekend of allWeekends) {
    const rosterResult = await getWeekendRoster(weekend.id)
    if (isOk(rosterResult)) {
      const isOnRoster = rosterResult.data.some((m) => m.user_id === user.id)
      if (isOnRoster) {
        return renderBoard(weekend, user.id)
      }
    }
  }

  // User isn't on any roster (e.g. FULL_ACCESS admin) — show picker
  return <WeekendPicker weekends={allWeekends} />
}

async function renderBoard(weekend: Weekend, userId: string) {
  const communityResult = await getRosterBuilderCommunityData(weekend.id)
  if (isErr(communityResult)) {
    return (
      <div className="container mx-auto px-4 pt-12 pb-8 text-center">
        <h1 className="text-xl font-bold text-foreground mb-2">
          Roster Builder
        </h1>
        <p className="text-destructive">
          Failed to load community data. Please try again.
        </p>
      </div>
    )
  }

  return (
    <RosterBuilderBoard
      weekendId={weekend.id}
      weekendTitle={weekendTitle(weekend)}
      rectorUserId={userId}
      communityMembers={communityResult.data}
    />
  )
}
