import {
  bucketGroupsForBoard,
  deriveWeekendStats,
  nextGroupNumber,
  showStartPlanningRow,
} from './weekend-stats'
import type { ActiveWeekendMetrics } from '@/lib/payments/compute-totals'
import type { Weekend, WeekendGroupWithId } from '@/lib/weekend/types'

const NOW = new Date('2026-09-03T12:00:00Z')

function weekend(overrides: Partial<Weekend> = {}): Weekend {
  return {
    id: 'w1',
    start_date: '2026-10-16',
    end_date: '2026-10-19',
    number: 12,
    status: 'ACTIVE',
    title: null,
    type: 'MENS',
    groupId: 'g1',
    ...overrides,
  }
}

function group(
  mens: Partial<Weekend>,
  womens: Partial<Weekend>,
  groupId = 'g1'
): WeekendGroupWithId {
  return {
    groupId,
    weekends: {
      MENS: weekend({ type: 'MENS', ...mens }),
      WOMENS: weekend({ id: `${groupId}-w2`, type: 'WOMENS', ...womens }),
    },
  }
}

function metrics(
  overrides: Partial<ActiveWeekendMetrics> = {}
): ActiveWeekendMetrics {
  return {
    weekendType: 'MENS',
    weekendLabel: 'DTTD Mens #12',
    teamExpectedCount: 51,
    teamPaidCount: 45,
    teamExpectedTotal: 51 * 195,
    teamReceivedTotal: 45 * 195,
    candidateExpectedCount: 28,
    candidatePaidCount: 26,
    candidateExpectedTotal: 28 * 195,
    candidateReceivedTotal: 26 * 195,
    candidateExtraPaymentsCount: 0,
    teamExtraPaymentsCount: 0,
    ...overrides,
  }
}

describe('deriveWeekendStats', () => {
  it('derives all three tiles when every source is available', () => {
    const stats = deriveWeekendStats({
      candidateCount: 28,
      rosterCount: 51,
      financials: metrics(),
    })
    expect(stats).toEqual({
      candidatesConfirmed: 28,
      candidateCapacity: 42,
      teamServing: 51,
      // (51 - 45) unpaid team + (28 - 26) unpaid candidates
      feesOpen: 8,
    })
  })

  it('matches the dashboard fee formula and never counts negative gaps', () => {
    const stats = deriveWeekendStats({
      candidateCount: 10,
      rosterCount: 10,
      financials: metrics({
        teamExpectedCount: 10,
        teamPaidCount: 12, // overpaid — clamps to 0
        candidateExpectedCount: 10,
        candidatePaidCount: 7,
      }),
    })
    expect(stats.feesOpen).toBe(3)
  })

  it('keeps failed sources null so the UI omits those tiles', () => {
    const stats = deriveWeekendStats({
      candidateCount: null,
      rosterCount: null,
      financials: null,
    })
    expect(stats.candidatesConfirmed).toBeNull()
    expect(stats.teamServing).toBeNull()
    expect(stats.feesOpen).toBeNull()
    // Capacity is a constant, not a source.
    expect(stats.candidateCapacity).toBe(42)
  })
})

describe('bucketGroupsForBoard', () => {
  const active = group(
    { status: 'ACTIVE', start_date: '2026-10-16', end_date: '2026-10-19' },
    { status: 'ACTIVE', start_date: '2026-10-23', end_date: '2026-10-26' },
    'g-active'
  )
  const planned = group(
    { status: 'PLANNING', start_date: '2027-03-05', end_date: '2027-03-08' },
    { status: 'PLANNING', start_date: '2027-03-12', end_date: '2027-03-15' },
    'g-next'
  )
  const finished = group(
    { status: 'FINISHED', start_date: '2025-10-17', end_date: '2025-10-20' },
    { status: 'FINISHED', start_date: '2025-10-24', end_date: '2025-10-27' },
    'g-old'
  )

  it('separates active, upcoming, and past groups', () => {
    const buckets = bucketGroupsForBoard([finished, planned, active], NOW)
    expect(buckets.active?.groupId).toBe('g-active')
    expect(buckets.upcoming.map((g) => g.groupId)).toEqual(['g-next'])
    expect(buckets.past.map((g) => g.groupId)).toEqual(['g-old'])
  })

  it('treats a date-expired group as past even without FINISHED status', () => {
    const expired = group(
      { status: 'PLANNING', start_date: '2024-04-05', end_date: '2024-04-08' },
      { status: 'PLANNING', start_date: '2024-04-12', end_date: '2024-04-15' },
      'g-expired'
    )
    const buckets = bucketGroupsForBoard([expired], NOW)
    expect(buckets.past.map((g) => g.groupId)).toEqual(['g-expired'])
    expect(buckets.active).toBeNull()
  })

  it('sorts past groups newest first', () => {
    const older = group(
      { status: 'FINISHED', start_date: '2024-10-18', end_date: '2024-10-21' },
      { status: 'FINISHED', start_date: '2024-10-25', end_date: '2024-10-28' },
      'g-oldest'
    )
    const buckets = bucketGroupsForBoard([older, finished], NOW)
    expect(buckets.past.map((g) => g.groupId)).toEqual(['g-old', 'g-oldest'])
  })

  it('keeps an ACTIVE group in the active slot even when its dates passed', () => {
    const lingering = group(
      { status: 'ACTIVE', start_date: '2026-08-01', end_date: '2026-08-04' },
      { status: 'ACTIVE', start_date: '2026-08-08', end_date: '2026-08-11' },
      'g-lingering'
    )
    const buckets = bucketGroupsForBoard([lingering], NOW)
    expect(buckets.active?.groupId).toBe('g-lingering')
    expect(buckets.past).toHaveLength(0)
  })
})

describe('showStartPlanningRow', () => {
  it('shows the row only when no upcoming group exists', () => {
    const buckets = bucketGroupsForBoard([], NOW)
    expect(showStartPlanningRow(buckets)).toBe(true)

    const planned = group(
      { status: 'PLANNING', start_date: '2027-03-05', end_date: '2027-03-08' },
      { status: 'PLANNING', start_date: '2027-03-12', end_date: '2027-03-15' },
      'g-next'
    )
    const withPlanned = bucketGroupsForBoard([planned], NOW)
    expect(showStartPlanningRow(withPlanned)).toBe(false)
  })
})

describe('nextGroupNumber', () => {
  it('returns max weekend number + 1', () => {
    const groups = [
      group({ number: 11 }, { number: 11 }, 'g11'),
      group({ number: 12 }, { number: 12 }, 'g12'),
    ]
    expect(nextGroupNumber(groups)).toBe(13)
  })

  it('starts at 1 when numbers are missing', () => {
    expect(nextGroupNumber([])).toBe(1)
    expect(nextGroupNumber([group({ number: null }, { number: null })])).toBe(1)
  })
})
