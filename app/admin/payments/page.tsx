import { Permission, userHasPermission } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { getAllPaymentsIncludingVoided } from '@/services/payment'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { Payments } from './components/Payments'
import { isNil } from 'lodash'

export default async function PaymentsPage() {
  // Auth runs concurrently with the payments fetch; the redirects below still
  // fire before anything renders.
  // Payments include voided rows so corrections stay visible behind a toggle.
  // The table hides them by default and never counts them in totals.
  const [userResult, paymentsResult] = await Promise.all([
    getLoggedInUser(),
    getAllPaymentsIncludingVoided(),
  ])
  const user = userResult?.data

  try {
    if (isErr(userResult) || isNil(user)) {
      throw new Error('User not found')
    }
  } catch (error) {
    redirect('/')
  }

  // Check permissions - assuming FULL_ACCESS can view all payments
  if (!userHasPermission(user, [Permission.READ_PAYMENTS])) {
    redirect('/admin')
  }

  if (isErr(paymentsResult)) {
    throw new Error(`Failed to fetch payments: ${paymentsResult.error}`)
  }

  return (
    <>
      <AdminBreadcrumbs
        title="Payments"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-8">
        <Payments payments={paymentsResult.data} user={user} />
      </div>
    </>
  )
}
