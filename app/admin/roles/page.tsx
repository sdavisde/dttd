import { Permission, permissionLock, userHasPermission } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { getRoles } from '@/services/identity/roles'
import Roles from '@/app/admin/roles/components/Roles'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { isNil } from 'lodash'

export default async function RolesPage() {
  const userResult = await getLoggedInUser()
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

  // Fetch roles data on the server
  const rolesResult = await getRoles()

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
