'use client'

import { TriangleAlert } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import type { ResolvedSwitch } from '@/lib/security/role-rungs'
import { InheritedChip, SettingRow } from './editor-layout'

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
 * The Full access row inside the danger zone: the switch, who holds it today,
 * and the "never fewer than two" check when it is being taken away.
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
    <SettingRow
      divider={false}
      className="rounded-md border border-destructive/40 px-3.5"
      htmlFor="full-access"
      title={
        <>
          Full access
          {resolved.locked && <InheritedChip parentLabel={parentLabel} />}
        </>
      }
      description={
        <>
          This role could do everything — read every candidate’s medical
          information, manage payments, and change what everyone else can do.
          Give it only to people who administer the site itself, and never to
          fewer than two.{' '}
          <span className="tabular-nums">
            {totalHolders === 1
              ? '1 person currently holds Full access.'
              : `${totalHolders} people currently hold Full access.`}
          </span>
        </>
      }
      control={
        <Switch
          id="full-access"
          checked={resolved.on}
          disabled={disabled || resolved.locked}
          onCheckedChange={onChange}
          aria-label="Full access"
          className="data-[state=checked]:bg-destructive"
        />
      }
      note={
        wouldLeaveTooFew ? (
          <span
            role="alert"
            className="flex items-start gap-1.5 text-foreground"
          >
            <TriangleAlert
              aria-hidden
              className="mt-px size-3.5 shrink-0 text-destructive"
            />
            Turning this off would leave{' '}
            {remainingAfterRemoval === 1
              ? 'only 1 person'
              : `${Math.max(remainingAfterRemoval, 0)} people`}{' '}
            with Full access. Make sure at least two people keep it before
            saving.
          </span>
        ) : undefined
      }
    />
  )
}
