import type { PaymentTransactionDTO } from '@/services/payment'

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
    totals.net += p.net_amount ?? 0
    totals.fees += p.stripe_fee ?? 0

    if (p.target_type === 'candidate') {
      totals.candidateGross += p.gross_amount
    } else if (
      p.target_type === 'weekend_roster' ||
      p.target_type === 'weekend_group_member'
    ) {
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
  teamGross: number
  teamNet: number
  teamCount: number
  otherGross: number
  otherCount: number
  totalGross: number
  totalNet: number
  totalFees: number
  totalCount: number
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
        candidateCount = 0
      let teamGross = 0,
        teamNet = 0,
        teamCount = 0
      let otherGross = 0,
        otherCount = 0
      let totalGross = 0,
        totalNet = 0,
        totalFees = 0,
        totalCount = 0

      for (const p of typePayments) {
        totalGross += p.gross_amount
        totalNet += p.net_amount ?? 0
        totalFees += p.stripe_fee ?? 0
        totalCount++

        if (p.target_type === 'candidate') {
          candidateGross += p.gross_amount
          candidateNet += p.net_amount ?? 0
          candidateCount++
        } else if (
          p.target_type === 'weekend_roster' ||
          p.target_type === 'weekend_group_member'
        ) {
          teamGross += p.gross_amount
          teamNet += p.net_amount ?? 0
          teamCount++
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
        teamGross,
        teamNet,
        teamCount,
        otherGross,
        otherCount,
        totalGross,
        totalNet,
        totalFees,
        totalCount,
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
  teamGross: number
  teamNet: number
  teamCount: number
  totalGross: number
  totalNet: number
  totalFees: number
  totalCount: number
}

/** Sum all weekend breakdowns into grand totals. */
export function computeGrandTotals(groups: WeekendGroup[]): ReportGrandTotals {
  const totals: ReportGrandTotals = {
    candidateGross: 0,
    candidateNet: 0,
    candidateCount: 0,
    teamGross: 0,
    teamNet: 0,
    teamCount: 0,
    totalGross: 0,
    totalNet: 0,
    totalFees: 0,
    totalCount: 0,
  }

  for (const group of groups) {
    for (const w of group.weekends) {
      totals.candidateGross += w.candidateGross
      totals.candidateNet += w.candidateNet
      totals.candidateCount += w.candidateCount
      totals.teamGross += w.teamGross
      totals.teamNet += w.teamNet
      totals.teamCount += w.teamCount
      totals.totalGross += w.totalGross
      totals.totalNet += w.totalNet
      totals.totalFees += w.totalFees
      totals.totalCount += w.totalCount
    }
  }

  return totals
}
