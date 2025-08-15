import { getUpcomingEvents, getPastEvents } from '@/actions/events'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import Meetings from './components/Meetings'
import { userHasPermission, Permission, getValidatedUser } from '@/lib/security'
import { isErr } from '@/lib/results'

export default async function MeetingsPage() {
  const user = await getValidatedUser()

  const canEdit = userHasPermission(user, [Permission.WRITE_MEETINGS])

  // Fetch events data server-side
  const [upcomingEventsResult, pastEventsResult] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents()
  ])

  const upcomingEvents = isErr(upcomingEventsResult) ? [] : upcomingEventsResult.data
  const pastEvents = isErr(pastEventsResult) ? [] : pastEventsResult.data

  return (
    <>
      <AdminBreadcrumbs
        title='Meetings'
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className='container mx-auto px-8 pb-8'>
        <Meetings
          canEdit={canEdit}
          upcomingEvents={upcomingEvents}
          pastEvents={pastEvents}
        />
      </div>
    </>
  )
}