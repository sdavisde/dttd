import { getLoggedInUser } from '@/services/identity/user'
import {
  getEventsForWeekendGroup,
  getCommunityEvents,
  type Event,
} from '@/services/events'
import {
  getActiveWeekends,
  getWeekendOptions,
  WeekendType,
  type Weekend,
} from '@/services/weekend'
import type { WeekendIndividualOption } from '@/components/events/event-form-schema'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import Meetings from './components/Meetings'
import { permissionLock, userHasPermission, Permission } from '@/lib/security'
import { isErr } from '@/lib/results'
import { Errors } from '@/lib/error'
import { redirect } from 'next/navigation'
import { isNil } from 'lodash'

export default async function MeetingsPage() {
  const userResult = await getLoggedInUser()
  const user = userResult?.data

  try {
    if (isErr(userResult) || isNil(user)) {
      throw new Error(Errors.NOT_LOGGED_IN.toString())
    }

    permissionLock([Permission.READ_EVENTS])(user)
  } catch (error: unknown) {
    console.error(error)
    redirect(`/?error=${(error as Error).message}`)
  }

  const canEdit = userHasPermission(user, [Permission.WRITE_EVENTS])

  // Fetch active weekends and community events in parallel
  const [activeWeekendsResult, communityEventsResult, weekendOptionsResult] =
    await Promise.all([
      getActiveWeekends(),
      getCommunityEvents(),
      getWeekendOptions(),
    ])

  const communityEvents = isErr(communityEventsResult)
    ? []
    : communityEventsResult.data
  const weekendOptions = isErr(weekendOptionsResult)
    ? []
    : weekendOptionsResult.data

  // Build active group data if available
  let activeGroup: {
    groupId: string
    groupNumber: number | null
    mensWeekend: Weekend
    womensWeekend: Weekend
  } | null = null
  let activeGroupEvents: Event[] = []
  let weekendIndividualOptions: WeekendIndividualOption[] = []

  if (!isErr(activeWeekendsResult)) {
    const activeWeekends = activeWeekendsResult.data
    const mensWeekend = activeWeekends[WeekendType.MENS]
    const womensWeekend = activeWeekends[WeekendType.WOMENS]
    const groupId = mensWeekend.groupId ?? womensWeekend.groupId

    if (!isNil(groupId)) {
      activeGroup = {
        groupId,
        groupNumber: mensWeekend.number ?? womensWeekend.number,
        mensWeekend,
        womensWeekend,
      }

      const eventsResult = await getEventsForWeekendGroup(groupId)
      activeGroupEvents = isErr(eventsResult) ? [] : eventsResult.data

      weekendIndividualOptions = [
        {
          id: mensWeekend.id,
          label: `Men's #${mensWeekend.number ?? '?'}`,
          type: 'MENS' as const,
          groupId,
        },
        {
          id: womensWeekend.id,
          label: `Women's #${womensWeekend.number ?? '?'}`,
          type: 'WOMENS' as const,
          groupId,
        },
      ]
    }
  }

  return (
    <>
      <AdminBreadcrumbs
        title="Meetings"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8 pb-8">
        <Meetings
          canEdit={canEdit}
          activeGroup={activeGroup}
          activeGroupEvents={activeGroupEvents}
          communityEvents={communityEvents}
          weekendOptions={weekendOptions}
          weekendIndividualOptions={weekendIndividualOptions}
        />
      </div>
    </>
  )
}
