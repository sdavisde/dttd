import {
  DEFAULT_SYSTEM_EMAIL_ADDRESS,
  VERIFIED_SENDING_DOMAIN,
  defaultNotificationToggles,
  formatSystemEmailFrom,
  parseToggleValue,
  resolveSystemEmailAddress,
  toToggleValue,
  validateSystemEmailAddress,
} from './site-settings'

describe('resolveSystemEmailAddress', () => {
  it('falls back to the historical hardcoded address when unset', () => {
    expect(resolveSystemEmailAddress(null)).toBe(DEFAULT_SYSTEM_EMAIL_ADDRESS)
    expect(resolveSystemEmailAddress(undefined)).toBe(
      DEFAULT_SYSTEM_EMAIL_ADDRESS
    )
    expect(resolveSystemEmailAddress('   ')).toBe(DEFAULT_SYSTEM_EMAIL_ADDRESS)
  })

  it('uses the stored address when one is set', () => {
    expect(resolveSystemEmailAddress('hello@dustytrailstresdias.org')).toBe(
      'hello@dustytrailstresdias.org'
    )
  })

  it('trims stray whitespace', () => {
    expect(resolveSystemEmailAddress(' hello@dustytrailstresdias.org ')).toBe(
      'hello@dustytrailstresdias.org'
    )
  })
})

describe('formatSystemEmailFrom', () => {
  it('preserves the display-name form every send used', () => {
    expect(formatSystemEmailFrom(DEFAULT_SYSTEM_EMAIL_ADDRESS)).toBe(
      'Dusty Trails Tres Dias <noreply@dustytrailstresdias.org>'
    )
  })

  it('falls back to the default address for an empty value', () => {
    expect(formatSystemEmailFrom('')).toBe(
      'Dusty Trails Tres Dias <noreply@dustytrailstresdias.org>'
    )
  })
})

describe('validateSystemEmailAddress', () => {
  it('accepts an address on the verified domain', () => {
    expect(validateSystemEmailAddress('hello@dustytrailstresdias.org')).toEqual(
      { valid: true }
    )
  })

  it('ignores casing on the domain', () => {
    expect(validateSystemEmailAddress('Hello@DustyTrailsTresDias.org')).toEqual(
      { valid: true }
    )
  })

  it('rejects an empty value', () => {
    const result = validateSystemEmailAddress('  ')
    expect(result.valid).toBe(false)
  })

  it('rejects something that is not an email', () => {
    const result = validateSystemEmailAddress('not-an-email')
    expect(result.valid).toBe(false)
  })

  it('rejects an address on a domain the provider has not verified', () => {
    const result = validateSystemEmailAddress('hello@gmail.com')
    expect(result.valid).toBe(false)
    expect(result.valid === false && result.reason).toContain(
      VERIFIED_SENDING_DOMAIN
    )
  })
})

describe('parseToggleValue', () => {
  it('defaults to on when the setting has never been written', () => {
    expect(parseToggleValue(null)).toBe(true)
    expect(parseToggleValue(undefined)).toBe(true)
  })

  it('reads the stored off values', () => {
    expect(parseToggleValue('false')).toBe(false)
    expect(parseToggleValue('FALSE')).toBe(false)
    expect(parseToggleValue('off')).toBe(false)
    expect(parseToggleValue('0')).toBe(false)
  })

  it('treats anything else as on', () => {
    expect(parseToggleValue('true')).toBe(true)
    expect(parseToggleValue('yes')).toBe(true)
    expect(parseToggleValue('')).toBe(true)
  })

  it('round-trips through toToggleValue', () => {
    expect(parseToggleValue(toToggleValue(true))).toBe(true)
    expect(parseToggleValue(toToggleValue(false))).toBe(false)
  })
})

describe('defaultNotificationToggles', () => {
  it('has every toggle on', () => {
    expect(defaultNotificationToggles()).toEqual({
      notify_payment_receipts: true,
      notify_new_sponsorships: true,
    })
  })
})
