import {
  candidateOwesFee,
  formatFee,
  formatGroupPrice,
  groupFeesFromColumns,
  isFeeExemptRole,
  parseFeeAmount,
} from './group-fees'

describe('group fees', () => {
  it('reads fee columns only when all three are set', () => {
    expect(
      groupFeesFromColumns({
        team_fee: 200,
        candidate_fee: 200,
        online_surcharge: 10,
      })
    ).toEqual({ teamFee: 200, candidateFee: 200, onlineSurcharge: 10 })
    expect(
      groupFeesFromColumns({
        team_fee: null,
        candidate_fee: null,
        online_surcharge: null,
      })
    ).toBeNull()
  })

  it('parses typed dollar amounts', () => {
    expect(parseFeeAmount('200')).toBe(200)
    expect(parseFeeAmount(' $212.50 ')).toBe(212.5)
    expect(parseFeeAmount('0')).toBe(0)
    expect(parseFeeAmount('')).toBeNull()
    expect(parseFeeAmount('-5')).toBeNull()
    expect(parseFeeAmount('12.345')).toBeNull()
    expect(parseFeeAmount('abc')).toBeNull()
  })

  it('formats whole dollars without cents', () => {
    expect(formatFee(200)).toBe('$200')
    expect(formatFee(212.5)).toBe('$212.50')
  })

  it('describes the price for cash and online payers', () => {
    expect(
      formatGroupPrice({ teamFee: 200, candidateFee: 200, onlineSurcharge: 10 })
    ).toBe('$200 cash · $210 online')
    expect(
      formatGroupPrice({ teamFee: 200, candidateFee: 250, onlineSurcharge: 10 })
    ).toBe('Team $200 cash · $210 online; candidates $250 cash · $260 online')
  })

  it('exempts the spiritual director roles only', () => {
    expect(isFeeExemptRole('Spiritual Director Trainee')).toBe(true)
    expect(isFeeExemptRole('Rector')).toBe(false)
    expect(isFeeExemptRole(null)).toBe(false)
  })

  it('has candidates owe from approval', () => {
    expect(candidateOwesFee('awaiting_payment')).toBe(true)
    expect(candidateOwesFee('confirmed')).toBe(true)
    expect(candidateOwesFee('pending_approval')).toBe(false)
    expect(candidateOwesFee(null)).toBe(false)
  })
})
