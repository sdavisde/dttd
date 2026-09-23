'use client'

import { isNil } from 'lodash'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PERMISSION_LABELS } from '@/lib/security/permission-areas'
import {
  compareRung,
  rungOf,
  type ResolvedLadder,
  type Rung,
} from '@/lib/security/role-rungs'

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

/**
 * One row of the Access grid: the area name, where its grant comes from, and
 * the No access / View / Manage segmented control. Rungs the parent already
 * guarantees are locked; a set that does not land on a rung shows as Custom
 * with one-click normalisation.
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

  return (
    <div className="flex flex-col gap-2 border-b border-divider py-2.5 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold text-foreground">
            {ladder.label}
          </div>
          <div className="text-[11.5px] text-muted-foreground">
            {isCustom ? 'Custom' : provenance}
            {isCustom && !isNil(provenance) ? ` · ${provenance}` : ''}
          </div>
        </div>

        <div
          role="radiogroup"
          aria-label={`${ladder.label} access`}
          className="inline-flex shrink-0 overflow-hidden rounded-md border border-border"
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
                  'flex min-h-11 items-center gap-1 border-r border-border px-3 text-[11.5px] font-semibold last:border-r-0 md:min-h-7',
                  'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset',
                  selected && !isLocked && 'bg-primary text-primary-foreground',
                  selected && isLocked && 'bg-muted text-foreground',
                  !selected && 'text-muted-foreground',
                  !selected &&
                    canPick &&
                    'hover:bg-accent hover:text-foreground',
                  !selected && !canPick && 'opacity-50'
                )}
              >
                {implicit ? 'Everyone can view' : RUNG_LABELS[rung]}
                {isLocked && <Lock aria-hidden className="size-2.5" />}
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-[12px] leading-snug text-muted-foreground">
        {ladder.helper}
      </p>

      {effective.kind === 'custom' && (
        <div className="rounded-md border border-secondary-border bg-secondary px-3 py-2 text-[12px] leading-relaxed text-secondary-foreground">
          <p>
            This role holds a mix that isn’t exactly View or Manage.
            {effective.present.length > 0 && (
              <>
                {' '}
                It has:{' '}
                {effective.present.map((p) => PERMISSION_LABELS[p]).join(', ')}.
              </>
            )}
            {effective.missingForView.length > 0 && (
              <>
                {' '}
                Missing for View:{' '}
                {effective.missingForView
                  .map((p) => PERMISSION_LABELS[p])
                  .join(', ')}
                .
              </>
            )}
            {effective.missingForView.length === 0 &&
              effective.missingForManage.length > 0 && (
                <>
                  {' '}
                  Missing for Manage:{' '}
                  {effective.missingForManage
                    .map((p) => PERMISSION_LABELS[p])
                    .join(', ')}
                  .
                </>
              )}
          </p>
          {!disabled && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 md:h-7"
                disabled={compareRung('view', inheritedRung) < 0}
                onClick={() => onChange('view')}
              >
                {ladder.implicitView === true
                  ? 'Set to Everyone can view'
                  : 'Set to View'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 md:h-7"
                onClick={() => onChange('manage')}
              >
                Set to Manage
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
