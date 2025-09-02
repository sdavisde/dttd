import { Permission, userHasPermission } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/actions/users'
import { getAllPayments } from '@/actions/payments'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Payments } from './components/Payments'

export default async function PaymentsPage() {
  const userResult = await getLoggedInUser()
  const user = userResult?.data

  try {
    if (isErr(userResult) || !user) {
      throw new Error('User not found')
    }
  } catch (error) {
    redirect('/')
  }

  // Check permissions - assuming FULL_ACCESS can view all payments
  if (!userHasPermission(user, [Permission.FULL_ACCESS])) {
    redirect('/admin')
  }

  // Fetch payments data
  const paymentsResult = await getAllPayments()

  if (isErr(paymentsResult)) {
    throw new Error(`Failed to fetch payments: ${paymentsResult.error.message}`)
  }

  return (
    <>
      <AdminBreadcrumbs
        title="Payments"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8">
        <Payments payments={paymentsResult.data} />
      </div>
    </>
  )
}
