import { Permission } from '@/lib/security'
import { PERMISSION_LABELS } from './permission-areas'
import {
  phraseList,
  summariseRole,
  summarisedPermissions,
} from './role-summary'

describe('summariseRole', () => {
  it('lists admin access, every ladder permission and the sensitive ones, never Full access', () => {
    const all = summarisedPermissions()
    expect(all[0]).toBe(Permission.READ_ADMIN_PORTAL)
    expect(all).toContain(Permission.READ_CANDIDATE_MEDICAL_INFO)
    expect(all).not.toContain(Permission.FULL_ACCESS)
    expect(new Set(all).size).toBe(all.length)
    expect(all).toHaveLength(Object.values(Permission).length - 1)
  })

  it('splits the effective set into can and cannot, in display order', () => {
    const summary = summariseRole(
      new Set([
        Permission.READ_CANDIDATE_MEDICAL_INFO,
        Permission.READ_PAYMENTS,
        Permission.READ_ADMIN_PORTAL,
      ])
    )
    expect(summary.kind).toBe('split')
    if (summary.kind !== 'split') return
    expect(summary.can).toEqual([
      Permission.READ_ADMIN_PORTAL,
      Permission.READ_PAYMENTS,
      Permission.READ_CANDIDATE_MEDICAL_INFO,
    ])
    expect(summary.cant).not.toContain(Permission.READ_PAYMENTS)
    expect(summary.cant).toContain(Permission.WRITE_PAYMENTS)
    expect(summary.can.length + summary.cant.length).toBe(
      summarisedPermissions().length
    )
  })

  it('puts everything under cannot for an empty role', () => {
    const summary = summariseRole(new Set())
    expect(summary).toEqual({
      kind: 'split',
      can: [],
      cant: summarisedPermissions(),
    })
  })

  it('collapses to one line when Full access is held', () => {
    expect(
      summariseRole(new Set([Permission.FULL_ACCESS, Permission.READ_EVENTS]))
    ).toEqual({ kind: 'full-access' })
  })
})

describe('phraseList', () => {
  it('joins plain-language phrases with a middle dot', () => {
    expect(
      phraseList([Permission.READ_CANDIDATES, Permission.FILES_UPLOAD])
    ).toBe(
      `${PERMISSION_LABELS[Permission.READ_CANDIDATES]} · ${PERMISSION_LABELS[Permission.FILES_UPLOAD]}`
    )
    expect(phraseList([])).toBe('')
  })
})
