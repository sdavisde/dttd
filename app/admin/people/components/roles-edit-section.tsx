'use client'

import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import { Typography } from '@/components/ui/typography'

interface RolesEditSectionProps {
  options: { value: string; label: string }[]
  selectedRoleIds: string[]
  onChange: (ids: string[]) => void
  disabled: boolean
}

export function RolesEditSection({
  options,
  selectedRoleIds,
  onChange,
  disabled,
}: RolesEditSectionProps) {
  return (
    <section className="space-y-2">
      <Typography variant="muted" className="text-sm font-bold">
        Security Settings
      </Typography>
      <div className="bg-muted/20 rounded-md p-4 space-y-3 border">
        <div className="space-y-1">
          <Label className="text-xs">User Roles</Label>
          <MultiSelect
            options={options}
            onValueChange={onChange}
            defaultValue={selectedRoleIds}
            placeholder="Select roles"
            disabled={disabled}
          />
        </div>
      </div>
    </section>
  )
}
