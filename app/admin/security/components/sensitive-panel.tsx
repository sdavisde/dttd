'use client'

import { Lock, ShieldAlert } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { SENSITIVE_PERMISSIONS } from '@/lib/security/permission-areas'
import type { ResolvedSwitch } from '@/lib/security/role-rungs'
import type { Permission } from '@/lib/security'

interface SensitivePanelProps {
  switches: ReadonlyMap<Permission, ResolvedSwitch>
  parentLabel: string | null
  disabled: boolean
  onChange: (permission: Permission, on: boolean) => void
}

/**
 * Candidate personal details: individual switches, off unless deliberately
 * granted. A switch the parent role grants is shown on and locked.
 */
export function SensitivePanel({
  switches,
  parentLabel,
  disabled,
  onChange,
}: SensitivePanelProps) {
  return (
    <div className="rounded-md border border-secondary-border bg-secondary px-3.5 py-3">
      <div className="flex items-center gap-2 pb-1">
        <ShieldAlert
          aria-hidden
          className="size-[15px] text-secondary-foreground"
        />
        <h3 className="text-[13.5px] font-semibold text-secondary-foreground">
          Candidate personal details · sensitive
        </h3>
      </div>
      <p className="pb-1 text-[12px] leading-snug text-secondary-foreground/80">
        Off unless a role truly needs it. Weekend leadership and the Medic get
        this temporarily through their roster role.
      </p>
      {SENSITIVE_PERMISSIONS.map((item) => {
        const resolved = switches.get(item.permission)
        const on = resolved?.on ?? false
        const locked = resolved?.locked ?? false
        const id = `sensitive-${item.permission}`
        return (
          <div
            key={item.permission}
            className="flex min-h-11 items-start gap-2.5 border-b border-secondary-border py-2.5 last:border-b-0"
          >
            <Switch
              id={id}
              checked={on}
              disabled={disabled || locked}
              onCheckedChange={(checked) => onChange(item.permission, checked)}
              aria-label={item.label}
              className="mt-0.5"
            />
            <label htmlFor={id} className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
                {item.label}
                {locked && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Lock aria-hidden className="size-2.5" />
                    from {parentLabel ?? 'the role it is based on'}
                  </span>
                )}
              </span>
              <span className="text-[12px] leading-snug text-secondary-foreground/90">
                {item.helper}
              </span>
            </label>
          </div>
        )
      })}
    </div>
  )
}
