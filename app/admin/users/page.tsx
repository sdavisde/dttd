import { permissionLock } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser, getUsers } from '@/actions/users'
import { getRoles } from '@/actions/roles'
import Users from './components/Users'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'

export default async function UsersPage() {
  const userResult = await getLoggedInUser()
  const user = userResult?.data

  try {
    if (isErr(userResult) || !user) {
      throw new Error('User not found')
    }
    permissionLock(['USER_MANAGEMENT'])(user)
  } catch (error) {
    redirect('/')
  }

  // Fetch users and roles data on the server
  const [usersResult, rolesResult] = await Promise.all([
    getUsers(),
    getRoles(),
  ])

  if (isErr(usersResult)) {
    throw new Error(`Failed to fetch users: ${usersResult.error.message}`)
  }

  if (isErr(rolesResult)) {
    throw new Error(`Failed to fetch roles: ${rolesResult.error.message}`)
  }

  return (
    <>
      <AdminBreadcrumbs
        title="Master Roster"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8">
        <Users users={usersResult.data} roles={rolesResult.data} />
      </div>
    </>
  )
}
