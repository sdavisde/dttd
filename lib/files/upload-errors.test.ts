import { getFriendlyUploadError, formatFileSize } from './upload-errors'

describe('getFriendlyUploadError', () => {
  it('maps an expired session', () => {
    expect(
      getFriendlyUploadError('Unauthorized: User not authenticated')
    ).toMatch(/session has expired/i)
  })

  it('maps a missing permission', () => {
    expect(
      getFriendlyUploadError('Forbidden: Missing permission FILES_UPLOAD')
    ).toMatch(/don't have permission/i)
  })

  it('maps a 403 status from a storage error', () => {
    expect(
      getFriendlyUploadError({ message: 'denied', statusCode: '403' })
    ).toMatch(/don't have permission/i)
  })

  it('maps a duplicate file', () => {
    expect(
      getFriendlyUploadError({ message: 'The resource already exists' })
    ).toMatch(/already exists/i)
  })

  it('maps a 409 conflict status', () => {
    expect(
      getFriendlyUploadError({ message: 'Conflict', status: 409 })
    ).toMatch(/already exists/i)
  })

  it('maps a too-large payload', () => {
    expect(
      getFriendlyUploadError({
        message: 'Payload too large',
        statusCode: '413',
      })
    ).toMatch(/too large/i)
  })

  it('maps a disallowed file type', () => {
    expect(
      getFriendlyUploadError('Only PDF and image files are allowed')
    ).toMatch(/pdf or image|pdf and image/i)
  })

  it('maps a network failure', () => {
    expect(getFriendlyUploadError(new TypeError('Failed to fetch'))).toMatch(
      /network problem/i
    )
  })

  it('falls back for an unknown error', () => {
    expect(getFriendlyUploadError({})).toMatch(/something went wrong/i)
    expect(getFriendlyUploadError(null)).toMatch(/something went wrong/i)
  })
})

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(512)).toBe('512 B')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(2048)).toBe('2.0 KB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})
