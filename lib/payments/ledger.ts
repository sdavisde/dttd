import { isNil } from 'lodash'
import type { PaymentTransactionDTO } from '@/services/payment'
import { formatWeekendLabelFor } from '@/lib/weekend'
import {
  formatCurrency,
  formatPaymentMethod,
  formatTargetType,
  formatWeekendLabel,
} from './formatters'
import type { OutstandingFee } from './outstanding'
import { isCollected, isWaived } from './waived'

// The admin Payments ledger shows two kinds of row in one table: payments on
// record (paid, waived, or voided) and fees still owed, which are calculated
// rather than stored. Everything here is pure so it can be unit-tested and
// shared by the table, the stat tiles and the CSV export.

export type LedgerStatus = 'paid' | 'waived' | 'outstanding' | 'voided'

/** The segmented control's values. `all` is the default and stays off the URL. */
export const LEDGER_STATUS_FILTERS = [
  'all',
  'outstanding',
  'paid',
  'waived',
] as const
export type LedgerStatusFilter = (typeof LEDGER_STATUS_FILTERS)[number]

export function parseLedgerStatusFilter(
  raw: string | null | undefined
): LedgerStatusFilter {
  const value = (raw ?? '').toLowerCase()
  return LEDGER_STATUS_FILTERS.find((candidate) => candidate === value) ?? 'all'
}

export type LedgerRow = {
  id: string
  status: LedgerStatus
  /**
   * What the row is underneath a void — a voided waiver still belongs under
   * the Waived tab when voided rows are shown.
   */
  baseStatus: Exclude<LedgerStatus, 'voided'>
  /** The stored payment; null for a calculated outstanding fee. */
  payment: PaymentTransactionDTO | null
  /** The calculated fee; null for a stored payment. */
  outstanding: OutstandingFee | null
  paidBy: string | null
  /** "Candidate fee", "Team fee", "Donation" or "Other". */
  feeLabel: string
  personName: string | null
  /** "Candidate" / "Team" / "Other" — what the Type chip filters on. */
  typeLabel: string
  /** The CHA role served, "Candidate", or an em dash. See formatLedgerRole. */
  roleLabel: string
  weekendLabel: string
  weekendType: 'MENS' | 'WOMENS' | null
  amount: number
  /** Null for outstanding rows: nothing has been paid, so there is no method. */
  method: PaymentTransactionDTO['payment_method'] | null
  /** ISO timestamp; null for outstanding rows. */
  date: string | null
}

/** Status of a stored payment. A void wins over everything else. */
export function derivePaymentStatus(
  payment: Pick<PaymentTransactionDTO, 'payment_method' | 'voided_at'>
): Exclude<LedgerStatus, 'outstanding'> {
  if (!isNil(payment.voided_at)) return 'voided'
  return isWaived(payment) ? 'waived' : 'paid'
}

function feeLabelFor(
  type: PaymentTransactionDTO['type'],
  targetType: PaymentTransactionDTO['target_type']
): string {
  if (type === 'donation') return 'Donation'
  switch (targetType) {
    case 'candidate':
      return 'Candidate fee'
    case 'weekend_roster':
    case 'weekend_group_member':
      return 'Team fee'
    default:
      return 'Other'
  }
}

/**
 * The Role cell: which CHA role the person served in on the weekend the
 * payment is for. Candidates are guests rather than team, so they read
 * "Candidate"; a donation, or a team member we can't place on a roster, reads
 * as an em dash rather than an invented role.
 */
export function formatLedgerRole(
  targetType: PaymentTransactionDTO['target_type'],
  chaRole: string | null
): string {
  if (targetType === 'candidate') return 'Candidate'
  const role = (chaRole ?? '').trim()
  return role !== '' ? role : '—'
}

function paymentToRow(payment: PaymentTransactionDTO): LedgerRow {
  return {
    id: payment.id,
    status: derivePaymentStatus(payment),
    baseStatus: isWaived(payment) ? 'waived' : 'paid',
    payment,
    outstanding: null,
    paidBy: payment.payment_owner,
    feeLabel: feeLabelFor(payment.type, payment.target_type),
    personName: payment.target_name,
    typeLabel: formatTargetType(payment.target_type),
    roleLabel: formatLedgerRole(payment.target_type, payment.cha_role),
    weekendLabel: formatWeekendLabel(payment),
    weekendType: payment.weekend_type,
    amount: payment.gross_amount,
    method: payment.payment_method,
    date: payment.created_at,
  }
}

function outstandingToRow(fee: OutstandingFee): LedgerRow {
  return {
    id: `outstanding:${fee.targetType}:${fee.targetId}`,
    status: 'outstanding',
    baseStatus: 'outstanding',
    payment: null,
    outstanding: fee,
    paidBy: fee.expectedPayer,
    feeLabel: feeLabelFor('fee', fee.targetType),
    personName: fee.name,
    typeLabel: formatTargetType(fee.targetType),
    roleLabel: formatLedgerRole(fee.targetType, fee.chaRole),
    weekendLabel:
      isNil(fee.weekendNumber) && isNil(fee.weekendType)
        ? 'Unknown'
        : formatWeekendLabelFor({
            number: fee.weekendNumber,
            gender: fee.weekendType,
          }),
    weekendType: fee.weekendType,
    amount: fee.amountDue,
    method: null,
    date: null,
  }
}

/**
 * One list for the table: payments most recent first, unpaid fees at the end
 * (by weekend, then name, so the tail reads like a roster).
 */
