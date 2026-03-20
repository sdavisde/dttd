import type { PaymentTransactionDTO } from '@/services/payment'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Net amount for a payment: use net_amount if available, otherwise gross (no fees for cash/check). */
function netOf(p: PaymentTransactionDTO): number {
  return p.net_amount ?? p.gross_amount
}

function isOnline(p: PaymentTransactionDTO): boolean {
  return p.payment_method === 'stripe'
}

function isTeam(p: PaymentTransactionDTO): boolean {
  return (
    p.target_type === 'weekend_roster' ||
    p.target_type === 'weekend_group_member'
  )
}

// ---------------------------------------------------------------------------
// Payment totals (used by PaymentsSummary)
// ---------------------------------------------------------------------------

export type PaymentTotals = {
  count: number
  gross: number
  net: number
  fees: number
  candidateGross: number
  teamGross: number
}

/** Accumulate totals from a list of payments. */
export function computePaymentTotals(
  payments: PaymentTransactionDTO[]
): PaymentTotals {
  const totals: PaymentTotals = {
    count: payments.length,
    gross: 0,
    net: 0,
    fees: 0,
    candidateGross: 0,
    teamGross: 0,
  }

  for (const p of payments) {
    totals.gross += p.gross_amount
    totals.net += netOf(p)
    totals.fees += p.stripe_fee ?? 0

    if (p.target_type === 'candidate') {
      totals.candidateGross += p.gross_amount
    } else if (isTeam(p)) {
      totals.teamGross += p.gross_amount
    }
  }

  return totals
}

// ---------------------------------------------------------------------------
// Weekend-grouped report (used by PaymentReport)
// ---------------------------------------------------------------------------

export type WeekendBreakdown = {
  weekendLabel: string
  weekendType: 'MENS' | 'WOMENS' | null
  candidateGross: number
  candidateNet: number
  candidateCount: number
  candidateOnlineGross: number
  candidateOfflineGross: number
  teamGross: number
  teamNet: number
  teamCount: number
  teamOnlineGross: number
  teamOfflineGross: number
  otherGross: number
  otherCount: number
  totalGross: number
  totalNet: number
  totalFees: number
  totalCount: number
  onlineNet: number
  offlineNet: number
  onlineGross: number
  offlineGross: number
}

export type WeekendGroup = {
  groupLabel: string
  weekends: WeekendBreakdown[]
}

/** Group payments by weekend title + type and compute per-group breakdowns. */
export function computeWeekendReport(
  payments: PaymentTransactionDTO[]
): WeekendGroup[] {
  // Group by weekend_title, then by weekend_type
  const weekendMap = new Map<string, Map<string, PaymentTransactionDTO[]>>()

  for (const p of payments) {
    const groupKey = p.weekend_title ?? 'No Weekend'
    const typeKey = p.weekend_type ?? 'unknown'

    if (!weekendMap.has(groupKey)) {
      weekendMap.set(groupKey, new Map())
    }
    const typeMap = weekendMap.get(groupKey)!
    if (!typeMap.has(typeKey)) {
      typeMap.set(typeKey, [])
    }
    typeMap.get(typeKey)!.push(p)
  }

  const groups: WeekendGroup[] = []

  for (const [groupLabel, typeMap] of weekendMap) {
    const weekends: WeekendBreakdown[] = []

    // Sort: MENS first, then WOMENS, then unknown
    const sortedTypes = [...typeMap.keys()].sort((a, b) => {
      if (a === 'MENS') return -1
      if (b === 'MENS') return 1
      if (a === 'WOMENS') return -1
      if (b === 'WOMENS') return 1
      return 0
    })

    for (const typeKey of sortedTypes) {
      const typePayments = typeMap.get(typeKey)!
      let candidateGross = 0,
        candidateNet = 0,
        candidateCount = 0,
        candidateOnlineGross = 0,
        candidateOfflineGross = 0
      let teamGross = 0,
        teamNet = 0,
        teamCount = 0,
        teamOnlineGross = 0,
        teamOfflineGross = 0
      let otherGross = 0,
        otherCount = 0
      let totalGross = 0,
        totalNet = 0,
        totalFees = 0,
        totalCount = 0
      let onlineNet = 0,
        offlineNet = 0,
        onlineGross = 0,
        offlineGross = 0

      for (const p of typePayments) {
        const pNet = netOf(p)
        const online = isOnline(p)
        totalGross += p.gross_amount
        totalNet += pNet
        totalFees += p.stripe_fee ?? 0
        totalCount++

        if (online) {
          onlineNet += pNet
          onlineGross += p.gross_amount
        } else {
          offlineNet += pNet
          offlineGross += p.gross_amount
        }

        if (p.target_type === 'candidate') {
          candidateGross += p.gross_amount
          candidateNet += pNet
          candidateCount++
          if (online) {
            candidateOnlineGross += p.gross_amount
          } else {
            candidateOfflineGross += p.gross_amount
          }
        } else if (isTeam(p)) {
          teamGross += p.gross_amount
          teamNet += pNet
          teamCount++
          if (online) {
            teamOnlineGross += p.gross_amount
          } else {
            teamOfflineGross += p.gross_amount
          }
        } else {
          otherGross += p.gross_amount
          otherCount++
        }
      }

      const weekendLabel =
        typeKey === 'MENS'
          ? "Men's Weekend"
          : typeKey === 'WOMENS'
            ? "Women's Weekend"
            : 'Unknown Weekend'

      weekends.push({
        weekendLabel,
        weekendType:
          typeKey === 'MENS' || typeKey === 'WOMENS' ? typeKey : null,
        candidateGross,
        candidateNet,
        candidateCount,
        candidateOnlineGross,
        candidateOfflineGross,
        teamGross,
        teamNet,
        teamCount,
        teamOnlineGross,
        teamOfflineGross,
        otherGross,
        otherCount,
        totalGross,
        totalNet,
        totalFees,
        totalCount,
        onlineNet,
        offlineNet,
        onlineGross,
        offlineGross,
      })
    }

    groups.push({ groupLabel, weekends })
  }

  return groups
}

