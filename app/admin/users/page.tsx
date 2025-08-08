import { getValidatedUserWithPermissions } from '@/lib/security'
import { redirect } from 'next/navigation'
import Users from './components/Users'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { User } from '@/lib/users/types'

export default async function UsersPage() {
  let user: User

  try {
    user = await getValidatedUserWithPermissions(['USER_MANAGEMENT'])
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
