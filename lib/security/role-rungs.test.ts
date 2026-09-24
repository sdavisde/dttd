import { Permission } from '@/lib/security'
import { PERMISSION_LADDERS } from './permission-areas'
import {
  applyRung,
  applySwitch,
  deriveLadderState,
  heldCount,
  isLadderLocked,
  nextRung,
  partwayRung,
  resolveLadder,
  resolveSwitch,
  rungOf,
  rungPermissions,
  togglePermission,
} from './role-rungs'

const ladder = (id: string) => {
  const found = PERMISSION_LADDERS.find((l) => l.id === id)
  if (found === undefined) throw new Error(`no ladder ${id}`)
  return found
}

const payments = ladder('payments')
const candidates = ladder('candidates')
const files = ladder('files')
const weekends = ladder('weekends')

describe('deriveLadderState', () => {
  it('lands on No access when the set holds nothing from the ladder', () => {
    expect(
      deriveLadderState(payments, new Set([Permission.READ_EVENTS]))
    ).toEqual({ kind: 'rung', rung: 'none' })
  })

  it('lands on View when exactly the View set is held', () => {
    expect(
      deriveLadderState(payments, new Set([Permission.READ_PAYMENTS]))
    ).toEqual({ kind: 'rung', rung: 'view' })
    expect(deriveLadderState(candidates, new Set(candidates.view))).toEqual({
      kind: 'rung',
      rung: 'view',
    })
  })

  it('lands on Manage when View and Manage are all held', () => {
    expect(
      deriveLadderState(
        payments,
        new Set([Permission.READ_PAYMENTS, Permission.WRITE_PAYMENTS])
      )
    ).toEqual({ kind: 'rung', rung: 'manage' })
  })

  it('is Custom when some View permissions are missing', () => {
    const state = deriveLadderState(
      candidates,
      new Set([Permission.READ_CANDIDATES, Permission.READ_CANDIDATE_CHURCH])
    )
    expect(state.kind).toBe('custom')
    if (state.kind !== 'custom') return
    expect(state.satisfiedRung).toBe('none')
    expect(state.present).toEqual([
      Permission.READ_CANDIDATES,
      Permission.READ_CANDIDATE_CHURCH,
    ])
    expect(state.missingForView).toEqual([
      Permission.READ_CANDIDATE_CONTACT_INFO,
      Permission.READ_CANDIDATE_SHIRT_SIZE,
      Permission.READ_CANDIDATE_MARITAL_STATUS,
      Permission.READ_CANDIDATE_TABLE_ASSIGNMENT_PROPERTIES,
      Permission.READ_CANDIDATE_SPONSOR_INFO,
      Permission.READ_CANDIDATE_PAYMENTS,
    ])
    expect(state.extraBeyondView).toEqual([])
  })

  it('is Custom when Manage is partially held on top of View', () => {
    const state = deriveLadderState(
      candidates,
      new Set([...candidates.view, Permission.WRITE_CANDIDATES])
    )
    expect(state.kind).toBe('custom')
    if (state.kind !== 'custom') return
    expect(state.satisfiedRung).toBe('view')
    expect(state.extraBeyondView).toEqual([Permission.WRITE_CANDIDATES])
    expect(state.missingForManage).toEqual([Permission.DELETE_CANDIDATES])
  })

  it('is Custom when a Manage permission is held without View', () => {
    const state = deriveLadderState(
      payments,
      new Set([Permission.WRITE_PAYMENTS])
    )
    expect(state.kind).toBe('custom')
    if (state.kind !== 'custom') return
    expect(state.missingForView).toEqual([Permission.READ_PAYMENTS])
    expect(state.extraBeyondView).toEqual([Permission.WRITE_PAYMENTS])
    expect(rungOf(state)).toBe('none')
  })

  it('treats Files as View by default and Manage with both file permissions', () => {
    expect(deriveLadderState(files, new Set())).toEqual({
      kind: 'rung',
      rung: 'view',
    })
    expect(
      deriveLadderState(
        files,
        new Set([Permission.FILES_UPLOAD, Permission.FILES_DELETE])
      )
    ).toEqual({ kind: 'rung', rung: 'manage' })
    const partial = deriveLadderState(files, new Set([Permission.FILES_UPLOAD]))
    expect(partial.kind).toBe('custom')
    expect(rungOf(partial)).toBe('view')
  })
})

