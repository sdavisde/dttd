import {
  buildLedgerRows,
  computeLedgerStats,
  derivePaymentStatus,
  filterLedgerRows,
  formatLedgerFor,
  formatLedgerRole,
  ledgerYears,
  parseLedgerStatusFilter,
  type LedgerFilter,
} from './ledger'
import type { OutstandingFee } from './outstanding'
import { isCollected, isWaived } from './waived'
import { makePayment } from './test-fixtures'

const paid = makePayment({ id: 'paid-1' })
const paidLastYear = makePayment({
  id: 'paid-2025',
  created_at: '2025-03-22T15:00:00.000Z',
  target_name: 'Karen Ortiz',
  payment_owner: 'Karen Ortiz',
  target_type: 'weekend_group_member',
  cha_role: 'Head Dining',
  weekend_number: 11,
  weekend_type: 'WOMENS',
})
const waived = makePayment({
  id: 'waived-1',
  payment_method: 'waived',
  payment_owner: 'DTTD Community',
  target_name: 'Sam Whitfield',
  created_at: '2026-08-15T15:00:00.000Z',
})
const voided = makePayment({
  id: 'voided-1',
  voided_at: '2026-08-30T00:00:00.000Z',
  void_reason: 'Bounced check',
  created_at: '2026-08-10T15:00:00.000Z',
})

const openFee: OutstandingFee = {
  targetType: 'candidate',
  targetId: 'candidate-9',
  legacyTargetIds: [],
  name: 'Luis Moreno',
  expectedPayer: 'Tom Bailey',
  chaRole: null,
  weekendId: 'weekend-mens',
  weekendNumber: 12,
  weekendType: 'MENS',
  feeAmount: 185,
  coveredSoFar: 0,
  amountDue: 185,
}

const rows = buildLedgerRows([paidLastYear, voided, waived, paid], [openFee])

const filter = (overrides: Partial<LedgerFilter> = {}): LedgerFilter => ({
  status: 'all',
  year: null,
  showVoided: false,
  currentYear: 2026,
  search: '',
  weekends: [],
  types: [],
  roles: [],
  methods: [],
  ...overrides,
})

const ids = (overrides: Partial<LedgerFilter> = {}) =>
  filterLedgerRows(rows, filter(overrides)).map((row) => row.id)

describe('waived helpers', () => {
  it('a waived row is covered but never collected', () => {
    expect(isWaived(waived)).toBe(true)
    expect(isCollected(waived)).toBe(false)
    expect(isCollected(paid)).toBe(true)
    expect(isCollected(voided)).toBe(false)
  })
})

describe('derivePaymentStatus', () => {
  it('derives paid, waived and voided', () => {
    expect(derivePaymentStatus(paid)).toBe('paid')
    expect(derivePaymentStatus(waived)).toBe('waived')
    expect(derivePaymentStatus(voided)).toBe('voided')
  })

  it('lets a void win over a waiver', () => {
    expect(
      derivePaymentStatus({ payment_method: 'waived', voided_at: '2026-01-01' })
    ).toBe('voided')
  })
})

describe('buildLedgerRows', () => {
  it('orders payments most recent first with unpaid fees at the end', () => {
    expect(rows.map((row) => row.id)).toEqual([
      'paid-1',
      'waived-1',
      'voided-1',
      'paid-2025',
      'outstanding:candidate:candidate-9',
    ])
  })

  it('gives outstanding rows no method and no date', () => {
    const row = rows[rows.length - 1]
    expect(row.status).toBe('outstanding')
    expect(row.method).toBeNull()
    expect(row.date).toBeNull()
    expect(row.amount).toBe(185)
    expect(row.paidBy).toBe('Tom Bailey')
  })
})

describe('formatLedgerFor', () => {
  it('merges fee type and person', () => {
    expect(formatLedgerFor(rows[0])).toBe('Candidate fee · David Park')
  })

  it('says herself/himself when the payer is the person', () => {
    const karen = rows.find((row) => row.id === 'paid-2025')!
    expect(formatLedgerFor(karen)).toBe('Team fee · herself')
  })

  it('falls back to the fee type alone when the person is unknown', () => {
    const [row] = buildLedgerRows(
      [makePayment({ type: 'donation', target_type: null, target_name: null })],
      []
    )
    expect(formatLedgerFor(row)).toBe('Donation')
  })
})

describe('formatLedgerRole', () => {
  it('shows the CHA role a team member serves in', () => {
    expect(formatLedgerRole('weekend_group_member', 'Head Dining')).toBe(
      'Head Dining'
    )
    expect(formatLedgerRole('weekend_roster', 'Rover')).toBe('Rover')
  })

  it('calls a candidate a candidate, whatever the role column says', () => {
    expect(formatLedgerRole('candidate', null)).toBe('Candidate')
    expect(formatLedgerRole('candidate', 'Rover')).toBe('Candidate')
  })

  it('shows a dash rather than inventing a role', () => {
    expect(formatLedgerRole('weekend_group_member', null)).toBe('—')
    expect(formatLedgerRole('weekend_roster', '  ')).toBe('—')
    expect(formatLedgerRole(null, null)).toBe('—')
  })

  it('lands on the rows the table renders', () => {
    const karen = rows.find((row) => row.id === 'paid-2025')!
    expect(karen.roleLabel).toBe('Head Dining')
    expect(rows[0].roleLabel).toBe('Candidate')
    expect(rows[rows.length - 1].roleLabel).toBe('Candidate')
  })
})

