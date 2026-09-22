import { buildLedgerRows } from '@/lib/payments/ledger'
import type { OutstandingFee } from '@/lib/payments/outstanding'
import { makePayment } from '@/lib/payments/test-fixtures'
import {
  LEDGER_CSV_COLUMNS,
  generateLedgerCsv,
  generateLedgerCsvFilename,
} from './csv-export'

const openFee: OutstandingFee = {
  targetType: 'weekend_group_member',
  targetId: 'member-1',
  legacyTargetIds: [],
  name: 'Ann Simmons',
  expectedPayer: 'Ann Simmons',
  chaRole: 'Head Dining',
  weekendId: 'weekend-womens',
  weekendNumber: 12,
  weekendType: 'WOMENS',
  feeAmount: 185,
  coveredSoFar: 0,
  amountDue: 185,
}

const parse = (csv: string) => csv.split('\n').map((line) => line.split(','))
const column = (header: string) =>
  LEDGER_CSV_COLUMNS.findIndex((col) => col.header === header)

describe('generateLedgerCsv', () => {
  it('writes a header row followed by one row per ledger row', () => {
    const csv = generateLedgerCsv(buildLedgerRows([makePayment()], [openFee]))
    const [header, ...rows] = parse(csv)

    expect(header).toEqual(LEDGER_CSV_COLUMNS.map((col) => col.header))
    expect(rows).toHaveLength(2)
  })

  it("exports the team role a payment's person served in", () => {
    const csv = generateLedgerCsv(
      buildLedgerRows(
        [
          makePayment({
            target_type: 'weekend_group_member',
            cha_role: 'Head Music',
          }),
        ],
        [openFee]
      )
    )
    const [, payment, outstanding] = parse(csv)

    expect(payment[column('Role')]).toBe('Head Music')
    expect(outstanding[column('Role')]).toBe('Head Dining')
  })

  it('exports a payment with its amount as a plain number', () => {
    const csv = generateLedgerCsv(
      buildLedgerRows(
        [
          makePayment({
            payment_method: 'stripe',
            gross_amount: 195,
            net_amount: 189.04,
            stripe_fee: 5.96,
          }),
        ],
        []
      )
    )
    const [, row] = parse(csv)

    expect(row[column('Paid by')]).toBe('Martha Hughes')
    expect(row[column('For')]).toBe('Candidate fee · David Park')
    expect(row[column('Amount')]).toBe('195.00')
    expect(row[column('Method')]).toBe('Stripe')
    expect(row[column('Status')]).toBe('Paid')
    expect(row[column('Date')]).toBe('2026-08-25')
    expect(row[column('Net')]).toBe('189.04')
    expect(row[column('Stripe fee')]).toBe('5.96')
  })

  it('leaves method, date and money detail blank for an outstanding fee', () => {
    const csv = generateLedgerCsv(buildLedgerRows([], [openFee]))
    const [, row] = parse(csv)

    expect(row[column('Status')]).toBe('Outstanding')
    expect(row[column('Person')]).toBe('Ann Simmons')
    expect(row[column('Amount')]).toBe('185.00')
    expect(row[column('Method')]).toBe('')
    expect(row[column('Date')]).toBe('')
    expect(row[column('Net')]).toBe('')
  })

  it('marks waived and voided rows', () => {
    const csv = generateLedgerCsv(
      buildLedgerRows(
        [
          makePayment({ id: 'w', payment_method: 'waived' }),
          makePayment({
            id: 'v',
            created_at: '2026-01-01T00:00:00.000Z',
            voided_at: '2026-02-01T00:00:00.000Z',
            void_reason: 'Duplicate',
          }),
        ],
        []
      )
    )
    const [, waivedRow, voidedRow] = parse(csv)

    expect(waivedRow[column('Status')]).toBe('Waived')
    expect(waivedRow[column('Method')]).toBe('Waived')
    expect(voidedRow[column('Status')]).toBe('Voided')
    expect(voidedRow[column('Void reason')]).toBe('Duplicate')
  })

  it('quotes fields containing commas, quotes or line breaks', () => {
    const csv = generateLedgerCsv(
      buildLedgerRows(
        [makePayment({ notes: 'Check #12, "First Bank"\nsecond line' })],
        []
      )
    )
    expect(csv).toContain('"Check #12, ""First Bank""\nsecond line"')
  })
})

describe('generateLedgerCsvFilename', () => {
  const now = new Date('2026-09-21T12:00:00.000Z')

  it('dates the file and names the view when one is selected', () => {
    expect(generateLedgerCsvFilename('all', now)).toBe(
      'payments-2026-09-21.csv'
    )
    expect(generateLedgerCsvFilename('outstanding', now)).toBe(
      'payments-outstanding-2026-09-21.csv'
    )
  })
})
