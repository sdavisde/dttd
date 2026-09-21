import { isErr, isOk } from '@/lib/results'

// `server-only` is provided by Next's bundler, not an installed package, so mock
// it virtually to let the email client import cleanly.
jest.mock('server-only', () => ({}), { virtual: true })

const sendMock = jest.fn()
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}))

const insertEmailLogMock = jest.fn()
jest.mock('./repository', () => ({
  insertEmailLog: (...args: unknown[]) => insertEmailLogMock(...args),
}))

const getUserMock = jest.fn()
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({ auth: { getUser: getUserMock } }),
}))

const loggerErrorMock = jest.fn()
jest.mock('@/lib/logger', () => ({
  logger: { error: (...args: unknown[]) => loggerErrorMock(...args) },
}))

import { sendEmail } from './email-client'

const EMAIL = {
  from: 'Dusty Trails Tres Dias <noreply@dustytrailstresdias.org>',
  to: ['candidate@example.com'],
  subject: 'Candidate Forms - Jane Doe',
  html: '<p>forms</p>',
}

describe('sendEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    insertEmailLogMock.mockResolvedValue({ data: true })
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  it('writes a sent log row when Resend accepts the message', async () => {
    sendMock.mockResolvedValue({ data: { id: 'resend-123' }, error: null })

    const result = await sendEmail('candidate-forms', EMAIL)

    expect(isOk(result)).toBe(true)
    expect(result.data).toEqual({ id: 'resend-123' })

    expect(insertEmailLogMock).toHaveBeenCalledTimes(1)
    expect(insertEmailLogMock).toHaveBeenCalledWith({
      template: 'candidate-forms',
      subject: 'Candidate Forms - Jane Doe',
      recipients: ['candidate@example.com'],
      status: 'sent',
      resendMessageId: 'resend-123',
      errorSummary: null,
      sentByUserId: 'user-1',
    })
  })

  it('writes a failed log row when Resend rejects the message', async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { name: 'validation_error', message: 'Invalid `to` field' },
    })

    const result = await sendEmail('payment-request', EMAIL)

    expect(isErr(result)).toBe(true)
    expect(result.error).toBe('Invalid `to` field')

    expect(insertEmailLogMock).toHaveBeenCalledTimes(1)
    expect(insertEmailLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        template: 'payment-request',
        status: 'failed',
        resendMessageId: null,
        errorSummary: 'Invalid `to` field',
      })
    )
  })

  it('records an anonymous send when there is no user session', async () => {
    sendMock.mockResolvedValue({ data: { id: 'resend-456' }, error: null })
    getUserMock.mockResolvedValue({ data: { user: null } })

    await sendEmail('sponsorship-notification', EMAIL)

    expect(insertEmailLogMock).toHaveBeenCalledWith(
      expect.objectContaining({ sentByUserId: null })
    )
  })

  it('still reports success when the log write throws', async () => {
    sendMock.mockResolvedValue({ data: { id: 'resend-789' }, error: null })
    insertEmailLogMock.mockRejectedValue(new Error('email_log is on fire'))

    const result = await sendEmail('candidate-forms-completed', EMAIL)

    expect(isOk(result)).toBe(true)
    expect(result.data).toEqual({ id: 'resend-789' })
    expect(loggerErrorMock).toHaveBeenCalled()
  })

  it('still reports success when the log write returns an error Result', async () => {
    sendMock.mockResolvedValue({ data: { id: 'resend-abc' }, error: null })
    insertEmailLogMock.mockResolvedValue({ error: 'permission denied' })

    const result = await sendEmail('team-payment-notification', EMAIL)

    expect(isOk(result)).toBe(true)
    expect(loggerErrorMock).toHaveBeenCalled()
  })

  it('logs the attempt and rethrows when Resend itself throws', async () => {
    sendMock.mockRejectedValue(new Error('network down'))

    await expect(sendEmail('email-change-notification', EMAIL)).rejects.toThrow(
      'network down'
    )

    expect(insertEmailLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        errorSummary: 'network down',
      })
    )
  })
})
