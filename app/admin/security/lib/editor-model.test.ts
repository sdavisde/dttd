import { Permission } from '@/lib/security'
import type { Role } from '@/services/identity/roles'
import {
  defaultCopySource,
  draftFromRole,
  inheritedPermissions,
  parentOptions,
  toRoleInput,
} from './editor-model'

function role(
  id: string,
  permissions: Permission[],
  based_on_role_id: string | null = null
): Role {
  return {
    id,
    label: id,
    description: `The ${id} role`,
    type: 'INDIVIDUAL',
    permissions,
    based_on_role_id,
  }
}

const full = role('full', [Permission.FULL_ACCESS])
const member = role('member', [Permission.READ_ADMIN_PORTAL])
const board = role('board', [Permission.READ_PAYMENTS], 'member')
const president = role('president', [Permission.WRITE_WEEKENDS], 'board')
const superAdmin = role('super', [], 'full')
const roles = [full, member, board, president, superAdmin]

describe('parentOptions', () => {
  it('excludes the role itself and anything that would loop back', () => {
    expect(parentOptions('member', roles).map((r) => r.id)).toEqual([
      'full',
      'super',
    ])
    expect(parentOptions('board', roles).map((r) => r.id)).toEqual([
      'full',
      'member',
      'super',
    ])
  })

  it('offers every role to a brand-new role', () => {
    expect(parentOptions(null, roles)).toHaveLength(roles.length)
  })
})

describe('inheritedPermissions', () => {
  it('is empty without a parent and transitive with one', () => {
    expect(inheritedPermissions(null, roles)).toEqual(new Set())
    expect(inheritedPermissions('board', roles)).toEqual(
      new Set([Permission.READ_PAYMENTS, Permission.READ_ADMIN_PORTAL])
    )
  })
})

describe('drafts', () => {
  it('copies everything but the name', () => {
    expect(draftFromRole(president)).toEqual({
      label: '',
      description: 'The president role',
      type: 'INDIVIDUAL',
      based_on_role_id: 'board',
      permissions: [Permission.WRITE_WEEKENDS],
    })
    expect(toRoleInput(president).label).toBe('president')
  })

  it('defaults the copy source to the first role without Full Access', () => {
    expect(defaultCopySource(roles)?.id).toBe('member')
    expect(defaultCopySource([full, superAdmin])?.id).toBe('full')
    expect(defaultCopySource([])).toBeNull()
  })
})
