'use client'

import { ColumnDef, FilterFn } from '@tanstack/react-table'
import { HydratedCandidate } from '@/lib/candidates/types'
import { PAYMENT_CONSTANTS } from '@/lib/constants/payments'
import { Permission, userHasPermission } from '@/lib/security'
import { User } from '@/lib/users/types'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { isNil } from 'lodash'
import '@/components/ui/data-table/types'

// ---------------------------------------------------------------------------
// Helper functions (ported from old columns.ts)
// ---------------------------------------------------------------------------

function calculateAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--
  }
  return age
}

function formatEmergencyContact(candidate: HydratedCandidate): string | null {
  const name = candidate.candidate_info?.emergency_contact_name
  const phone = candidate.candidate_info?.emergency_contact_phone
  if (!name) return null
  return phone ? `${name} (${phone})` : name
}

function getName(c: HydratedCandidate): string | null {
  return c.candidate_info?.first_name && c.candidate_info?.last_name
    ? `${c.candidate_info.first_name} ${c.candidate_info.last_name}`
    : (c.candidate_sponsorship_info?.candidate_name ?? null)
}

function getEmail(c: HydratedCandidate): string | null {
  return (
    c.candidate_info?.email ??
    c.candidate_sponsorship_info?.candidate_email ??
    null
  )
}

function getPaymentStatus(c: HydratedCandidate): string {
  const totalFee = PAYMENT_CONSTANTS.CANDIDATE_FEE
  const paid =
    c.candidate_payments?.reduce((sum, p) => sum + p.gross_amount, 0) ?? 0
  const balance = totalFee - paid
  if (balance <= 0) return 'Paid'
  if (paid > 0) return `$${paid} / $${totalFee}`
  return 'Unpaid'
}

// ---------------------------------------------------------------------------
// TanStack Table column definitions
// ---------------------------------------------------------------------------

export const candidateColumns: ColumnDef<HydratedCandidate>[] = [
  {
    id: 'name',
    accessorFn: getName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string | null>() ?? '-'}</span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Name',
      mobilePriority: 'primary',
    },
  },
  {
    id: 'email',
    accessorFn: getEmail,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
    meta: {
      requiredPermission: Permission.READ_CANDIDATE_CONTACT_INFO,
      showOnMobile: true,
      mobileLabel: 'Email',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'phone',
    accessorFn: (c) => c.candidate_info?.phone ?? null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
    meta: {
      requiredPermission: Permission.READ_CANDIDATE_CONTACT_INFO,
      showOnMobile: true,
      mobileLabel: 'Phone',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'shirtSize',
    accessorFn: (c) => c.candidate_info?.shirt_size ?? null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="T-shirt Size" />
    ),
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
    meta: {
      requiredPermission: Permission.READ_CANDIDATE_SHIRT_SIZE,
      showOnMobile: false,
      mobileLabel: 'T-shirt Size',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'emergencyContact',
    accessorFn: formatEmergencyContact,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Emergency Contact" />
    ),
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
    meta: {
      requiredPermission: Permission.READ_CANDIDATE_EMERGENCY_CONTACT,
      showOnMobile: true,
      mobileLabel: 'Emergency Contact',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'sponsor',
    accessorFn: (c) => c.candidate_sponsorship_info?.sponsor_name ?? null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sponsor" />
    ),
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
    meta: {
      requiredPermission: Permission.READ_CANDIDATE_SPONSOR_INFO,
      showOnMobile: true,
      mobileLabel: 'Sponsor',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'sponsorPhone',
    accessorFn: (c) => c.candidate_sponsorship_info?.sponsor_phone ?? null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sponsor Phone" />
    ),
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
    meta: {
      requiredPermission: Permission.READ_CANDIDATE_SPONSOR_INFO,
      showOnMobile: false,
      mobileLabel: 'Sponsor Phone',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'sponsorEmail',
    accessorFn: (c) => c.candidate_sponsorship_info?.sponsor_email ?? null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sponsor Email" />
    ),
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
    meta: {
      requiredPermission: Permission.READ_CANDIDATE_SPONSOR_INFO,
      showOnMobile: false,
      mobileLabel: 'Sponsor Email',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'sponsorChurch',
    accessorFn: (c) => c.candidate_sponsorship_info?.sponsor_church ?? null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sponsor Church" />
    ),
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
    meta: {
      requiredPermission: Permission.READ_CANDIDATE_SPONSOR_INFO,
      showOnMobile: false,
      mobileLabel: 'Sponsor Church',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'age',
    accessorFn: (c) => {
      const age = calculateAge(c.candidate_info?.date_of_birth)
      return age !== null ? String(age) : null
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age" />
    ),
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
    sortingFn: (rowA, rowB) => {
      const a = parseInt(rowA.getValue('age') as string, 10) || 0
      const b = parseInt(rowB.getValue('age') as string, 10) || 0
      return a - b
    },
    meta: {
      requiredPermission: Permission.READ_CANDIDATE_TABLE_ASSIGNMENT_PROPERTIES,
      showOnMobile: false,
      mobileLabel: 'Age',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'maritalStatus',
    accessorFn: (c) => c.candidate_info?.marital_status ?? null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Marital Status" />
    ),
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
    meta: {
      requiredPermission: Permission.READ_CANDIDATE_MARITAL_STATUS,
      showOnMobile: false,
      mobileLabel: 'Marital Status',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'medicalConditions',
    accessorFn: (c) => c.candidate_info?.medical_conditions ?? null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Medical Conditions" />
    ),
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
    meta: {
      requiredPermission: Permission.READ_CANDIDATE_MEDICAL_INFO,
      showOnMobile: false,
      mobileLabel: 'Medical Conditions',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'church',
    accessorFn: (c) => c.candidate_info?.church ?? null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Church" />
    ),
    cell: ({ getValue }) => getValue<string | null>() ?? '-',
    meta: {
      requiredPermission: Permission.READ_CANDIDATE_CHURCH,
      filterType: 'select',
      showOnMobile: true,
      mobileLabel: 'Church',
      mobilePriority: 'secondary',
    },
  },
  {
    id: 'payment',
    accessorFn: getPaymentStatus,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment" />
    ),
    cell: ({ getValue }) => {
      const value = getValue<string>()
      return (
        <span
          className={
            value === 'Paid'
              ? 'text-green-600 dark:text-green-400'
              : value === 'Unpaid'
                ? 'text-red-600 dark:text-red-400'
                : ''
          }
        >
          {value}
        </span>
      )
    },
    meta: {
      requiredPermission: Permission.READ_CANDIDATE_PAYMENTS,
      filterType: 'select',
      showOnMobile: true,
      mobileLabel: 'Payment',
      mobilePriority: 'secondary',
    },
  },
]

