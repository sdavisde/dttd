import { HydratedCandidate } from '@/lib/candidates/types'
import { Permission, userHasPermission } from '@/lib/security'
import { User } from '@/lib/users/types'
import { format } from 'date-fns'
import { isNil } from 'lodash'

/**
 * Column definition using a binding pattern.
 * The accessor function extracts the value from a candidate,
 * keeping business logic out of the UI components.
 */
export type CandidateColumnConfig<T = string | null> = {
  /** Unique identifier for the column */
  id: string
  /** Display header for the column */
  header: string
  /** Function to extract and format the value from a candidate */
  accessor: (candidate: HydratedCandidate) => T
  /** Whether to show this column on mobile */
  showOnMobile: boolean
  /** Mobile label (defaults to header if not provided) */
  mobileLabel?: string
  /** Minimum width for desktop table */
  minWidth?: string
  /** Optional permission required to view this column (column hidden if user lacks permission) */
  requiredPermission?: Permission
}

/**
 * Helper to calculate age from date of birth
 */
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

/**
 * Format emergency contact as "Name (Phone)"
 */
function formatEmergencyContact(candidate: HydratedCandidate): string | null {
  const name = candidate.candidate_info?.emergency_contact_name
  const phone = candidate.candidate_info?.emergency_contact_phone
  if (!name) return null
  return phone ? `${name} (${phone})` : name
}

/**
 * Format birthday as readable date
 */
function formatBirthday(dateOfBirth: string | null | undefined): string | null {
  if (!dateOfBirth) return null
  try {
    return format(new Date(dateOfBirth), 'MMM d, yyyy')
  } catch {
    return dateOfBirth
  }
}

/**
 * All available columns for the candidate list.
 * Use DESKTOP_COLUMNS and MOBILE_COLUMNS to select which to display.
 */
export const CANDIDATE_COLUMNS: CandidateColumnConfig[] = [
  {
    id: 'name',
    header: 'Name',
    accessor: (c) =>
      c.candidate_info?.first_name && c.candidate_info?.last_name
        ? `${c.candidate_info.first_name} ${c.candidate_info.last_name}`
        : (c.candidate_sponsorship_info?.candidate_name ?? null),
    showOnMobile: true,
    minWidth: '180px',
  },
  {
    id: 'email',
    header: 'Email',
    accessor: (c) =>
      c.candidate_info?.email ??
      c.candidate_sponsorship_info?.candidate_email ??
      null,
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
  // {
  //   id: 'birthday',
  //   header: 'Birthday',
  //   accessor: (c) => formatBirthday(c.candidate_info?.date_of_birth),
  //   showOnMobile: false,
  //   minWidth: '120px',
  // },
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
]

/**
 * Filter columns based on user permissions.
 * Columns without a requiredPermission are always visible.
 * Columns with a requiredPermission are only visible if the user has that permission.
 */
export function filterColumnsByPermissions(
  columns: CandidateColumnConfig[],
  user: User | null
): CandidateColumnConfig[] {
  return columns.filter((column) => {
    // No permission required - always visible
    if (isNil(column.requiredPermission)) {
      return true
    }
    // No user - hide restricted columns
    if (isNil(user)) {
      return false
    }
    // Check if user has the required permission
    return userHasPermission(user, [column.requiredPermission])
  })
}

/**
 * Get desktop columns filtered by user permissions
 */
export function getDesktopColumns(user: User | null): CandidateColumnConfig[] {
  return filterColumnsByPermissions(CANDIDATE_COLUMNS, user)
}

/**
 * Get mobile columns filtered by showOnMobile flag and user permissions
 */
export function getMobileColumns(user: User | null): CandidateColumnConfig[] {
  const mobileColumns = CANDIDATE_COLUMNS.filter((col) => col.showOnMobile)
  return filterColumnsByPermissions(mobileColumns, user)
}

/**
 * Desktop columns - all columns (for backward compatibility, use getDesktopColumns for permission filtering)
 */
export const DESKTOP_COLUMNS = CANDIDATE_COLUMNS

/**
 * Mobile columns - filtered by showOnMobile flag (for backward compatibility, use getMobileColumns for permission filtering)
 */
export const MOBILE_COLUMNS = CANDIDATE_COLUMNS.filter(
  (col) => col.showOnMobile
)

/**
 * Get column by ID
 */
export function getColumnById(id: string): CandidateColumnConfig | undefined {
  return CANDIDATE_COLUMNS.find((col) => col.id === id)
}
