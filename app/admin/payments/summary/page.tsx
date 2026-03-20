import { Permission, userHasPermission } from '@/lib/security'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { getAllPayments, getTeamFee, getCandidateFee } from '@/services/payment'
import { getActiveWeekends } from '@/services/weekend'
import { getCandidateCountByWeekend } from '@/services/candidates/actions'
import { findWeekendRoster } from '@/services/weekend/repository'
import { isErr, isOk } from '@/lib/results'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import { isNil } from 'lodash'
import { PaymentReport } from './components/PaymentReport'
import { computeActiveWeekendFinancials } from '@/lib/payments/compute-totals'
import type { ActiveWeekendFinancials } from '@/lib/payments/compute-totals'

export default async function PaymentSummaryPage() {
  const userResult = await getLoggedInUser()
  const user = userResult?.data

  if (isErr(userResult) || isNil(user)) {
    redirect('/')
  }

  if (!userHasPermission(user, [Permission.READ_PAYMENTS])) {
    redirect('/admin')
  }

  // Stage 1: Fetch payments, active weekends, and fee prices in parallel
  const [
    paymentsResult,
    activeWeekendsResult,
    teamFeeResult,
    candidateFeeResult,
  ] = await Promise.all([
    getAllPayments(),
    getActiveWeekends(),
    getTeamFee(),
    getCandidateFee(),
  ])

  if (isErr(paymentsResult)) {
    throw new Error(`Failed to fetch payments: ${paymentsResult.error}`)
  }

  // Stage 2: If active weekends exist, fetch roster and candidate counts
  let activeWeekendFinancials: ActiveWeekendFinancials | null = null

  if (isOk(activeWeekendsResult)) {
    const activeWeekends = activeWeekendsResult.data
    const mensWeekend = activeWeekends.MENS
    const womensWeekend = activeWeekends.WOMENS

    const [mensRoster, womensRoster, mensCandidateCount, womensCandidateCount] =
      await Promise.all([
        findWeekendRoster(mensWeekend.id),
        findWeekendRoster(womensWeekend.id),
        getCandidateCountByWeekend(mensWeekend.id),
        getCandidateCountByWeekend(womensWeekend.id),
      ])

    const rosterCounts: Record<string, number> = {
      [mensWeekend.id]: isOk(mensRoster) ? mensRoster.data.length : 0,
      [womensWeekend.id]: isOk(womensRoster) ? womensRoster.data.length : 0,
    }

    const candidateCounts: Record<string, number> = {
      [mensWeekend.id]: isOk(mensCandidateCount) ? mensCandidateCount.data : 0,
      [womensWeekend.id]: isOk(womensCandidateCount)
        ? womensCandidateCount.data
        : 0,
    }

    const teamFee =
      isOk(teamFeeResult) && !isNil(teamFeeResult.data.unitAmount)
        ? teamFeeResult.data.unitAmount / 100
        : 0
    const candidateFee =
      isOk(candidateFeeResult) && !isNil(candidateFeeResult.data.unitAmount)
        ? candidateFeeResult.data.unitAmount / 100
        : 0

    activeWeekendFinancials = computeActiveWeekendFinancials(
      paymentsResult.data,
      { MENS: mensWeekend.id, WOMENS: womensWeekend.id },
      rosterCounts,
      candidateCounts,
      teamFee,
      candidateFee
    )
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
        <PaymentReport
          payments={paymentsResult.data}
          activeWeekendFinancials={activeWeekendFinancials}
        />
      </div>
    </>
  )
}
