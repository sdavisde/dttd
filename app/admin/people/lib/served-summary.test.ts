import { formatServedSummary } from './served-summary'

describe('formatServedSummary', () => {
  it('returns null when there is no experience', () => {
    expect(formatServedSummary([])).toBeNull()
    expect(formatServedSummary(null)).toBeNull()
    expect(formatServedSummary(undefined)).toBeNull()
  })

  it('lists weekend numbers ascending for a single community', () => {
    expect(
      formatServedSummary([
        { weekend_reference: 'DTTD#11' },
        { weekend_reference: 'DTTD#10' },
      ])
    ).toBe('served DTTD #10, #11')
  })

  it('de-duplicates repeat weekends', () => {
    expect(
      formatServedSummary([
        { weekend_reference: 'DTTD#10' },
        { weekend_reference: 'DTTD#10' },
      ])
    ).toBe('served DTTD #10')
  })

  it('puts DTTD first and sorts other communities alphabetically', () => {
    expect(
      formatServedSummary([
        { weekend_reference: 'HCTD#2' },
        { weekend_reference: 'CTD#5' },
        { weekend_reference: 'DTTD#9' },
      ])
    ).toBe('served DTTD #9 · CTD #5 · HCTD #2')
  })

  it('keeps unparseable references verbatim instead of dropping them', () => {
    expect(
      formatServedSummary([
        { weekend_reference: 'DTTD#9' },
        { weekend_reference: 'Camp Chrysalis' },
        { weekend_reference: '   ' },
      ])
    ).toBe('served DTTD #9 · Camp Chrysalis')
  })
})
