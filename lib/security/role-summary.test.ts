import { Permission } from '@/lib/security'
import { PERMISSION_LABELS } from './permission-areas'
import {
  ACCESS_AREA_LABEL,
  SENSITIVE_AREA_LABEL,
  countPhrases,
  summariseRole,
  summarisedPermissions,
  summaryAreas,
} from './role-summary'

describe('summaryAreas', () => {
  it('runs the ladders first, then sensitive data, then access', () => {
    const areas = summaryAreas().map((area) => area.area)
    expect(areas[0]).toBe('Candidates')
    expect(areas.at(-2)).toBe(SENSITIVE_AREA_LABEL)
    expect(areas.at(-1)).toBe(ACCESS_AREA_LABEL)
  })
})

describe('summariseRole', () => {
  it('lists admin access, every ladder permission and the sensitive ones, never Full access', () => {
    const all = summarisedPermissions()
    expect(all).toContain(Permission.READ_ADMIN_PORTAL)
    expect(all).toContain(Permission.READ_CANDIDATE_MEDICAL_INFO)
    expect(all).not.toContain(Permission.FULL_ACCESS)
    expect(new Set(all).size).toBe(all.length)
    expect(all).toHaveLength(Object.values(Permission).length - 1)
  })

  it('groups can and cannot by area, in display order, dropping empty areas', () => {
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
      {
        area: 'Payments',
        phrases: [PERMISSION_LABELS[Permission.READ_PAYMENTS]],
      },
      {
        area: SENSITIVE_AREA_LABEL,
        phrases: [PERMISSION_LABELS[Permission.READ_CANDIDATE_MEDICAL_INFO]],
      },
      {
        area: ACCESS_AREA_LABEL,
        phrases: [PERMISSION_LABELS[Permission.READ_ADMIN_PORTAL]],
      },
    ])
    // Candidates keeps everything it was not granted; Access drops out entirely.
    expect(summary.cant.map((group) => group.area)).toContain('Candidates')
    expect(summary.cant.map((group) => group.area)).not.toContain(
      ACCESS_AREA_LABEL
    )
    expect(summary.cant.flatMap((group) => group.phrases)).toContain(
      PERMISSION_LABELS[Permission.WRITE_PAYMENTS]
    )
    expect(countPhrases(summary.can) + countPhrases(summary.cant)).toBe(
      summarisedPermissions().length
    )
  })

  it('puts everything under cannot for an empty role', () => {
    const summary = summariseRole(new Set())
    expect(summary.kind).toBe('split')
    if (summary.kind !== 'split') return
    expect(summary.can).toEqual([])
    expect(countPhrases(summary.cant)).toBe(summarisedPermissions().length)
    expect(summary.cant.map((group) => group.area)).toEqual(
      summaryAreas().map((area) => area.area)
    )
  })

  it('collapses to one line when Full access is held', () => {
    expect(
      summariseRole(new Set([Permission.FULL_ACCESS, Permission.READ_EVENTS]))
    ).toEqual({ kind: 'full-access' })
  })
})

describe('countPhrases', () => {
  it('adds the phrases across every group', () => {
    expect(countPhrases([])).toBe(0)
    expect(
      countPhrases([
        { area: 'Payments', phrases: ['See payments'] },
        { area: ACCESS_AREA_LABEL, phrases: ['Open the admin area'] },
      ])
    ).toBe(2)
  })
})