describe('filterLedgerRows', () => {
  it('hides voided rows by default and shows them on request', () => {
    expect(ids()).not.toContain('voided-1')
    expect(ids({ showVoided: true })).toContain('voided-1')
  })

  it('filters by status', () => {
    expect(ids({ status: 'outstanding' })).toEqual([
      'outstanding:candidate:candidate-9',
    ])
    expect(ids({ status: 'waived' })).toEqual(['waived-1'])
    expect(ids({ status: 'paid' })).toEqual(['paid-1', 'paid-2025'])
  })

  it('keeps a voided payment under Paid when voided rows are shown', () => {
    expect(ids({ status: 'paid', showVoided: true })).toContain('voided-1')
    expect(ids({ status: 'waived', showVoided: true })).not.toContain(
      'voided-1'
    )
  })

  it('places outstanding fees in the current year only', () => {
    expect(ids({ year: 2026 })).toContain('outstanding:candidate:candidate-9')
    expect(ids({ year: 2025 })).toEqual(['paid-2025'])
  })

  it('finds a person by who paid or who it was for', () => {
    expect(ids({ search: 'moreno' })).toEqual([
      'outstanding:candidate:candidate-9',
    ])
    expect(ids({ search: 'tom bailey' })).toEqual([
      'outstanding:candidate:candidate-9',
    ])
  })

  it('applies the weekend, type, role and method filters', () => {
    expect(ids({ types: ['Team'] })).toEqual(['paid-2025'])
    expect(ids({ roles: ['Head Dining'] })).toEqual(['paid-2025'])
    expect(ids({ methods: ['Waived'] })).toEqual(['waived-1'])
    const womens = rows.find((row) => row.id === 'paid-2025')!.weekendLabel
    expect(ids({ weekends: [womens] })).toEqual(['paid-2025'])
  })
})

describe('ledgerYears', () => {
  it('lists years with payments, newest first', () => {
    expect(ledgerYears(rows)).toEqual([2026, 2025])
  })
})

describe('parseLedgerStatusFilter', () => {
  it('accepts the deep-link values and falls back to all', () => {
    expect(parseLedgerStatusFilter('outstanding')).toBe('outstanding')
    expect(parseLedgerStatusFilter('WAIVED')).toBe('waived')
    expect(parseLedgerStatusFilter('nonsense')).toBe('all')
    expect(parseLedgerStatusFilter(null)).toBe('all')
  })
})

describe('computeLedgerStats', () => {
  const stats = computeLedgerStats(
    [paid, paidLastYear, waived, voided],
    [openFee],
    new Date('2026-09-21T12:00:00.000Z')
  )

  it('counts only real money from this year as collected', () => {
    expect(stats.year).toBe(2026)
    expect(stats.collectedTotal).toBe(185)
    expect(stats.collectedCount).toBe(1)
  })

  it('reports waived fees separately', () => {
    expect(stats.waivedCount).toBe(1)
    expect(stats.waivedTotal).toBe(185)
  })

  it('sums what is owed right now', () => {
    expect(stats.outstandingCount).toBe(1)
    expect(stats.outstandingTotal).toBe(185)
  })
})

describe('overpaid rows', () => {
  const overpaidAccount = {
    ...openFee,
    targetId: 'candidate-7',
    name: 'Jo Rivers',
    groupId: 'group-12',
    standing: 'dropped' as const,
    paidOnline: false,
    feeAmount: 0,
    coveredSoFar: 200,
    amountDue: 0,
    amountOver: 200,
  }
  const giftAccount = {
    ...overpaidAccount,
    targetId: 'member-sd',
    standing: 'exempt' as const,
  }
  const withOverpaid = buildLedgerRows(
    [paid],
    [openFee],
    [overpaidAccount, giftAccount]
  )
  const view = (status: LedgerFilter['status']) =>
    filterLedgerRows(withOverpaid, filter({ status })).map((row) => row.id)

  it('shows the amount over and why, only under the Overpaid filter', () => {
    const row = withOverpaid.find(
      (r) => r.id === 'overpaid:candidate:candidate-7'
    )
    expect(row).toMatchObject({ status: 'overpaid', amount: 200 })
    expect(row?.note).toMatch(/Dropped/)
    expect(view('all')).not.toContain('overpaid:candidate:candidate-7')
    expect(view('overpaid')).toEqual([
      'overpaid:candidate:candidate-7',
      'overpaid:candidate:member-sd',
    ])
  })

  it('counts overpaid people for the tile, leaving exempt gifts out', () => {
    const stats = computeLedgerStats(
      [paid],
      [openFee],
      new Date('2026-09-24T12:00:00Z'),
      [overpaidAccount, giftAccount]
    )
    expect(stats.overpaidCount).toBe(1)
  })

  it('parses the overpaid filter from the URL', () => {
    expect(parseLedgerStatusFilter('overpaid')).toBe('overpaid')
  })
})
