'use client'

import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { Role } from '@/services/identity/roles'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import '@/components/ui/data-table/types'

// ---------------------------------------------------------------------------
// Callbacks interface
// ---------------------------------------------------------------------------

export interface RolesColumnCallbacks {
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  readOnly: boolean
  isDeleting: boolean
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

export function getRolesColumns(
  callbacks: RolesColumnCallbacks
): ColumnDef<Role>[] {
  return [
    {
      id: 'label',
      accessorKey: 'label',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const role = row.original
        return (
          <div className="flex min-w-0 flex-col gap-0.5 py-0.5">
            <span className="text-sm font-semibold">{role.label}</span>
            {typeof role.description === 'string' &&
              role.description !== '' && (
                <span className="line-clamp-2 max-w-md text-[13px] leading-snug whitespace-normal text-muted-foreground">
                  {role.description}
                </span>
              )}
          </div>
        )
      },
      meta: {
        showOnMobile: true,
        mobileLabel: 'Role',
        mobilePriority: 'primary',
      },
    },
    {
      id: 'permissions',
      accessorFn: (role) => role.permissions?.join(', ') ?? '',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Permissions" />
      ),
      cell: ({ row }) => {
        const role = row.original
        const permissions = role.permissions ?? []

        return (
          <div className="flex flex-wrap gap-1">
            {permissions.slice(0, 3).map((permission, index) => (
              <Badge
                key={index}
                variant="outline"
                className="rounded-full text-xs font-medium"
              >
                {permission}
              </Badge>
            ))}
            {permissions.length > 3 && (
              <span className="text-muted-foreground text-[13px]">
                +{permissions.length - 3} more
              </span>
            )}
          </div>
        )
      },
      enableSorting: false,
      meta: {
        showOnMobile: true,
        mobileLabel: 'Permissions',
        mobilePriority: 'secondary',
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const role = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                callbacks.onEdit(role)
              }}
              className="h-8 w-8 p-0"
              disabled={callbacks.readOnly}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit role</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                callbacks.onDelete(role)
              }}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              disabled={callbacks.isDeleting || callbacks.readOnly}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete role</span>
            </Button>
          </div>
        )
      },
      enableSorting: false,
      meta: {
        showOnMobile: false,
      },
    },
  ]
}

// ---------------------------------------------------------------------------
// Global filter function
// ---------------------------------------------------------------------------

export const rolesGlobalFilterFn: FilterFn<Role> = (
  row,
  _columnId,
  filterValue
) => {
  const query = (filterValue as string).toLowerCase().trim()
  if (query === '') return true

  const role = row.original
  const label = role.label.toLowerCase()
  const permissions = (role.permissions ?? []).map((p) => p.toLowerCase())

  return (
    label.includes(query) || permissions.some((perm) => perm.includes(query))
  )
}
