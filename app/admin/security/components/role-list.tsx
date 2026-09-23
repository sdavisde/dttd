'use client'

import { isNil } from 'lodash'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Role } from '@/services/identity/roles'
import { roleLabelById } from '../lib/editor-model'

interface RoleListProps {
  roles: Role[]
  selectedRoleId: string | null
  canEdit: boolean
  onSelect: (role: Role) => void
  onDuplicate: (role: Role) => void
}

/**
 * The master list: name, "Based on X", the plain-language description, and a
 * Duplicate button per row. The selected row carries the board's left bar.
 */
export function RoleList({
  roles,
  selectedRoleId,
  canEdit,
  onSelect,
  onDuplicate,
}: RoleListProps) {
  if (roles.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        No roles yet.
      </div>
    )
  }

  return (
    <ul className="overflow-hidden rounded-md border border-border bg-card">
      {roles.map((role) => {
        const selected = role.id === selectedRoleId
        const basedOn = roleLabelById(role.based_on_role_id, roles)
        return (
          <li
            key={role.id}
            className={cn(
              'flex items-start gap-2.5 border-b border-divider last:border-b-0',
              selected && 'bg-selected border-l-[3px] border-l-primary'
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(role)}
              aria-current={selected ? 'true' : undefined}
              className={cn(
                'flex min-h-11 min-w-0 flex-1 flex-col gap-0.5 px-3.5 py-3 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                selected && 'pl-[11px]'
              )}
            >
              <span className="text-sm font-semibold text-foreground">
                {role.label}
              </span>
              {!isNil(basedOn) && (
                <span className="text-xs text-muted-foreground">
                  Based on {basedOn}
                </span>
              )}
              {!isNil(role.description) && role.description !== '' && (
                <span className="text-[12.5px] leading-snug text-muted-foreground">
                  {role.description}
                </span>
              )}
            </button>
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onDuplicate(role)}
                className="mt-2.5 mr-3 h-11 w-11 shrink-0 md:h-7 md:w-7"
                aria-label={`Duplicate ${role.label}`}
                title="Duplicate"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