describe('rungPermissions', () => {
  it('Manage includes everything in View', () => {
    for (const l of PERMISSION_LADDERS) {
      const manage = new Set(rungPermissions(l, 'manage'))
      for (const p of rungPermissions(l, 'view')) {
        expect(manage.has(p)).toBe(true)
      }
      expect(rungPermissions(l, 'none')).toEqual([])
    }
  })
})

describe('applyRung', () => {
  it('replaces only the ladder’s permissions and leaves the rest alone', () => {
    const own = [
      Permission.READ_PAYMENTS,
      Permission.READ_EVENTS,
      Permission.FILES_UPLOAD,
    ]
    const next = applyRung(payments, own, new Set(), 'manage')
    expect(next).toEqual([
      Permission.READ_EVENTS,
      Permission.FILES_UPLOAD,
      Permission.READ_PAYMENTS,
      Permission.WRITE_PAYMENTS,
    ])
  })

  it('normalises a Custom set to the chosen rung', () => {
    const own = [Permission.WRITE_PAYMENTS]
    expect(applyRung(payments, own, new Set(), 'view')).toEqual([
      Permission.READ_PAYMENTS,
    ])
    expect(applyRung(payments, own, new Set(), 'none')).toEqual([])
  })

  it('does not write inherited permissions into the role', () => {
    const inherited = new Set([
      Permission.READ_WEEKENDS,
      Permission.READ_EVENTS,
    ])
    expect(applyRung(weekends, [], inherited, 'manage')).toEqual([
      Permission.WRITE_WEEKENDS,
      Permission.WRITE_EVENTS,
    ])
  })
})

describe('applySwitch', () => {
  it('adds and removes a single permission without duplicates', () => {
    const on = applySwitch(
      [Permission.READ_PAYMENTS],
      Permission.FULL_ACCESS,
      true
    )
    expect(on).toEqual([Permission.READ_PAYMENTS, Permission.FULL_ACCESS])
    expect(applySwitch(on, Permission.FULL_ACCESS, true)).toEqual(on)
    expect(applySwitch(on, Permission.FULL_ACCESS, false)).toEqual([
      Permission.READ_PAYMENTS,
    ])
  })
})

describe('togglePermission', () => {
  it('adds a missing permission and removes a held one', () => {
    const own = [Permission.READ_PAYMENTS]
    const added = togglePermission(own, Permission.WRITE_PAYMENTS)
    expect(added).toEqual([Permission.READ_PAYMENTS, Permission.WRITE_PAYMENTS])
    expect(togglePermission(added, Permission.READ_PAYMENTS)).toEqual([
      Permission.WRITE_PAYMENTS,
    ])
    expect(own).toEqual([Permission.READ_PAYMENTS])
  })

  it('walks a ladder from No access to View one tick at a time', () => {
    let own: Permission[] = []
    for (const permission of candidates.view) {
      const before = deriveLadderState(candidates, new Set(own))
      expect(rungOf(before)).toBe('none')
      own = togglePermission(own, permission)
    }
    expect(deriveLadderState(candidates, new Set(own))).toEqual({
      kind: 'rung',
      rung: 'view',
    })
  })
})

describe('heldCount', () => {
  it('counts only the ladder’s own permissions', () => {
    expect(heldCount(candidates, new Set())).toBe(0)
    expect(
      heldCount(
        candidates,
        new Set([
          Permission.READ_CANDIDATES,
          Permission.READ_CANDIDATE_CHURCH,
          Permission.READ_PAYMENTS,
        ])
      )
    ).toBe(2)
    expect(
      heldCount(candidates, new Set([...candidates.view, ...candidates.manage]))
    ).toBe(10)
  })
})

describe('nextRung and partwayRung', () => {
  it('steps up one rung and stops at Manage', () => {
    expect(nextRung('none')).toBe('view')
    expect(nextRung('view')).toBe('manage')
    expect(nextRung('manage')).toBeNull()
  })

  it('names the rung a Custom set is partway to', () => {
    expect(
      partwayRung(
        deriveLadderState(candidates, new Set([Permission.READ_CANDIDATES]))
      )
    ).toBe('view')
    expect(
      partwayRung(
        deriveLadderState(
          candidates,
          new Set([...candidates.view, Permission.WRITE_CANDIDATES])
        )
      )
    ).toBe('manage')
    expect(
      partwayRung(deriveLadderState(files, new Set([Permission.FILES_UPLOAD])))
    ).toBe('manage')
  })

  it('is null when the set sits on a rung', () => {
    expect(partwayRung(deriveLadderState(payments, new Set()))).toBeNull()
    expect(
      partwayRung(deriveLadderState(payments, new Set(payments.view)))
    ).toBeNull()
  })
})

