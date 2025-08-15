import { isErr } from '@/lib/results'
import Users from './components/Users'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { getUsers } from '@/actions/users'
import { getRoles } from '@/actions/roles'

export default async function UsersPage() {
  // Fetch users and roles data on the server
  const [usersResult, rolesResult] = await Promise.all([getUsers(), getRoles()])

  if (isErr(usersResult)) {
    throw new Error(`Failed to fetch users: ${usersResult.error.message}`)
  }

  if (isErr(rolesResult)) {
    throw new Error(`Failed to fetch roles: ${rolesResult.error.message}`)
  }

  const canEditUsers = userHasPermission(user, [Permission.USER_MANAGEMENT])

  return (
    <>
      <AdminBreadcrumbs
        title="Master Roster"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8">
        <Users
          users={usersResult.data}
          roles={rolesResult.data}
          canEditUsers={canEditUsers}
        />
      </div>
    </>
  )
}
