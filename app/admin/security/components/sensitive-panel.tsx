'use client'

import { Switch } from '@/components/ui/switch'
import { SENSITIVE_PERMISSIONS } from '@/lib/security/permission-areas'
import type { ResolvedSwitch } from '@/lib/security/role-rungs'
import type { Permission } from '@/lib/security'
import { EditorSection, InheritedChip, SettingRow } from './editor-layout'

interface SensitivePanelProps {
  switches: ReadonlyMap<Permission, ResolvedSwitch>
  parentLabel: string | null
  disabled: boolean
  onChange: (permission: Permission, on: boolean) => void
}

/**
 * Candidate personal details: one row per detail, off unless deliberately
 * granted. A switch the parent role grants is shown on and locked.
 */
export function SensitivePanel({
  switches,
  parentLabel,
  disabled,
  onChange,
}: SensitivePanelProps) {
  return (
    <EditorSection
      title="Sensitive data"
      description="Candidate personal details — off unless a role truly needs them. Weekend leadership and the Medic get these temporarily through their roster role."
    >
      {SENSITIVE_PERMISSIONS.map((item) => {
        const resolved = switches.get(item.permission)
        const on = resolved?.on ?? false
        const locked = resolved?.locked ?? false
        const id = `sensitive-${item.permission}`
        return (
          <SettingRow
            key={item.permission}
            htmlFor={id}
            title={
              <>
                {item.label}
                {locked && <InheritedChip parentLabel={parentLabel} />}
              </>
            }
            description={item.helper}
            control={
              <Switch
                id={id}
                checked={on}
                disabled={disabled || locked}
                onCheckedChange={(checked) =>
                  onChange(item.permission, checked)
                }
                aria-label={item.label}
              />
            }
          />
        )
      })}
    </EditorSection>
  )
}
