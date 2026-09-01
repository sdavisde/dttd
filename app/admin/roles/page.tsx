import { Permission, permissionLock, userHasPermission } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { getRoles } from '@/services/identity/roles'
import Roles from '@/app/admin/roles/components/Roles'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { isNil } from 'lodash'

export default async function RolesPage() {
  // Auth runs concurrently with the roles fetch; the redirect below still fires
  // before anything renders.
  const [userResult, rolesResult] = await Promise.all([
    getLoggedInUser(),
    getRoles(),
  ])
  const user = userResult?.data

  try {
    if (isErr(userResult) || isNil(user)) {
      throw new Error('User not found')
    }
    permissionLock([Permission.READ_USER_ROLES])(user)
  } catch (error) {
    redirect('/admin')
  }

  const canWrite = userHasPermission(user, [Permission.WRITE_USER_ROLES])

  if (isErr(rolesResult)) {
    throw new Error(`Failed to fetch roles: ${rolesResult.error}`)
  }

  return (
    <>
      <AdminBreadcrumbs
        title="Roles"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8">
        <Roles roles={rolesResult.data} readOnly={!canWrite} />
      </div>
    </>
  )
}
