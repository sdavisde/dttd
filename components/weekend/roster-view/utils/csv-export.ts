import type { WeekendRosterMember } from '@/services/weekend'
import { isNil } from 'lodash'

/**
 * Column-level options that mirror the permission flags used to render the
 * roster table. Only columns the viewer is allowed to see are exported.
 */
export type RosterExportOptions = {
  includePaymentInformation?: boolean
  includeEmergencyContact?: boolean
  includeSpecialNeeds?: boolean
}

type RosterExportColumn = {
  header: string
  accessor: (member: WeekendRosterMember) => string | null | undefined
}

/**
 * Escape CSV field values to handle special characters and line breaks
 */
function escapeCsvField(value: string | null | undefined): string {
  if (isNil(value) || value === '') return ''
  const stringValue = String(value)
  // Escape double quotes and wrap in quotes if needed
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function getMemberName(member: WeekendRosterMember): string {
  if (!isNil(member.users?.first_name) && !isNil(member.users?.last_name)) {
    return `${member.users!.first_name} ${member.users!.last_name}`
  }
  return 'Unknown User'
}

/**
 * Build the export columns, including only the permission-gated columns the
 * viewer is allowed to see. The base columns (name, contact, role, forms) match
 * what every roster viewer can already see in the table.
 */
function buildRosterExportColumns(
  options: RosterExportOptions
): RosterExportColumn[] {
  const columns: RosterExportColumn[] = [
    { header: 'Name', accessor: getMemberName },
    { header: 'Email', accessor: (m) => m.users?.email },
    { header: 'Phone', accessor: (m) => m.users?.phone_number },
    { header: 'Role', accessor: (m) => m.cha_role },
    { header: 'Rollo', accessor: (m) => m.rollo },
    {
      header: 'Forms',
      accessor: (m) => (m.forms_complete ? 'Complete' : 'Incomplete'),
    },
  ]

  if (options.includeEmergencyContact === true) {
    columns.push(
      {
        header: 'Emergency Contact',
        accessor: (m) => m.medical_profile?.emergency_contact_name,
      },
      {
        header: 'Emergency Contact Phone',
        accessor: (m) => m.medical_profile?.emergency_contact_phone,
      }
    )
  }

  if (options.includeSpecialNeeds === true) {
    columns.push({
      header: 'Special Needs',
      accessor: (m) => m.special_needs,
    })
  }

  if (options.includePaymentInformation === true) {
    columns.push({
      header: 'Payment Status',
      accessor: (m) => m.paymentSummary.status,
    })
  }

  return columns
}

/**
 * Convert roster members to a CSV string.
 * Uses the permission-gated columns so only data the viewer can see is exported.
 */
export function generateRosterCsv(
  roster: WeekendRosterMember[],
  options: RosterExportOptions
): string {
  const columns = buildRosterExportColumns(options)

  const headerRow = columns.map((col) => escapeCsvField(col.header)).join(',')

  const dataRows = roster.map((member) =>
    columns.map((col) => escapeCsvField(col.accessor(member))).join(',')
  )

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Download CSV file to the user's device
 */
export function downloadRosterCsv(
  csvContent: string,
  filename: string = 'team-roster.csv'
): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Generate a filename with the current date
 */
export function generateRosterCsvFilename(weekendName?: string): string {
  const now = new Date()
  const dateString = now.toISOString().split('T')[0] // YYYY-MM-DD
  const baseName = !isNil(weekendName) ? `${weekendName}-roster` : 'team-roster'
  return `${baseName}-${dateString}.csv`
}
