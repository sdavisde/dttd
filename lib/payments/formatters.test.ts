import { formatPersonName } from './formatters'

describe('formatPersonName', () => {
  it('returns the name when one is present', () => {
    expect(formatPersonName('Jane Doe')).toBe('Jane Doe')
  })

  it('falls back to an em dash for a null name', () => {
    expect(formatPersonName(null)).toBe('—')
  })

  it('falls back to an em dash for a blank name', () => {
    // Manual payment entry stores '' when the pre-filled payer name is blank,
    // which a plain `?? '—'` would render as an empty cell.
    expect(formatPersonName('')).toBe('—')
    expect(formatPersonName('   ')).toBe('—')
  })
})