export type ReportGrandTotals = {
  candidateGross: number
  candidateNet: number
  candidateCount: number
  candidateOnlineGross: number
  candidateOfflineGross: number
  teamGross: number
  teamNet: number
  teamCount: number
  teamOnlineGross: number
  teamOfflineGross: number
  totalGross: number
  totalNet: number
  totalFees: number
  totalCount: number
  onlineNet: number
  offlineNet: number
  onlineGross: number
  offlineGross: number
}

/** Sum all weekend breakdowns into grand totals. */
export function computeGrandTotals(groups: WeekendGroup[]): ReportGrandTotals {
  const totals: ReportGrandTotals = {
    candidateGross: 0,
    candidateNet: 0,
    candidateCount: 0,
    candidateOnlineGross: 0,
    candidateOfflineGross: 0,
    teamGross: 0,
    teamNet: 0,
    teamCount: 0,
    teamOnlineGross: 0,
    teamOfflineGross: 0,
    totalGross: 0,
    totalNet: 0,
    totalFees: 0,
    totalCount: 0,
    onlineNet: 0,
    offlineNet: 0,
    onlineGross: 0,
    offlineGross: 0,
  }

  for (const group of groups) {
    for (const w of group.weekends) {
      totals.candidateGross += w.candidateGross
      totals.candidateNet += w.candidateNet
      totals.candidateCount += w.candidateCount
      totals.candidateOnlineGross += w.candidateOnlineGross
      totals.candidateOfflineGross += w.candidateOfflineGross
      totals.teamGross += w.teamGross
      totals.teamNet += w.teamNet
      totals.teamCount += w.teamCount
      totals.teamOnlineGross += w.teamOnlineGross
      totals.teamOfflineGross += w.teamOfflineGross
      totals.totalGross += w.totalGross
      totals.totalNet += w.totalNet
      totals.totalFees += w.totalFees
      totals.totalCount += w.totalCount
      totals.onlineNet += w.onlineNet
      totals.offlineNet += w.offlineNet
      totals.onlineGross += w.onlineGross
      totals.offlineGross += w.offlineGross
    }
  }

  return totals
}

// ---------------------------------------------------------------------------
// Active weekend financials (used by dashboard widgets)
// ---------------------------------------------------------------------------

export type ActiveWeekendMetrics = {
  weekendType: 'MENS' | 'WOMENS'
  weekendLabel: string
  teamExpectedCount: number
  teamPaidCount: number
  teamExpectedTotal: number
  teamReceivedTotal: number
  candidateExpectedCount: number
  candidatePaidCount: number
  candidateExpectedTotal: number
  candidateReceivedTotal: number
}

