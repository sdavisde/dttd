import { Permission, userHasPermission } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import {
  FEE_LOOKUP_FAILED,
  getAllPaymentsIncludingVoided,
  getCandidateFee,
  getOutstandingFees,
  getTeamFee,
} from '@/services/payment'
import { getActiveWeekends } from '@/services/weekend'
import { isErr, isOk } from '@/lib/results'
import * as Results from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { cashPriceOf } from '@/lib/payments/compute-totals'
import type { OutstandingFee } from '@/lib/payments/outstanding'
import { Payments } from './components/Payments'
import { isNil } from 'lodash'

export default async function PaymentsPage() {
  // Auth runs concurrently with the data fetches; the redirects below still
  // fire before anything renders.
  // Payments include voided rows so corrections stay visible behind a toggle.
  // The table hides them by default and never counts them in totals.
  const [
    userResult,
    paymentsResult,
    activeWeekendsResult,
    teamFeeResult,
    candidateFeeResult,
  ] = await Promise.all([
    getLoggedInUser(),
    getAllPaymentsIncludingVoided(),
    getActiveWeekends(),
    getTeamFee(),
    getCandidateFee(),
  ])
  const user = userResult?.data

  try {
    if (isErr(userResult) || isNil(user)) {
      throw new Error('User not found')
    }
  } catch (error) {
    redirect('/')
  }

  if (!userHasPermission(user, [Permission.READ_PAYMENTS])) {
    redirect('/admin')
  }

  if (isErr(paymentsResult)) {
    throw new Error(`Failed to fetch payments: ${paymentsResult.error}`)
  }

  // Outstanding fees are calculated from the active group's rosters and
  // candidates on every load — never stored. When they can't be worked out
  // the page still renders; the tile says why instead of showing a $0.
  let outstandingFees: OutstandingFee[] = []
  let outstandingUnavailable:
    | 'no-active-weekend'
    | 'fees-unknown'
    | 'error'
    | null = null

  if (isErr(activeWeekendsResult)) {
    outstandingUnavailable = 'no-active-weekend'
  } else {
    const outstandingResult = await getOutstandingFees({
      payments: paymentsResult.data,
      activeWeekends: activeWeekendsResult.data,
    })
    Results.logFailures(outstandingResult)
    if (isOk(outstandingResult)) {
      outstandingFees = outstandingResult.data
    } else {
      outstandingUnavailable =
        outstandingResult.error === FEE_LOOKUP_FAILED ? 'fees-unknown' : 'error'
    }
  }

  // Suggested amounts for "Record a payment": the cash price, which is what
  // someone paying by hand owes.
  const cashPrice = (result: typeof teamFeeResult) =>
    isOk(result) && !isNil(result.data.unitAmount)
      ? cashPriceOf(result.data.unitAmount / 100)
      : null

  return (
    <>
      <AdminBreadcrumbs
        title="Payments"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="container mx-auto px-4 py-6 sm:px-8">
        <Payments
          payments={paymentsResult.data}
          outstandingFees={outstandingFees}
          outstandingUnavailable={outstandingUnavailable}
          feeDefaults={{
            team: cashPrice(teamFeeResult),
            candidate: cashPrice(candidateFeeResult),
          }}
          user={user}
        />
      </div>
    </>
  )
}
