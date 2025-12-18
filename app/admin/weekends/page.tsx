import { getWeekendGroupsByStatus } from '@/actions/weekend'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Weekends } from './components/Weekends'
import { getLoggedInUser } from '@/services/identity/user'
import { Errors } from '@/lib/error'
import { Permission, permissionLock, userHasPermission } from '@/lib/security'
import { redirect } from 'next/navigation'

export default async function WeekendsPage() {
  const weekendGroupsResult = await getWeekendGroupsByStatus()

  const userResult = await getLoggedInUser()
  const user = userResult?.data

  try {
    if (isErr(userResult) || !user) {
      throw new Error(Errors.NOT_LOGGED_IN.toString())
    }

    permissionLock([Permission.READ_WEEKENDS])(user)
  } catch (error: unknown) {
    console.error(error)
    redirect(`/?error=${(error as Error).message}`)
  }

  const canEdit = userHasPermission(user, [Permission.WRITE_WEEKENDS])

  if (isErr(weekendGroupsResult)) {
    throw new Error(`Failed to fetch weekends: ${weekendGroupsResult.error}`)
  }

  const weekendGroups = weekendGroupsResult.data

  return (
    <>
      <AdminBreadcrumbs
        title="Weekends"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8 py-2 md:py-4">
        <Weekends weekendGroups={weekendGroups} canEdit={canEdit} />
      </div>
    </>
  )
}
