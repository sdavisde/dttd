import { getRoles } from '@/actions/roles'
import Roles from '@/app/admin/roles/components/Roles'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { isErr } from '@/lib/results'

export default async function RolesPage() {
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