// ---------------------------------------------------------------------------
// Global filter function for candidate search
// ---------------------------------------------------------------------------

export const candidateGlobalFilterFn: FilterFn<HydratedCandidate> = (
  row,
  _columnId,
  filterValue
) => {
  const query = (filterValue as string).toLowerCase().trim()
  if (!query) return true

  const candidate = row.original

  const candidateName = (
    candidate.candidate_sponsorship_info?.candidate_name ?? ''
  ).toLowerCase()
  const firstName = (candidate.candidate_info?.first_name ?? '').toLowerCase()
  const lastName = (candidate.candidate_info?.last_name ?? '').toLowerCase()
  const email = (
    candidate.candidate_info?.email ??
    candidate.candidate_sponsorship_info?.candidate_email ??
    ''
  ).toLowerCase()
  const phone = (candidate.candidate_info?.phone ?? '').toLowerCase()
  const sponsorName = (
    candidate.candidate_sponsorship_info?.sponsor_name ?? ''
  ).toLowerCase()
  const church = (candidate.candidate_info?.church ?? '').toLowerCase()
  const sponsorChurch = (
    candidate.candidate_sponsorship_info?.sponsor_church ?? ''
  ).toLowerCase()

  return (
    candidateName.includes(query) ||
    firstName.includes(query) ||
    lastName.includes(query) ||
    email.includes(query) ||
    phone.includes(query) ||
    sponsorName.includes(query) ||
    church.includes(query) ||
    sponsorChurch.includes(query)
  )
}

// ---------------------------------------------------------------------------
// Legacy exports for csv-export.ts compatibility
// ---------------------------------------------------------------------------

export type CandidateColumnConfig<T = string | null> = {
  id: string
  header: string
  accessor: (candidate: HydratedCandidate) => T
  showOnMobile: boolean
  mobileLabel?: string
  minWidth?: string
  requiredPermission?: Permission
}

