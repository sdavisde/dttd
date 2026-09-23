'use client'

import { TriangleAlert } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import type { ResolvedSwitch } from '@/lib/security/role-rungs'
import { LockedBy, SettingRow } from './editor-layout'

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

  const notes = [
    resolved.on && (
      <span key="granted" className="font-medium text-destructive">
        Grants every permission, including future ones.
      </span>
    ),
    wouldLeaveTooFew && (
      <span
        key="too-few"
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
        with Full access. Make sure at least two people keep it before saving.
      </span>
    ),
  ].filter(Boolean)

  return (
    <SettingRow
      divider={false}
      htmlFor="full-access"
      title={<span className="font-semibold">Full access</span>}
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
        <>
          {resolved.locked && <LockedBy parentLabel={parentLabel} />}
          <Switch
            id="full-access"
            checked={resolved.on}
            disabled={disabled || resolved.locked}
            onCheckedChange={onChange}
            aria-label={
              resolved.locked
                ? `Full access (granted by ${parentLabel ?? 'the role it is based on'})`
                : 'Full access'
            }
            className="data-[state=checked]:bg-destructive"
          />
        </>
      }
      note={notes.length > 0 ? notes : undefined}
    />
  )
}
