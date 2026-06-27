import { isOk } from '@/lib/results'

// `server-only` is provided by Next's bundler, not an installed package, so mock
// it virtually to let the action -> service -> repository chain import cleanly.
jest.mock('server-only', () => ({}), { virtual: true })

// Avoid pulling the impersonation service's server deps into the test; the photo
// actions don't use it.
jest.mock('@/services/identity/impersonation/impersonation-service', () => ({
  findImpersonatingUser: jest.fn(),
}))

// Capture what the repository writes by stubbing the server Supabase client.
type UsersUpdate = {
  profile_photo_path: string | null
  profile_photo_updated_at: string | null
}
const eqMock = jest.fn().mockResolvedValue({ data: null, error: null })
const updateMock = jest.fn((_payload: UsersUpdate) => ({ eq: eqMock }))
const fromMock = jest.fn(() => ({ update: updateMock }))
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({ from: fromMock }),
}))

import { removeUserProfilePhoto, updateUserProfilePhoto } from './actions'

describe('profile photo actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updateUserProfilePhoto sets the path and a fresh updated_at on the user', async () => {
    const result = await updateUserProfilePhoto('user-1', 'user-1.webp')

    expect(fromMock).toHaveBeenCalledWith('users')
    expect(eqMock).toHaveBeenCalledWith('id', 'user-1')
    expect(updateMock).toHaveBeenCalledTimes(1)

    const payload = updateMock.mock.calls[0]![0]
    expect(payload.profile_photo_path).toBe('user-1.webp')
    expect(typeof payload.profile_photo_updated_at).toBe('string')
    expect(Date.parse(payload.profile_photo_updated_at ?? '')).not.toBeNaN()

    expect(isOk(result)).toBe(true)
  })

  it('removeUserProfilePhoto clears both photo columns on the user', async () => {
    const result = await removeUserProfilePhoto('user-1')

    expect(eqMock).toHaveBeenCalledWith('id', 'user-1')
    expect(updateMock).toHaveBeenCalledTimes(1)

    const payload = updateMock.mock.calls[0]![0]
    expect(payload.profile_photo_path).toBeNull()
    expect(payload.profile_photo_updated_at).toBeNull()

    expect(isOk(result)).toBe(true)
  })
})
