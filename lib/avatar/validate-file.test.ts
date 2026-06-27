import { MAX_AVATAR_BYTES, validateAvatarFile } from './validate-file'
import { isErr, isOk } from '@/lib/results'

// The helper only reads `type` and `size`, so a minimal stand-in avoids needing
// a real File/Blob in the node test environment.
const fakeFile = (type: string, size: number): Pick<File, 'type' | 'size'> => ({
  type,
  size,
})

describe('validateAvatarFile', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])(
    'accepts %s under the size limit',
    (type) => {
      expect(isOk(validateAvatarFile(fakeFile(type, 1024)))).toBe(true)
    }
  )

  it.each(['image/gif', 'image/heic', 'application/pdf', 'text/plain'])(
    'rejects unsupported type %s',
    (type) => {
      const result = validateAvatarFile(fakeFile(type, 1024))
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toMatch(/JPEG, PNG, or WebP/)
      }
    }
  )

  it('rejects files larger than 5MB', () => {
    const result = validateAvatarFile(
      fakeFile('image/png', MAX_AVATAR_BYTES + 1)
    )
    expect(isErr(result)).toBe(true)
    if (isErr(result)) {
      expect(result.error).toMatch(/5MB/)
    }
  })

  it('accepts a file exactly at the size limit', () => {
    expect(
      isOk(validateAvatarFile(fakeFile('image/webp', MAX_AVATAR_BYTES)))
    ).toBe(true)
  })
})
