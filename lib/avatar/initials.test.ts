import { getAvatarColor, getInitials } from './initials'

describe('getInitials', () => {
  it('uses first and last initials when both are present', () => {
    expect(
      getInitials({ first_name: 'Sam', last_name: 'Davis', email: 's@x.com' })
    ).toBe('SD')
  })

  it('uses a single initial when only one name is present', () => {
    expect(getInitials({ first_name: 'Sam', last_name: null })).toBe('S')
    expect(getInitials({ first_name: '', last_name: 'Davis' })).toBe('D')
  })

  it('falls back to the email initial when names are missing', () => {
    expect(
      getInitials({ first_name: null, last_name: null, email: 'omar@x.com' })
    ).toBe('O')
  })

  it('returns ? when nothing usable is present', () => {
    expect(getInitials({})).toBe('?')
    expect(getInitials({ first_name: '   ', email: '' })).toBe('?')
  })
})

describe('getAvatarColor', () => {
  it('is deterministic for the same id', () => {
    const id = 'b0000001-0000-4000-8000-000000000001'
    expect(getAvatarColor(id)).toBe(getAvatarColor(id))
  })

  it('returns a Tailwind background class', () => {
    expect(getAvatarColor('any-id')).toMatch(/^bg-[a-z]+-\d{3}$/)
  })

  it('spreads different ids across more than one color', () => {
    const colors = new Set(
      Array.from({ length: 50 }, (_, i) => getAvatarColor(`user-${i}`))
    )
    expect(colors.size).toBeGreaterThan(1)
  })

  it('returns a stable default for nil ids', () => {
    expect(getAvatarColor(null)).toBe(getAvatarColor(undefined))
  })
})
