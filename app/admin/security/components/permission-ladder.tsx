'use client'

import { isNil } from 'lodash'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Permission } from '@/lib/security'
import { PERMISSION_LABELS } from '@/lib/security/permission-areas'
import {
  compareRung,
  rungOf,
  type ResolvedLadder,
  type Rung,
} from '@/lib/security/role-rungs'
import { SettingRow } from './editor-layout'

interface PermissionLadderProps {
  resolved: ResolvedLadder
  /** Label of the direct parent role, for the provenance line. */
  parentLabel: string | null
  disabled: boolean
  onChange: (rung: Rung) => void
}

const RUNG_LABELS: Record<Rung, string> = {
  none: 'No access',
  view: 'View',
  manage: 'Manage',
}

function provenanceText(
  resolved: ResolvedLadder,
  parentLabel: string | null
): string | null {
  const parent = parentLabel ?? 'the role it is based on'
  switch (resolved.provenance) {
    case 'inherited':
      return `from ${parent}`
    case 'raised':
      return `raised from ${parent}’s ${RUNG_LABELS[resolved.inheritedRung]}`
    case 'own':
      return 'added by this role'
    case 'none':
      return null
  }
}

function labelsOf(permissions: readonly Permission[]): string {
  return permissions.map((p) => PERMISSION_LABELS[p]).join(', ')
}

/**
 * One row of the Permissions section: the area name, a one-line description,
 * and the No access / View / Manage segmented control on the right. Rungs the
 * parent already guarantees are locked; a set that does not land on a rung
 * shows a quiet Custom pill with one-click normalisation.
 */
export function PermissionLadder({
  resolved,
  parentLabel,
  disabled,
  onChange,
}: PermissionLadderProps) {
  const { ladder, effective, inheritedRung } = resolved
  const rungs: Rung[] =
    ladder.implicitView === true
      ? ['view', 'manage']
      : ['none', 'view', 'manage']
  const isCustom = effective.kind === 'custom'
  const currentRung = rungOf(effective)
  const provenance = provenanceText(resolved, parentLabel)
  const canSetView = compareRung('view', inheritedRung) >= 0

  const control = (
    <div
      role="radiogroup"
      aria-label={`${ladder.label} access`}
      className={cn(
        'grid w-full overflow-hidden rounded-md border border-border sm:w-[220px]',
        rungs.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
      )}
    >
      {rungs.map((rung) => {
        const selected = !isCustom && rung === currentRung
        const lockedByParent = compareRung(rung, inheritedRung) <= 0
        const implicit = ladder.implicitView === true && rung === 'view'
        const isLocked = selected && (lockedByParent || implicit)
        // You can always move up; you can only move down to the parent's rung.
        const canPick =
          !disabled &&
          !selected &&
          (compareRung(rung, inheritedRung) >= 0 || isCustom)
        return (
          <button
            key={rung}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={!canPick}
            onClick={() => onChange(rung)}
            title={
              isLocked
                ? implicit
                  ? 'Everyone can already view files'
                  : `Granted by ${parentLabel ?? 'the parent role'} — cannot be removed here`
                : undefined
            }
            className={cn(
              'flex h-11 items-center justify-center gap-1 border-r border-border px-2 text-xs font-medium last:border-r-0 sm:h-8',
              'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset',
              selected && !isLocked && 'bg-primary text-primary-foreground',
              selected && isLocked && 'bg-muted text-foreground',
              !selected && 'text-muted-foreground',
              !selected && canPick && 'hover:bg-accent hover:text-foreground',
              !selected && !canPick && 'opacity-50'
            )}
          >
            {RUNG_LABELS[rung]}
            {isLocked && <Lock aria-hidden className="size-3" />}
          </button>
        )
      })}
    </div>
  )

  const customLine =
    effective.kind === 'custom' ? (
      <span>
        {effective.present.length > 0 &&
          `Holds ${labelsOf(effective.present)}. `}
        {effective.missingForView.length > 0
          ? `Missing for View: ${labelsOf(effective.missingForView)}.`
          : effective.missingForManage.length > 0
            ? `Missing for Manage: ${labelsOf(effective.missingForManage)}.`
            : ''}
        {!disabled && (
          <>
            {' '}
            {canSetView && (
              <>
                <button
                  type="button"
                  onClick={() => onChange('view')}
                  className="cursor-pointer text-primary underline underline-offset-2 outline-none hover:text-primary-hover focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  Set to View
                </button>
                {' · '}
              </>
            )}
            <button
              type="button"
              onClick={() => onChange('manage')}
              className="cursor-pointer text-primary underline underline-offset-2 outline-none hover:text-primary-hover focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              Set to Manage
            </button>
          </>
        )}
      </span>
    ) : null

  const note =
    isCustom || !isNil(provenance) ? (
      <div className="flex flex-col gap-1">
        {!isNil(provenance) && <span>{provenance}</span>}
        {customLine}
      </div>
    ) : undefined

  return (
    <SettingRow
      title={
        <>
          {ladder.label}
          {isCustom && (
            <span className="inline-flex items-center rounded-full border border-warning/60 bg-warning/20 px-2 py-0.5 text-xs font-medium text-foreground">
              Custom
            </span>
          )}
        </>
      }
      description={ladder.helper}
      control={control}
      note={note}
    />
  )
}
