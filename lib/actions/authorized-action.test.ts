import { isErr, isOk, ok } from '@/lib/results'
import { Permission } from '@/lib/security'

jest.mock('server-only', () => ({}), { virtual: true })

const getLoggedInUserMock = jest.fn()
jest.mock('@/services/identity/user/current-user', () => ({
  getLoggedInUser: () => getLoggedInUserMock(),
}))

import {
  authorizedAction,
  authorizedSelfOrPermissionAction,
} from './authorized-action'

function signedInAs(id: string, permissions: Permission[]) {
  getLoggedInUserMock.mockResolvedValue(
    ok({ id, permissions: new Set(permissions) })
  )
}

describe('authorizedSelfOrPermissionAction', () => {
  const run = jest.fn().mockResolvedValue(ok(null))
  const action = authorizedSelfOrPermissionAction<{ userId: string }, null>(
    Permission.FULL_ACCESS,
    run
  )

  beforeEach(() => {
    jest.clearAllMocks()
    run.mockResolvedValue(ok(null))
  })

  it('lets an unprivileged member edit their own record', async () => {
    signedInAs('user-1', [])

    const result = await action({ userId: 'user-1' })

    expect(isOk(result)).toBe(true)
    expect(run).toHaveBeenCalledWith({ userId: 'user-1' })
  })

  it("blocks an unprivileged member from editing someone else's record", async () => {
    signedInAs('user-1', [])

    const result = await action({ userId: 'user-2' })

    expect(isErr(result)).toBe(true)
    expect(run).not.toHaveBeenCalled()
  })

  it('lets a privileged user edit anyone', async () => {
    signedInAs('admin-1', [Permission.FULL_ACCESS])

    const result = await action({ userId: 'user-2' })

    expect(isOk(result)).toBe(true)
    expect(run).toHaveBeenCalled()
  })

  it('blocks anonymous callers even when the ids would line up', async () => {
    getLoggedInUserMock.mockResolvedValue({ error: 'not logged in' })

    const result = await action({ userId: 'user-1' })

    expect(isErr(result)).toBe(true)
    expect(run).not.toHaveBeenCalled()
  })
})

describe('authorizedAction', () => {
  const run = jest.fn().mockResolvedValue(ok(null))
  const action = authorizedAction<{ userId: string }, null>(
    Permission.FULL_ACCESS,
    run
  )

  beforeEach(() => {
    jest.clearAllMocks()
    run.mockResolvedValue(ok(null))
  })

  it('grants no self-exemption -- the permission is the only way in', async () => {
    signedInAs('user-1', [])

    const result = await action({ userId: 'user-1' })

    expect(isErr(result)).toBe(true)
    expect(run).not.toHaveBeenCalled()
  })

  it('admits a caller holding the permission', async () => {
    signedInAs('admin-1', [Permission.FULL_ACCESS])

    const result = await action({ userId: 'user-2' })

    expect(isOk(result)).toBe(true)
  })
})
