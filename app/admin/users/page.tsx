import { permissionLock } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'
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

  return (
    <>
      <AdminBreadcrumbs
        title='Users'
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className='container mx-auto px-8'>
        <Users />
      </div>
    </>
  )
}
