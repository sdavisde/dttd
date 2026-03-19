import { Permission, userHasPermission } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { getAllPayments } from '@/services/payment'
import { isErr } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { isNil } from 'lodash'
import { PaymentReport } from './components/PaymentReport'

export default async function PaymentSummaryPage() {
  const userResult = await getLoggedInUser()
  const user = userResult?.data

  if (isErr(userResult) || isNil(user)) {
    redirect('/')
  }

  if (!userHasPermission(user, [Permission.READ_PAYMENTS])) {
    redirect('/admin')
  }

  const paymentsResult = await getAllPayments()

  if (isErr(paymentsResult)) {
    throw new Error(`Failed to fetch payments: ${paymentsResult.error}`)
  }

  return (
    <>
      <AdminBreadcrumbs
        title="Payment Report"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Payments', href: '/admin/payments' },
        ]}
      />
      <div className="container mx-auto px-8">
        <PaymentReport payments={paymentsResult.data} />
      </div>
    </>
  )
}
