import { isErr, isOk } from '@/lib/results'
import {
  checkoutFeeTypeFromMetadata,
  isTeamFeeSettled,
  priceCheckout,
  teamFeeStatusFromPrice,
  toStripeAmount,
} from './checkout-price'

const fees = { teamFee: 200, candidateFee: 250, onlineSurcharge: 10 }

describe('priceCheckout', () => {
  it('charges the fee plus card processing', () => {
    const result = priceCheckout({
      feeType: 'team',
      fees,
      owes: true,
      coveredSoFar: 0,
    })
    expect(isOk(result) && result.data).toMatchObject({
      fee: 200,
      amountDue: 200,
      chargeAmount: 210,
    })
  })

  it('uses the candidate fee for candidates', () => {
    const result = priceCheckout({
      feeType: 'candidate',
      fees,
      owes: true,
      coveredSoFar: 0,
    })
    expect(isOk(result) && result.data.chargeAmount).toBe(260)
  })

  it('charges only what is left after a partial payment', () => {
    const result = priceCheckout({
      feeType: 'team',
      fees,
      owes: true,
      coveredSoFar: 120,
    })
    expect(isOk(result) && result.data).toMatchObject({
      amountDue: 80,
      chargeAmount: 90,
    })
  })

  it('refuses when fees are not set, nothing is owed, or it is paid', () => {
    const refusal = (input: Parameters<typeof priceCheckout>[0]) => {
      const result = priceCheckout(input)
      return isErr(result) ? result.error : null
    }
    expect(
      refusal({ feeType: 'team', fees: null, owes: true, coveredSoFar: 0 })
    ).toBe('fees-not-set')
    expect(
      refusal({ feeType: 'team', fees, owes: false, coveredSoFar: 0 })
    ).toBe('not-owed')
    expect(
      refusal({ feeType: 'team', fees, owes: true, coveredSoFar: 200 })
    ).toBe('already-paid')
  })

  it('converts dollars to Stripe cents', () => {
    expect(toStripeAmount(210)).toBe(21000)
    expect(toStripeAmount(212.5)).toBe(21250)
  })
})

describe('checkoutFeeTypeFromMetadata', () => {
  it('reads the fee_type tag', () => {
    expect(checkoutFeeTypeFromMetadata({ fee_type: 'team' })).toBe('team')
    expect(checkoutFeeTypeFromMetadata({ fee_type: 'candidate' })).toBe(
      'candidate'
    )
  })

  it('ignores sessions it does not recognise', () => {
    expect(checkoutFeeTypeFromMetadata({ price_id: 'price_team' })).toBe(null)
    expect(checkoutFeeTypeFromMetadata({})).toBe(null)
    expect(checkoutFeeTypeFromMetadata(null)).toBe(null)
  })
})

describe('teamFeeStatusFromPrice', () => {
  const status = (coveredSoFar: number, owes = true, teamFee = 250) =>
    teamFeeStatusFromPrice(
      priceCheckout({
        feeType: 'team',
        fees: { ...fees, teamFee },
        owes,
        coveredSoFar,
      })
    )

  it('still owes after the fee is raised past what was paid', () => {
    // Paid $200, then the group's fee went up to $250.
    expect(status(200)).toEqual({
      state: 'owes',
      fee: 250,
      coveredSoFar: 200,
      amountDue: 50,
    })
    expect(isTeamFeeSettled(status(200))).toBe(false)
  })

  it('is paid only once the full fee is covered', () => {
    expect(status(250)).toEqual({ state: 'paid' })
    expect(isTeamFeeSettled(status(250))).toBe(true)
  })

  it('is settled for a role that owes nothing', () => {
    expect(status(0, false)).toEqual({ state: 'not-owed' })
    expect(isTeamFeeSettled(status(0, false))).toBe(true)
  })

  it('is not settled while the fee is unset', () => {
    const unset = teamFeeStatusFromPrice(
      priceCheckout({
        feeType: 'team',
        fees: null,
        owes: true,
        coveredSoFar: 0,
      })
    )
    expect(unset).toEqual({ state: 'fees-not-set' })
    expect(isTeamFeeSettled(unset)).toBe(false)
  })
})
