'use client'

import { Switch } from '@/components/ui/switch'
import { SENSITIVE_PERMISSIONS } from '@/lib/security/permission-areas'
import type { ResolvedSwitch } from '@/lib/security/role-rungs'
import type { Permission } from '@/lib/security'
import { EditorSection, LockedBy, SettingRow } from './editor-layout'

interface SensitivePanelProps {
  switches: ReadonlyMap<Permission, ResolvedSwitch>
  parentLabel: string | null
  disabled: boolean
  onChange: (permission: Permission, on: boolean) => void
}

/**
 * Candidate personal details: one row per detail, off unless deliberately
 * granted. A switch the parent role grants is shown on, locked, with the
 * parent's name beside it.
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
      description="Private details candidates share in confidence. Only grant these to people who need them for care or safety — weekend leadership and the Medic get them temporarily through their roster role."
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
            title={item.label}
            description={item.helper}
            control={
              <>
                {locked && <LockedBy parentLabel={parentLabel} />}
                <Switch
                  id={id}
                  checked={on}
                  disabled={disabled || locked}
                  onCheckedChange={(checked) =>
                    onChange(item.permission, checked)
                  }
                  aria-label={
                    locked
                      ? `${item.label} (granted by ${parentLabel ?? 'the role it is based on'})`
                      : item.label
                  }
                />
              </>
            }
          />
        )
      })}
    </EditorSection>
  )
}
