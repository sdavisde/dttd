import { getLoggedInUser } from '@/services/identity/user'
import { getUpcomingEvents, getPastEvents } from '@/services/events'
import { getWeekendOptions } from '@/services/weekend'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import Meetings from './components/Meetings'
import { permissionLock, userHasPermission, Permission } from '@/lib/security'
import { isErr } from '@/lib/results'
import { Errors } from '@/lib/error'
import { redirect } from 'next/navigation'

export default async function MeetingsPage() {
  const userResult = await getLoggedInUser()
  const user = userResult?.data

  try {
    if (isErr(userResult) || !user) {
      throw new Error(Errors.NOT_LOGGED_IN.toString())
    }

    permissionLock([Permission.READ_EVENTS])(user)
  } catch (error: unknown) {
    console.error(error)
    redirect(`/?error=${(error as Error).message}`)
  }

  const canEdit = userHasPermission(user, [Permission.WRITE_EVENTS])

  // Fetch events data server-side
  const [upcomingEventsResult, pastEventsResult, weekendOptionsResult] =
    await Promise.all([
      getUpcomingEvents(),
      getPastEvents(),
      getWeekendOptions(),
    ])

  const upcomingEvents = isErr(upcomingEventsResult)
    ? []
    : upcomingEventsResult.data
  const pastEvents = isErr(pastEventsResult) ? [] : pastEventsResult.data
  const weekendOptions = isErr(weekendOptionsResult)
    ? []
    : weekendOptionsResult.data

  return (
    <>
      <AdminBreadcrumbs
        title="Meetings"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8 pb-8">
        <Meetings
          canEdit={canEdit}
          upcomingEvents={upcomingEvents}
          pastEvents={pastEvents}
          weekendOptions={weekendOptions}
        />
      </div>
    </>
  )
}
