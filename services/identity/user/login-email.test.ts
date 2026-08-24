import { isErr, isOk } from '@/lib/results'

// `server-only` is provided by Next's bundler, not an installed package, so mock it
// virtually to let the service -> repository chain import cleanly.
jest.mock('server-only', () => ({}), { virtual: true })

jest.mock('@/lib/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}))

// Stand in for the service-role admin client so the tests can assert exactly what
// reaches Supabase Auth without touching a real project.
const getUserByIdMock = jest.fn()
const updateUserByIdMock = jest.fn()
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
  createAdminClient: jest.fn(() => ({
    auth: {
      admin: {
        getUserById: getUserByIdMock,
        updateUserById: updateUserByIdMock,
      },
    },
  })),
}))

import { updateUserLoginEmail } from './user-service'

const USER_ID = 'user-1'

/** An account that signs in with an email + password. */
function passwordAccount(email: string | null) {
  return {
    data: {
      user: { id: USER_ID, email, identities: [{ provider: 'email' }] },
    },
    error: null,
  }
}

describe('updateUserLoginEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    updateUserByIdMock.mockResolvedValue({ data: { user: {} }, error: null })
  })

  it('changes the auth email and marks the new address confirmed', async () => {
    getUserByIdMock.mockResolvedValue(passwordAccount('old@example.com'))

    const result = await updateUserLoginEmail(USER_ID, 'new@example.com')

    expect(isOk(result)).toBe(true)
    expect(updateUserByIdMock).toHaveBeenCalledWith(USER_ID, {
      email: 'new@example.com',
      email_confirm: true,
    })
  })

  it('never sends a password field, so the existing password keeps working', async () => {
    getUserByIdMock.mockResolvedValue(passwordAccount('old@example.com'))

    await updateUserLoginEmail(USER_ID, 'new@example.com')

    const attributes = updateUserByIdMock.mock.calls[0]![1]
    expect(attributes).not.toHaveProperty('password')
  })

  it('normalizes surrounding whitespace and casing before writing', async () => {
    getUserByIdMock.mockResolvedValue(passwordAccount('old@example.com'))

    await updateUserLoginEmail(USER_ID, '  New.Person@Example.COM  ')

    expect(updateUserByIdMock).toHaveBeenCalledWith(USER_ID, {
      email: 'new.person@example.com',
      email_confirm: true,
    })
  })

  it('rejects a malformed address without calling Supabase', async () => {
    const result = await updateUserLoginEmail(USER_ID, 'not-an-email')

    expect(isErr(result)).toBe(true)
    expect(getUserByIdMock).not.toHaveBeenCalled()
    expect(updateUserByIdMock).not.toHaveBeenCalled()
  })

  it('treats an unchanged address as a no-op', async () => {
    getUserByIdMock.mockResolvedValue(passwordAccount('same@example.com'))

    const result = await updateUserLoginEmail(USER_ID, 'SAME@example.com')

    expect(isOk(result)).toBe(true)
    expect(updateUserByIdMock).not.toHaveBeenCalled()
  })

  it('refuses accounts that only sign in through a social provider', async () => {
    getUserByIdMock.mockResolvedValue({
      data: {
        user: {
          id: USER_ID,
          email: 'old@example.com',
          identities: [{ provider: 'google' }],
        },
      },
      error: null,
    })

    const result = await updateUserLoginEmail(USER_ID, 'new@example.com')

    expect(isErr(result)).toBe(true)
    expect(isErr(result) && result.error).toContain('google')
    expect(updateUserByIdMock).not.toHaveBeenCalled()
  })

  it('allows an account that has a password alongside a social provider', async () => {
    getUserByIdMock.mockResolvedValue({
      data: {
        user: {
          id: USER_ID,
          email: 'old@example.com',
          identities: [{ provider: 'google' }, { provider: 'email' }],
        },
      },
      error: null,
    })

    const result = await updateUserLoginEmail(USER_ID, 'new@example.com')

    expect(isOk(result)).toBe(true)
    expect(updateUserByIdMock).toHaveBeenCalled()
  })

  it('reports a collision in words an admin can act on', async () => {
    getUserByIdMock.mockResolvedValue(passwordAccount('old@example.com'))
    updateUserByIdMock.mockResolvedValue({
      data: { user: null },
      error: {
        message: 'A user with this email address has already been registered',
      },
    })

    const result = await updateUserLoginEmail(USER_ID, 'taken@example.com')

    expect(isErr(result)).toBe(true)
    expect(isErr(result) && result.error).toBe(
      'That email address already belongs to another account.'
    )
  })

  it('does not leak a raw auth error to the caller', async () => {
    getUserByIdMock.mockResolvedValue(passwordAccount('old@example.com'))
    updateUserByIdMock.mockResolvedValue({
      data: { user: null },
      error: { message: 'pq: duplicate key value violates constraint xyz' },
    })

    const result = await updateUserLoginEmail(USER_ID, 'new@example.com')

    expect(isErr(result)).toBe(true)
    expect(isErr(result) && result.error).toBe(
      'Unable to update the login email. Please try again.'
    )
  })

  it('fails cleanly when the auth account cannot be loaded', async () => {
    getUserByIdMock.mockResolvedValue({
      data: { user: null },
      error: { message: 'User not found' },
    })

    const result = await updateUserLoginEmail(USER_ID, 'new@example.com')

    expect(isErr(result)).toBe(true)
    expect(updateUserByIdMock).not.toHaveBeenCalled()
  })
})
