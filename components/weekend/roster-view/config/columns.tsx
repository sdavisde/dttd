'use client'

import type { ColumnDef, FilterFn, SortingFn } from '@tanstack/react-table'
import { Row } from '@tanstack/react-table'
import type { WeekendRosterMember } from '@/services/weekend'
import { CHARole } from '@/lib/weekend/types'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ClipboardList, Edit, Stethoscope } from 'lucide-react'
import { PaymentInfo } from '../payment-info'
import { PAYMENT_CONSTANTS } from '@/lib/constants/payments'
import '@/components/ui/data-table/types'
import { isEmpty, isNil } from 'lodash'

// ---------------------------------------------------------------------------
// Role sorting helper
// ---------------------------------------------------------------------------

const getRoleSortOrder = (role: string | null) => {
  if (isNil(role)) return 999
  const index = Object.values(CHARole).indexOf(role as CHARole)
  return index === -1 ? 998 : index
}

const roleSortingFn: SortingFn<WeekendRosterMember> = (rowA, rowB) => {
  const a = getRoleSortOrder(rowA.original.cha_role)
  const b = getRoleSortOrder(rowB.original.cha_role)
  return a - b
}

// ---------------------------------------------------------------------------
// Payment category helper
// ---------------------------------------------------------------------------

function getPaymentCategory(member: WeekendRosterMember): string {
  if (member.total_paid <= 0) return 'Unpaid'
  if (member.total_paid >= PAYMENT_CONSTANTS.TEAM_FEE) return 'Paid'
  return 'Partial'
}

// ---------------------------------------------------------------------------
// Weekend Roster Columns (with callbacks)
// ---------------------------------------------------------------------------

export interface WeekendRosterColumnCallbacks {
  onEdit: (member: WeekendRosterMember) => void
  onMedical: (member: WeekendRosterMember) => void
  onViewFormInfo: (member: WeekendRosterMember) => void
  isEditable: boolean
}

export function getWeekendRosterColumns(
  callbacks: WeekendRosterColumnCallbacks
): ColumnDef<WeekendRosterMember>[] {
  return [
    {
      id: 'name',
      accessorFn: (m) => {
        if (!isNil(m.users?.first_name) && !isNil(m.users?.last_name)) {
          return `${m.users!.first_name} ${m.users!.last_name}`
        }
        return 'Unknown User'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string>()}</span>
      ),
      meta: {
        showOnMobile: true,
        mobileLabel: 'Name',
        mobilePriority: 'primary',
      },
    },
    {
      id: 'phone',
      accessorFn: (m) => m.users?.phone_number ?? null,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {getValue<string | null>() ?? '-'}
        </span>
      ),
      meta: {
        showOnMobile: true,
        mobileLabel: 'Phone',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'role',
      accessorFn: (m) => m.cha_role,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const member = row.original
        return (
          <div>
            <span>{member.cha_role ?? '-'}</span>
            {!isNil(member.rollo) && (
              <span className="ms-1">- {member.rollo}</span>
            )}
          </div>
        )
      },
      sortingFn: roleSortingFn,
      meta: {
        filterType: 'select',
        showOnMobile: true,
        mobileLabel: 'Role',
        mobilePriority: 'secondary',
      },
    },
    {
      id: 'forms',
      accessorFn: (m) => (m.forms_complete ? 'Complete' : 'Incomplete'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Forms" />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.forms_complete}
          disabled
          aria-label={
            row.original.forms_complete
              ? 'Team forms completed'
              : 'Team forms incomplete'
          }
        />
      ),
      meta: {
        filterType: 'select',
        showOnMobile: true,
        mobileLabel: 'Forms',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'team_form_info',
      accessorFn: (m) => (m.forms_complete ? 'Complete' : 'Incomplete'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Team Forms" />
      ),
      cell: ({ row }) => {
        const member = row.original
        if (!member.forms_complete) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => callbacks.onViewFormInfo(member)}
              aria-label="View team form info"
            >
              <ClipboardList className="h-4 w-4" />
            </Button>
          </div>
        )
      },
      meta: {
        filterType: 'select',
        showOnMobile: true,
        mobileLabel: 'Team Forms',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'emergency',
      accessorFn: (m) => m.medical_profile?.emergency_contact_name ?? null,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Emergency Contact" />
      ),
      cell: ({ row }) => {
        const profile = row.original.medical_profile
        if (isNil(profile?.emergency_contact_name)) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <div className="text-sm">
            <div>{profile.emergency_contact_name}</div>
            <div className="text-muted-foreground">
              {profile.emergency_contact_phone ?? '-'}
            </div>
          </div>
        )
      },
      meta: {
        showOnMobile: true,
        mobileLabel: 'Emergency Contact',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'special_needs',
      accessorFn: (m) => (!isNil(m.special_needs) ? 'Yes' : 'None'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Special Needs" />
      ),
      cell: ({ row }) => {
        const member = row.original
        if (isNil(member.special_needs) || isEmpty(member.special_needs)) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => callbacks.onMedical(member)}
              aria-label="View special needs"
            >
              <Stethoscope className="h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false,
      meta: {
        filterType: 'select',
        showOnMobile: true,
        mobileLabel: 'Special Needs',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'payment',
      accessorFn: getPaymentCategory,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment" />
      ),
      cell: ({ row }) => {
        const member = row.original
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <PaymentInfo member={member} isEditable={callbacks.isEditable} />
          </div>
        )
      },
      meta: {
        filterType: 'select',
        showOnMobile: true,
        mobileLabel: 'Payment',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const member = row.original
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => callbacks.onEdit(member)}
            >
              <Edit className="h-4 w-4" />
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
// Dropped Roster Columns (static)
// ---------------------------------------------------------------------------

