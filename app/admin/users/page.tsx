import { Permission, permissionLock, userHasPermission } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/auth'
import { getRoles } from '@/actions/roles'
import MasterRoster from './components/master-roster'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { getMasterRoster } from '@/services/master-roster'

export default async function MasterRosterPage() {
  const userResult = await getLoggedInUser()
  const user = userResult?.data

  try {
    if (isErr(userResult) || !user) {
      throw new Error('User not found')
    }
    permissionLock([Permission.READ_MASTER_ROSTER])(user)
  } catch (error) {
    redirect('/')
  }

  // Fetch users and roles data on the server
  const [masterRosterResult, rolesResult] = await Promise.all([
    getMasterRoster(),
    getRoles(),
  ])

  if (isErr(masterRosterResult)) {
    throw new Error(
      `Failed to fetch master roster: ${masterRosterResult.error}`
    )
  }

  if (isErr(rolesResult)) {
    throw new Error(`Failed to fetch roles: ${rolesResult.error}`)
  }

  const canViewExperience = userHasPermission(user, [
    Permission.READ_USER_EXPERIENCE,
  ])

  return (
    <>
      <AdminBreadcrumbs
        title="Master Roster"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8">
        <MasterRoster
          masterRoster={masterRosterResult.data}
          roles={rolesResult.data}
          canViewExperience={canViewExperience}
        />
      </div>
    </>
  )
}
