import Users from './components/Users'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'

export default async function UsersPage() {

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