export type ActiveWeekendFinancials = {
  weekends: ActiveWeekendMetrics[]
  teamExpectedTotal: number
  teamReceivedTotal: number
  candidateExpectedTotal: number
  candidateReceivedTotal: number
  overallExpectedTotal: number
  overallReceivedTotal: number
}

/**
 * Compute financial health metrics for the active weekend group.
 *
 * @param payments - All payments (will be filtered to active weekend IDs)
 * @param weekendIds - Map of weekend type to weekend ID for the active group
 * @param rosterCounts - Map of weekend ID to number of roster members
 * @param candidateCounts - Map of weekend ID to number of non-rejected candidates
 * @param teamFee - Team Stripe fee per person in dollars (cash price = this - $10)
 * @param candidateFee - Candidate Stripe fee per person in dollars (cash price = this - $10)
 */
export function computeActiveWeekendFinancials(
  payments: PaymentTransactionDTO[],
  weekendIds: Record<'MENS' | 'WOMENS', string>,
  rosterCounts: Record<string, number>,
  candidateCounts: Record<string, number>,
  teamFee: number,
  candidateFee: number
): ActiveWeekendFinancials {
  const activeWeekendIdSet = new Set(Object.values(weekendIds))
  const activePayments = payments.filter(
    (p) => p.weekend_id !== null && activeWeekendIdSet.has(p.weekend_id)
  )

  // Group payments by weekend_id
  const paymentsByWeekend = new Map<string, PaymentTransactionDTO[]>()
  for (const p of activePayments) {
    const wId = p.weekend_id! // safe because of filter above
    if (!paymentsByWeekend.has(wId)) {
      paymentsByWeekend.set(wId, [])
    }
    paymentsByWeekend.get(wId)!.push(p)
  }

  // Expected per person is the cash price (Stripe price minus $10).
  // Any extra collected via Stripe is cushion for processing fees.
  const STRIPE_SURCHARGE = 10
  const teamCashPrice = Math.max(teamFee - STRIPE_SURCHARGE, 0)
  const candidateCashPrice = Math.max(candidateFee - STRIPE_SURCHARGE, 0)

  const weekendMetrics: ActiveWeekendMetrics[] = []

  for (const [type, weekendId] of Object.entries(weekendIds) as [
    'MENS' | 'WOMENS',
    string,
  ][]) {
    const wPayments = paymentsByWeekend.get(weekendId) ?? []
    const teamPayments = wPayments.filter(isTeam)
    const candidatePayments = wPayments.filter(
      (p) => p.target_type === 'candidate'
    )

    const teamExpectedCount = rosterCounts[weekendId] ?? 0
    const candidateExpectedCount = candidateCounts[weekendId] ?? 0

    // Count unique payers (by target_id) to get "paid" counts
    const uniqueTeamPayers = new Set(teamPayments.map((p) => p.target_id))
    const uniqueCandidatePayers = new Set(
      candidatePayments.map((p) => p.target_id)
    )

    weekendMetrics.push({
      weekendType: type,
      weekendLabel: type === 'MENS' ? "Men's" : "Women's",
      teamExpectedCount,
      teamPaidCount: uniqueTeamPayers.size,
      teamExpectedTotal: teamExpectedCount * teamCashPrice,
      teamReceivedTotal: teamPayments.reduce(
        (sum, p) => sum + p.gross_amount,
        0
      ),
      candidateExpectedCount,
      candidatePaidCount: uniqueCandidatePayers.size,
      candidateExpectedTotal: candidateExpectedCount * candidateCashPrice,
      candidateReceivedTotal: candidatePayments.reduce(
        (sum, p) => sum + p.gross_amount,
        0
      ),
    })
  }

  const teamExpectedTotal = weekendMetrics.reduce(
    (s, w) => s + w.teamExpectedTotal,
    0
  )
  const teamReceivedTotal = weekendMetrics.reduce(
    (s, w) => s + w.teamReceivedTotal,
    0
  )
  const candidateExpectedTotal = weekendMetrics.reduce(
    (s, w) => s + w.candidateExpectedTotal,
    0
  )
  const candidateReceivedTotal = weekendMetrics.reduce(
    (s, w) => s + w.candidateReceivedTotal,
    0
  )

  return {
    weekends: weekendMetrics,
    teamExpectedTotal,
    teamReceivedTotal,
    candidateExpectedTotal,
    candidateReceivedTotal,
    overallExpectedTotal: teamExpectedTotal + candidateExpectedTotal,
    overallReceivedTotal: teamReceivedTotal + candidateReceivedTotal,
  }
}
