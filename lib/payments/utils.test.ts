import { getPaymentSummary } from './utils'

const paid = (amount: number) => ({ gross_amount: amount })

describe('getPaymentSummary', () => {
  it('owes the cash fee when nothing is paid', () => {
    expect(getPaymentSummary([], 200)).toEqual({
      totalPaid: 0,
      totalFee: 200,
      balance: 200,
      status: 'Unpaid',
    })
  })

  it('settles a cash payer at the fee', () => {
    expect(getPaymentSummary([paid(200)], 200).status).toBe('Paid')
  })

  it('settles an online payer at fee + surcharge with no credit', () => {
    expect(getPaymentSummary([paid(210)], 200)).toMatchObject({
      status: 'Paid',
      totalFee: 200,
      balance: 0,
    })
  })

  it('shows the balance after a partial payment', () => {
    expect(getPaymentSummary([paid(50), paid(70)], 200)).toMatchObject({
      status: 'Partial',
      totalPaid: 120,
      balance: 80,
    })
  })

  it('reads "Not owed" for an exempt role or a group with no fees', () => {
    expect(getPaymentSummary([], null).status).toBe('Not owed')
    expect(getPaymentSummary([paid(200)], 0)).toMatchObject({
      status: 'Not owed',
      totalPaid: 200,
      balance: 0,
    })
  })
})
