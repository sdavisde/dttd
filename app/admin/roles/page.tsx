import { Permission, permissionLock } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'
import { getRoles } from '@/actions/roles'
import Roles from '@/app/admin/roles/components/Roles'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'

export default async function RolesPage() {
  const userResult = await getLoggedInUser()
  const user = userResult?.data

  try {
    if (isErr(userResult) || !user) {
      throw new Error('User not found')
    }
    permissionLock([Permission.ROLES_MANAGEMENT])(user)
  } catch (error) {
    redirect('/')
  }

  // Fetch roles data on the server
  const rolesResult = await getRoles()

  if (isErr(rolesResult)) {
    throw new Error(`Failed to fetch roles: ${rolesResult.error.message}`)
  }

  return (
    <>
      <AdminBreadcrumbs
        title="Roles"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8">
        <Roles roles={rolesResult.data} />
      </div>
    </>
  )
}