export const droppedRosterColumns: ColumnDef<WeekendRosterMember>[] = [
  {
    id: 'name',
    accessorFn: (m) => {
      if (!isNil(m.users?.first_name) && !isNil(m.users?.last_name)) {
        return `${m.users!.first_name} ${m.users!.last_name}`
      }
      return 'Unknown User'
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Name',
      mobilePriority: 'primary',
    },
  },
  {
    id: 'email',
    accessorFn: (m) => m.users?.email ?? null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {getValue<string | null>() ?? '-'}
      </span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Email',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'phone',
    accessorFn: (m) => m.users?.phone_number ?? null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {getValue<string | null>() ?? '-'}
      </span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Phone',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'role',
    accessorFn: (m) => m.cha_role,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string | null>() ?? '-'}</span>
    ),
    sortingFn: roleSortingFn,
    meta: {
      showOnMobile: true,
      mobileLabel: 'Role',
      mobilePriority: 'secondary',
    },
  },
  {
    id: 'rollo',
    accessorFn: (m) => m.rollo,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rollo" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {getValue<string | null>() ?? '-'}
      </span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Rollo',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: () => <Badge variant="destructive">Dropped</Badge>,
    enableSorting: false,
    meta: {
      showOnMobile: true,
      mobileLabel: 'Status',
      mobilePriority: 'secondary',
    },
  },
]

// ---------------------------------------------------------------------------
// Global filter function (shared by both tables)
// ---------------------------------------------------------------------------

export const rosterGlobalFilterFn: FilterFn<WeekendRosterMember> = (
  row,
  _columnId,
  filterValue
) => {
  const query = (filterValue as string).toLowerCase().trim()
  if (query === '') return true

  const member = row.original
  const name =
    `${member.users?.first_name ?? ''} ${member.users?.last_name ?? ''}`.toLowerCase()
  const email = (member.users?.email ?? '').toLowerCase()
  const phone = (member.users?.phone_number ?? '').toLowerCase()
  const role = (member.cha_role ?? '').toLowerCase()
  const status = (member.status ?? '').toLowerCase()
  const rollo = (member.rollo ?? '').toLowerCase()

  return (
    name.includes(query) ||
    email.includes(query) ||
    phone.includes(query) ||
    role.includes(query) ||
    status.includes(query) ||
    rollo.includes(query)
  )
}
