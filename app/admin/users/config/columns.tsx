'use client'

import { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { MasterRosterMember } from '@/services/master-roster/types'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { User as UserIcon, Check, Star } from 'lucide-react'
import { formatPhoneNumber } from '@/lib/utils'
import { isEmpty } from 'lodash'
import '@/components/ui/data-table/types'

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

export const masterRosterColumns: ColumnDef<MasterRosterMember>[] = [
  {
    id: 'name',
    accessorFn: (member) => {
      const firstName = member.firstName ?? ''
      const lastName = member.lastName ?? ''
      const name = `${firstName} ${lastName}`.trim()
      return name || 'Unknown User'
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ getValue }) => {
      const value = getValue<string>()
      return (
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    meta: {
      showOnMobile: true,
      mobileLabel: 'Name',
      mobilePriority: 'primary',
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
    meta: {
      showOnMobile: true,
      mobileLabel: 'Email',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'phone',
    accessorFn: (member) => member.phoneNumber,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ getValue }) => formatPhoneNumber(getValue<string | null>()),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Phone',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'role',
    accessorFn: (member) => {
      if (isEmpty(member.roles)) return '-'
      return member.roles.map((r) => r.label).join(', ')
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue<string>()}</span>
    ),
    meta: {
      filterType: 'select',
      showOnMobile: true,
      mobileLabel: 'Role',
      mobilePriority: 'secondary',
    },
  },
  {
    id: 'level',
    accessorFn: (member) => member.level,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Level"
        className="text-center"
      />
    ),
    cell: ({ getValue }) => {
      const level = getValue<number>()
      return (
        <div className="text-center">
          <Badge
            variant="secondary"
            className="font-semibold"
            style={{
              backgroundColor: `var(--experience-level-${level})`,
              color: `var(--experience-level-${level}-fg)`,
            }}
          >
            {level}
          </Badge>
        </div>
      )
    },
    meta: {
      filterType: 'select',
      showOnMobile: true,
      mobileLabel: 'Level',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'rectorReady',
    accessorFn: (member) => member.rectorReady.statusLabel,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Rector Ready"
        className="text-center"
      />
    ),
    cell: ({ row }) => {
      const rectorReady = row.original.rectorReady
      return (
        <div className="text-center">
          {rectorReady.criteria.hasServedAsRector ? (
            <div className="relative inline-flex items-center justify-center mx-auto">
              <Check className="h-5 w-5 text-green-600" />
              <Star className="h-3 w-3 text-amber-500 fill-amber-500 absolute -top-1 -right-1.5" />
            </div>
          ) : rectorReady.isReady ? (
            <Check className="h-5 w-5 text-green-600 mx-auto" />
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      )
    },
    enableSorting: false,
    meta: {
      filterType: 'select',
      showOnMobile: true,
      mobileLabel: 'Rector Ready',
      mobilePriority: 'detail',
    },
  },
]

// ---------------------------------------------------------------------------
// Global filter function
// ---------------------------------------------------------------------------

export const masterRosterGlobalFilterFn: FilterFn<MasterRosterMember> = (
  row,
  _columnId,
  filterValue
) => {
  const query = (filterValue as string).toLowerCase().trim()
  if (!query) return true

  const member = row.original
  const name =
    `${member.firstName ?? ''} ${member.lastName ?? ''}`.toLowerCase()
  const email = (member.email ?? '').toLowerCase()
  const phone = (member.phoneNumber ?? '').toLowerCase()
  const roleLabels = member.roles.map((r) => r.label.toLowerCase())

  return (
    name.includes(query) ||
    email.includes(query) ||
    phone.includes(query) ||
    roleLabels.some((label) => label.includes(query))
  )
}