describe('isLadderLocked', () => {
  it('locks a rung the parent grants in full', () => {
    expect(
      isLadderLocked(
        resolveLadder(payments, new Set(), new Set([Permission.READ_PAYMENTS]))
      )
    ).toBe(true)
  })

  it('does not lock a rung the role raises or adds itself', () => {
    expect(
      isLadderLocked(
        resolveLadder(
          payments,
          new Set([Permission.WRITE_PAYMENTS]),
          new Set([Permission.READ_PAYMENTS])
        )
      )
    ).toBe(false)
    expect(
      isLadderLocked(
        resolveLadder(payments, new Set([Permission.READ_PAYMENTS]), new Set())
      )
    ).toBe(false)
  })

  it('does not lock a Custom set the parent only partly grants', () => {
    expect(
      isLadderLocked(
        resolveLadder(
          candidates,
          new Set(),
          new Set([Permission.READ_CANDIDATES])
        )
      )
    ).toBe(false)
  })

  it('never locks the Files baseline when no parent grants it', () => {
    expect(isLadderLocked(resolveLadder(files, new Set(), new Set()))).toBe(
      false
    )
  })
})

describe('resolveLadder', () => {
  it('shows the parent’s rung as inherited and locks it', () => {
    const resolved = resolveLadder(
      payments,
      new Set(),
      new Set([Permission.READ_PAYMENTS])
    )
    expect(resolved.effective).toEqual({ kind: 'rung', rung: 'view' })
    expect(resolved.inheritedRung).toBe('view')
    expect(resolved.provenance).toBe('inherited')
  })

  it('displays max(inherited, own) and marks it raised', () => {
    const resolved = resolveLadder(
      payments,
      new Set([Permission.WRITE_PAYMENTS]),
      new Set([Permission.READ_PAYMENTS])
    )
    expect(resolved.effective).toEqual({ kind: 'rung', rung: 'manage' })
    expect(resolved.inheritedRung).toBe('view')
    expect(resolved.provenance).toBe('raised')
  })

  it('marks a grant the parent does not have as added by this role', () => {
    const resolved = resolveLadder(
      payments,
      new Set([Permission.READ_PAYMENTS]),
      new Set([Permission.READ_EVENTS])
    )
    expect(resolved.provenance).toBe('own')
    expect(resolved.inheritedRung).toBe('none')
  })

  it('reports nothing when neither side grants the ladder', () => {
    const resolved = resolveLadder(payments, new Set(), new Set())
    expect(resolved.provenance).toBe('none')
    expect(resolved.effective).toEqual({ kind: 'rung', rung: 'none' })
  })

  it('never lowers the inherited rung below the Files baseline', () => {
    expect(resolveLadder(files, new Set(), new Set()).inheritedRung).toBe(
      'view'
    )
  })
})

describe('resolveSwitch', () => {
  it('locks a switch the parent grants and reports own grants as unlocked', () => {
    const inherited = new Set([Permission.READ_CANDIDATE_ADDRESS])
    const own = new Set([Permission.READ_CANDIDATE_MEDICAL_INFO])
    expect(
      resolveSwitch(Permission.READ_CANDIDATE_ADDRESS, own, inherited)
    ).toEqual({
      permission: Permission.READ_CANDIDATE_ADDRESS,
      on: true,
      locked: true,
    })
    expect(
      resolveSwitch(Permission.READ_CANDIDATE_MEDICAL_INFO, own, inherited)
    ).toEqual({
      permission: Permission.READ_CANDIDATE_MEDICAL_INFO,
      on: true,
      locked: false,
    })
    expect(
      resolveSwitch(Permission.READ_CANDIDATE_EMERGENCY_CONTACT, own, inherited)
    ).toEqual({
      permission: Permission.READ_CANDIDATE_EMERGENCY_CONTACT,
      on: false,
      locked: false,
    })
  })
})