export function buildLedgerRows(
  payments: PaymentTransactionDTO[],
  outstandingFees: OutstandingFee[]
): LedgerRow[] {
  const paymentRows = payments
    .map(paymentToRow)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  const outstandingRows = outstandingFees.map(outstandingToRow).sort((a, b) => {
    const byWeekend = a.weekendLabel.localeCompare(b.weekendLabel)
    return byWeekend !== 0
      ? byWeekend
      : (a.personName ?? '').localeCompare(b.personName ?? '')
  })
  return [...paymentRows, ...outstandingRows]
}

/**
 * The "For" cell: fee type and person merged, e.g. "Candidate fee · David
 * Park". When the payer is the person the fee is for, the name would only
 * repeat the Paid by column, so it reads "himself" / "herself" instead.
 */
export function formatLedgerFor(row: LedgerRow): string {
  const person = (row.personName ?? '').trim()
  if (person === '') return row.feeLabel

  const payer = (row.paidBy ?? '').trim()
  const isSelf = payer !== '' && payer.toLowerCase() === person.toLowerCase()
  if (isSelf && row.weekendType === 'MENS') return `${row.feeLabel} · himself`
  if (isSelf && row.weekendType === 'WOMENS') {
    return `${row.feeLabel} · herself`
  }
  return `${row.feeLabel} · ${person}`
}

/** Calendar year a row belongs to; null for outstanding rows (they are "now"). */
export function ledgerRowYear(row: LedgerRow): number | null {
  return isNil(row.date) ? null : new Date(row.date).getFullYear()
}

/** Years that have at least one payment, newest first, for the Date chip. */
export function ledgerYears(rows: LedgerRow[]): number[] {
  const years = new Set<number>()
  for (const row of rows) {
    const year = ledgerRowYear(row)
    if (!isNil(year)) years.add(year)
  }
  return [...years].sort((a, b) => b - a)
}

/** True when the row matches a free-text search (a person, mostly). */
export function ledgerRowMatchesSearch(
  row: LedgerRow,
  search: string
): boolean {
  const query = search.trim().toLowerCase()
  if (query === '') return true
  return [
    row.personName,
    row.paidBy,
    row.feeLabel,
    row.typeLabel,
    row.roleLabel,
    row.weekendLabel,
    isNil(row.method) ? null : formatPaymentMethod(row.method),
    row.status,
    formatCurrency(row.amount),
    row.payment?.notes,
    row.payment?.payment_intent_id,
  ].some((value) => !isNil(value) && value.toLowerCase().includes(query))
}

export type LedgerViewFilter = {
  status: LedgerStatusFilter
  /** Null means any year. */
  year: number | null
  showVoided: boolean
  /** The calendar year "now" falls in — outstanding fees belong to it. */
  currentYear: number
}

/**
 * The view-level filter (segmented control, Date chip, "Show voided") applied
 * before rows reach the table. Search and the Weekend/Type filters are the
 * table's own column filters — see filterLedgerRows for the combined result.
 */
export function ledgerRowInView(
  row: LedgerRow,
  view: LedgerViewFilter
): boolean {
  if (row.status === 'voided' && !view.showVoided) return false
  if (view.status !== 'all' && row.baseStatus !== view.status) return false
  if (!isNil(view.year)) {
    // Outstanding fees have no date: they are owed right now, so they belong
    // to the current year and to no other.
    const rowYear = ledgerRowYear(row) ?? view.currentYear
    if (rowYear !== view.year) return false
  }
  return true
}

export type LedgerFilter = LedgerViewFilter & {
  search: string
  /** Empty means any. */
  weekends: string[]
  types: string[]
  roles: string[]
  methods: string[]
}

/**
 * Everything the screen filters on, in one pass. Mirrors what the table shows
 * so the footer count and the CSV export always match the rows on screen.
 */
export function filterLedgerRows(
  rows: LedgerRow[],
  filter: LedgerFilter
): LedgerRow[] {
  return rows.filter(
    (row) =>
      ledgerRowInView(row, filter) &&
      ledgerRowMatchesSearch(row, filter.search) &&
      (filter.weekends.length === 0 ||
        filter.weekends.includes(row.weekendLabel)) &&
      (filter.types.length === 0 || filter.types.includes(row.typeLabel)) &&
      (filter.roles.length === 0 || filter.roles.includes(row.roleLabel)) &&
      (filter.methods.length === 0 ||
        filter.methods.includes(ledgerMethodLabel(row)))
  )
}

/** Method as shown in the table: nothing for outstanding rows. */
export function ledgerMethodLabel(row: LedgerRow): string {
  return isNil(row.method) ? '—' : formatPaymentMethod(row.method)
}

export type LedgerStats = {
  year: number
  /** Real money received in `year`. Waived and voided rows never count. */
  collectedTotal: number
  collectedCount: number
  /** Owed right now by the active weekend group. */
  outstandingTotal: number
  outstandingCount: number
  /** Fees the community covered in `year`. */
  waivedTotal: number
  waivedCount: number
}

/** The three stat tiles. Independent of the table's filters by design. */
export function computeLedgerStats(
  payments: PaymentTransactionDTO[],
  outstandingFees: OutstandingFee[],
  now: Date = new Date()
): LedgerStats {
  const year = now.getFullYear()
  const stats: LedgerStats = {
    year,
    collectedTotal: 0,
    collectedCount: 0,
    outstandingTotal: 0,
    outstandingCount: outstandingFees.length,
    waivedTotal: 0,
    waivedCount: 0,
  }

  for (const p of payments) {
    if (!isNil(p.voided_at)) continue
    if (new Date(p.created_at).getFullYear() !== year) continue
    if (isCollected(p)) {
      stats.collectedTotal += p.gross_amount
      stats.collectedCount++
    } else if (isWaived(p)) {
      stats.waivedTotal += p.gross_amount
      stats.waivedCount++
    }
  }

  for (const fee of outstandingFees) {
    stats.outstandingTotal += fee.amountDue
  }

  return stats
}
