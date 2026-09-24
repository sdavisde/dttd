'use client'

import { useId, useState } from 'react'
import { isNil } from 'lodash'
import { ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Permission } from '@/lib/security'
import {
  PERMISSION_DESCRIPTIONS,
  PERMISSION_LABELS,
  ladderPermissions,
} from '@/lib/security/permission-areas'
import {
  compareRung,
  heldCount,
  isLadderLocked,
  partwayRung,
  rungOf,
  type ResolvedLadder,
  type Rung,
} from '@/lib/security/role-rungs'
import { LockedBy, SettingRow } from './editor-layout'

interface PermissionLadderProps {
  resolved: ResolvedLadder
  /** What the role holds itself — the checklist edits this. */
  own: ReadonlySet<Permission>
  /** What the parent chain grants — rendered locked in the checklist. */
  inherited: ReadonlySet<Permission>
  /** Label of the direct parent role, for lock titles. */
  parentLabel: string | null
  disabled: boolean
  /** Bulk-set the whole area to a rung. */
  onChange: (rung: Rung) => void
  /** Tick or untick one permission. */
  onToggle: (permission: Permission) => void
}

const RUNG_LABELS: Record<Rung, string> = {
  none: 'No access',
  view: 'View',
  manage: 'Manage',
}

/** Subtle diagonal stripes for the rung a Custom set is partway to. */
const PARTWAY_STRIPES = {
  backgroundImage:
    'repeating-linear-gradient(135deg, var(--accent) 0 6px, var(--card) 6px 12px)',
}

/**
 * One row of the Permissions section: the area name with a "held of total"
 * pill, a one-line description, and the No access / View / Manage segmented
 * control. The pill opens a checklist of the area's individual permissions;
 * ticking them edits the role directly and the rung follows. A rung the
 * parent grants in full renders locked.
 */
export function PermissionLadder({
  resolved,
  own,
  inherited,
  parentLabel,
  disabled,
  onChange,
  onToggle,
}: PermissionLadderProps) {
  const { ladder, effective, inheritedRung } = resolved
  const [checklistOpen, setChecklistOpen] = useState(false)
  const checklistId = useId()

  const rungs: Rung[] =
    ladder.implicitView === true
      ? ['view', 'manage']
      : ['none', 'view', 'manage']
  const isCustom = effective.kind === 'custom'
  const currentRung = rungOf(effective)
  const partway = partwayRung(effective)
  const locked = isLadderLocked(resolved)
  const parent = parentLabel ?? 'the role it is based on'
  const lockTitle = `Granted by ${parent} — edit ${parent} to change`

  const all = ladderPermissions(ladder)
  const effectiveSet = new Set<Permission>([...own, ...inherited])
  const held = heldCount(ladder, effectiveSet)

  const control = (
    <div
      role="radiogroup"
      aria-label={`${ladder.label} access`}
      title={locked ? lockTitle : undefined}
      className={cn(
        'grid w-full overflow-hidden rounded-md border border-border sm:w-[264px]',
        rungs.length === 2 ? 'grid-cols-2' : 'grid-cols-3',
        locked ? 'bg-muted/60' : 'bg-card'
      )}
    >
      {rungs.map((rung) => {
        const selected = !isCustom && rung === currentRung
        const isPartway = isCustom && rung === partway
        // You can always move up; you can only move down to the parent's rung.
        const canPick =
          !disabled &&
          !locked &&
          !selected &&
          compareRung(rung, inheritedRung) >= 0
        return (
          <button
            key={rung}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={!canPick}
            onClick={() => onChange(rung)}
            title={selected && locked ? lockTitle : undefined}
            style={isPartway ? PARTWAY_STRIPES : undefined}
            className={cn(
              'flex h-11 items-center justify-center gap-1.5 border-r border-border px-2 text-xs font-medium whitespace-nowrap last:border-r-0 sm:h-8',
              'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset',
              selected && !locked && 'bg-primary text-primary-foreground',
              selected && locked && 'bg-primary/55 text-primary-foreground',
              isPartway && 'font-semibold text-foreground',
              !selected && !isPartway && 'text-muted-foreground',
              !selected && canPick && 'hover:bg-accent hover:text-foreground',
              !selected && !canPick && 'opacity-50'
            )}
          >
            {selected && locked && <Lock aria-hidden className="size-3" />}
            {RUNG_LABELS[rung]}
          </button>
        )
      })}
    </div>
  )

  const pill = (
    <button
      type="button"
      aria-expanded={checklistOpen}
      aria-controls={checklistId}
      aria-label={`${ladder.label}: ${held} of ${all.length} permissions. ${checklistOpen ? 'Hide' : 'Show'} the list`}
      onClick={() => setChecklistOpen((open) => !open)}
      className={cn(
        'relative inline-flex h-[22px] items-center gap-1 rounded-full border border-border bg-card px-2 text-xs font-medium text-foreground tabular-nums',
        'cursor-pointer outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50',
        // Phone-sized hit area without growing the pill.
        "after:absolute after:-inset-x-1 after:-inset-y-3 after:content-[''] sm:after:hidden"
      )}
    >
      {held} of {all.length}
      {checklistOpen ? (
        <ChevronUp aria-hidden className="size-3" />
      ) : (
        <ChevronDown aria-hidden className="size-3" />
      )}
    </button>
  )

  return (
    <SettingRow
      title={
        <>
          {ladder.label}
          {pill}
        </>
      }
      description={ladder.helper}
      control={control}
      note={isNil(ladder.caution) ? undefined : <span>{ladder.caution}</span>}
    >
      {checklistOpen && (
        <div
          id={checklistId}
          className="grid grid-cols-1 overflow-hidden rounded-md border border-border bg-card sm:grid-cols-2"
        >
          {all.map((permission, index) => {
            const fromParent = inherited.has(permission)
            const checked = effectiveSet.has(permission)
            const itemId = `${checklistId}-${permission}`
            const lastRow = index >= all.length - (all.length % 2 === 0 ? 2 : 1)
            const cellClass = cn(
              'flex min-h-11 items-start gap-2.5 px-3 py-2.5',
              'border-b border-divider sm:odd:border-r',
              index === all.length - 1 && 'border-b-0',
              lastRow && 'sm:border-b-0'
            )
            const text = (
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[13px] font-medium text-foreground">
                  {PERMISSION_LABELS[permission]}
                </span>
                <span className="text-xs leading-snug text-muted-foreground">
                  {PERMISSION_DESCRIPTIONS[permission]}
                </span>
              </span>
            )
            if (fromParent) {
              return (
                <div key={permission} className={cellClass}>
                  <LockedBy
                    parentLabel={parentLabel}
                    className="mt-0.5 shrink-0 text-[11px]"
                  />
                  {text}
                </div>
              )
            }
            return (
              <label
                key={permission}
                htmlFor={itemId}
                className={cn(
                  cellClass,
                  disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                )}
              >
                <Checkbox
                  id={itemId}
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => onToggle(permission)}
                  className="mt-0.5 size-4 shrink-0"
                />
                {text}
              </label>
            )
          })}
        </div>
      )}
    </SettingRow>
  )
}
