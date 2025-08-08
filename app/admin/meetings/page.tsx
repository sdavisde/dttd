import { getLoggedInUser } from '@/actions/users'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Meetings } from './components/Meetings'

export default async function MeetingsPage() {
  return (
    <>
      <AdminBreadcrumbs
        title='Meetings'
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className='container mx-auto px-8 pb-8'>
        <Meetings />
      </div>
    </>
  )
}