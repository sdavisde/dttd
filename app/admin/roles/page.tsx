import { getValidatedUserWithPermissions } from '@/lib/security'
import { redirect } from 'next/navigation'
import Roles from '@/app/admin/roles/components/Roles'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { User } from '@/lib/users/types'

export default async function RolesPage() {
  let user: User

  try {
    user = await getValidatedUserWithPermissions(['ROLES_MANAGEMENT'])
  } catch (error) {
    redirect('/')
  }

  return (
    <>
      <AdminBreadcrumbs
        title='Roles'
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className='container mx-auto px-8'>
        <Roles />
      </div>
    </>
  )
}
