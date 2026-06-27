import { getAvatarUrl } from './avatar-url'

describe('getAvatarUrl', () => {
  const ORIGINAL_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  })

  afterAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL_URL
  })

  it('returns null when the path is nil', () => {
    expect(getAvatarUrl(null, '2026-06-27T00:00:00Z')).toBeNull()
    expect(getAvatarUrl(undefined)).toBeNull()
    expect(getAvatarUrl('')).toBeNull()
  })

  it('returns null when the Supabase URL env var is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    expect(getAvatarUrl('user-1.webp', '2026-06-27T00:00:00Z')).toBeNull()
  })

  it('builds the public object URL with a ?v= cache-buster', () => {
    const url = getAvatarUrl('user-1.webp', '2026-06-27T00:00:00.000Z')
    expect(url).toBe(
      'https://example.supabase.co/storage/v1/object/public/avatars/user-1.webp?v=' +
        new Date('2026-06-27T00:00:00.000Z').getTime()
    )
  })

  it('omits ?v= when updated_at is nil or invalid', () => {
    expect(getAvatarUrl('user-1.webp')).toBe(
      'https://example.supabase.co/storage/v1/object/public/avatars/user-1.webp'
    )
    expect(getAvatarUrl('user-1.webp', 'not-a-date')).toBe(
      'https://example.supabase.co/storage/v1/object/public/avatars/user-1.webp'
    )
  })

  it('produces a different ?v= when updated_at changes', () => {
    const first = getAvatarUrl('user-1.webp', '2026-06-27T00:00:00.000Z')
    const second = getAvatarUrl('user-1.webp', '2026-06-28T00:00:00.000Z')
    expect(first).not.toEqual(second)
  })
})
