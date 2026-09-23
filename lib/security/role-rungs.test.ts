import { Permission } from '@/lib/security'
import { PERMISSION_LADDERS } from './permission-areas'
import {
  applyRung,
  applySwitch,
  deriveLadderState,
  resolveLadder,
  resolveSwitch,
  rungOf,
  rungPermissions,
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
