import Roles from '@/app/admin/roles/components/Roles'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'

export default async function RolesPage() {

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
