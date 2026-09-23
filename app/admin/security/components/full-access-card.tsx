'use client'

import { Lock, TriangleAlert } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { ResolvedSwitch } from '@/lib/security/role-rungs'

interface FullAccessCardProps {
  resolved: ResolvedSwitch
  /** Distinct people who hold Full Access today, through any role. */
  totalHolders: number
  /** People who would lose Full Access if this role stopped granting it. */
  holdersLostIfRemoved: number
  /** Whether the saved role grants Full Access itself (used for the removal warning). */
  grantedWhenLoaded: boolean
  parentLabel: string | null
  disabled: boolean
  onChange: (on: boolean) => void
}

/**
 * Full access lives in its own quarantined card: the switch, the warning
 * copy, and the "never fewer than two" check against the people who hold it.
 */
export function FullAccessCard({
  resolved,
  totalHolders,
  holdersLostIfRemoved,
  grantedWhenLoaded,
  parentLabel,
  disabled,
  onChange,
}: FullAccessCardProps) {
  const removing = grantedWhenLoaded && !resolved.on
  const remainingAfterRemoval = totalHolders - holdersLostIfRemoved
  const wouldLeaveTooFew = removing && remainingAfterRemoval < 2

  return (
    <div
      className={cn(
        'rounded-md border px-3.5 py-3',
        resolved.on
          ? 'border-destructive/40 bg-destructive/5'
          : 'border-border bg-card'
      )}
    >
      <div className="flex min-h-11 items-center gap-2.5">
        <Switch
          id="full-access"
          checked={resolved.on}
          disabled={disabled || resolved.locked}
          onCheckedChange={onChange}
          aria-label="Full access"
          className="data-[state=checked]:bg-destructive"
        />
        <label
          htmlFor="full-access"
          className="flex items-center gap-2 text-[13.5px] font-semibold text-foreground"
        >
          Full access
          {resolved.locked && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Lock aria-hidden className="size-2.5" />
              from {parentLabel ?? 'the role it is based on'}
            </span>
          )}
        </label>
      </div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
        This role could do everything — read every candidate’s medical
        information, manage payments, and change what everyone else can do.{' '}
        <span className="font-semibold text-foreground">
          This is a dangerous permission to grant.
        </span>{' '}
        Give it only to people who administer the site itself, and never to
        fewer than two.
      </p>
      <p className="mt-2 text-[12.5px] text-muted-foreground tabular-nums">
        {totalHolders === 1
          ? '1 person currently holds Full Access.'
          : `${totalHolders} people currently hold Full Access.`}
      </p>
      {wouldLeaveTooFew && (
        <div
          role="alert"
          className="mt-2 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12.5px] leading-snug text-foreground"
        >
          <TriangleAlert
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-destructive"
          />
          <span>
            Turning this off would leave{' '}
            {remainingAfterRemoval === 1
              ? 'only 1 person'
              : `${Math.max(remainingAfterRemoval, 0)} people`}{' '}
            with Full Access. Make sure at least two people keep it before
            saving.
          </span>
        </div>
      )}
    </div>
  )
}