export const CANDIDATE_COLUMNS: CandidateColumnConfig[] = [
  {
    id: 'name',
    header: 'Name',
    accessor: getName,
    showOnMobile: true,
    minWidth: '180px',
  },
  {
    id: 'email',
    header: 'Email',
    accessor: getEmail,
    showOnMobile: true,
    minWidth: '200px',
    requiredPermission: Permission.READ_CANDIDATE_CONTACT_INFO,
  },
  {
    id: 'phone',
    header: 'Phone',
    accessor: (c) => c.candidate_info?.phone ?? null,
    showOnMobile: true,
    minWidth: '130px',
    requiredPermission: Permission.READ_CANDIDATE_CONTACT_INFO,
  },
  {
    id: 'shirtSize',
    header: 'T-shirt Size',
    accessor: (c) => c.candidate_info?.shirt_size ?? null,
    showOnMobile: false,
    minWidth: '100px',
    requiredPermission: Permission.READ_CANDIDATE_SHIRT_SIZE,
  },
  {
    id: 'emergencyContact',
    header: 'Emergency Contact',
    accessor: formatEmergencyContact,
    showOnMobile: true,
    minWidth: '200px',
    requiredPermission: Permission.READ_CANDIDATE_EMERGENCY_CONTACT,
  },
  {
    id: 'sponsor',
    header: 'Sponsor',
    accessor: (c) => c.candidate_sponsorship_info?.sponsor_name ?? null,
    showOnMobile: true,
    minWidth: '150px',
    requiredPermission: Permission.READ_CANDIDATE_SPONSOR_INFO,
  },
  {
    id: 'sponsorPhone',
    header: 'Sponsor Phone',
    accessor: (c) => c.candidate_sponsorship_info?.sponsor_phone ?? null,
    showOnMobile: false,
    minWidth: '130px',
    requiredPermission: Permission.READ_CANDIDATE_SPONSOR_INFO,
  },
  {
    id: 'sponsorEmail',
    header: 'Sponsor Email',
    accessor: (c) => c.candidate_sponsorship_info?.sponsor_email ?? null,
    showOnMobile: false,
    minWidth: '180px',
    requiredPermission: Permission.READ_CANDIDATE_SPONSOR_INFO,
  },
  {
    id: 'sponsorChurch',
    header: 'Sponsor Church',
    accessor: (c) => c.candidate_sponsorship_info?.sponsor_church ?? null,
    showOnMobile: false,
    minWidth: '150px',
    requiredPermission: Permission.READ_CANDIDATE_SPONSOR_INFO,
  },
  {
    id: 'age',
    header: 'Age',
    accessor: (c) => {
      const age = calculateAge(c.candidate_info?.date_of_birth)
      return age !== null ? String(age) : null
    },
    showOnMobile: false,
    minWidth: '60px',
    requiredPermission: Permission.READ_CANDIDATE_TABLE_ASSIGNMENT_PROPERTIES,
  },
  {
    id: 'maritalStatus',
    header: 'Marital Status',
    accessor: (c) => c.candidate_info?.marital_status ?? null,
    showOnMobile: false,
    minWidth: '120px',
    requiredPermission: Permission.READ_CANDIDATE_MARITAL_STATUS,
  },
  {
    id: 'medicalConditions',
    header: 'Medical Conditions',
    accessor: (c) => c.candidate_info?.medical_conditions ?? null,
    showOnMobile: false,
    minWidth: '200px',
    requiredPermission: Permission.READ_CANDIDATE_MEDICAL_INFO,
  },
  {
    id: 'church',
    header: 'Church',
    accessor: (c) => c.candidate_info?.church ?? null,
    showOnMobile: true,
    minWidth: '150px',
    requiredPermission: Permission.READ_CANDIDATE_CHURCH,
  },
  {
    id: 'payment',
    header: 'Payment',
    accessor: getPaymentStatus,
    showOnMobile: true,
    minWidth: '120px',
    requiredPermission: Permission.READ_CANDIDATE_PAYMENTS,
  },
]

export function filterColumnsByPermissions(
  columns: CandidateColumnConfig[],
  user: User | null
): CandidateColumnConfig[] {
  return columns.filter((column) => {
    if (isNil(column.requiredPermission)) return true
    if (isNil(user)) return false
    return userHasPermission(user, [column.requiredPermission])
  })
}

export function getDesktopColumns(user: User | null): CandidateColumnConfig[] {
  return filterColumnsByPermissions(CANDIDATE_COLUMNS, user)
}
