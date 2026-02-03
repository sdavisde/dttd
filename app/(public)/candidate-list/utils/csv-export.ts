import { HydratedCandidate } from '@/lib/candidates/types'
import { User } from '@/lib/users/types'
import { CANDIDATE_COLUMNS, getDesktopColumns } from '../config/columns'

/**
 * Escape CSV field values to handle special characters and line breaks
 */
function escapeCsvField(value: string | null | undefined): string {
  if (!value) return ''
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

/**
 * Convert candidates to CSV string
 * Uses the permission-filtered columns to ensure only data the user can see is exported
 */
export function generateCandidateListCsv(
  candidates: HydratedCandidate[],
  user: User | null
): string {
  // Get permission-filtered columns for this user
  const columns = getDesktopColumns(user)

  // Build header row
  const headers = columns.map((col) => escapeCsvField(col.header))
  const headerRow = headers.join(',')

  // Build data rows
  const dataRows = candidates.map((candidate) => {
    const cells = columns.map((col) => {
      const value = col.accessor(candidate)
      return escapeCsvField(value)
    })
    return cells.join(',')
  })

  // Combine header and data rows with line breaks
  return [headerRow, ...dataRows].join('\n')
}

/**
 * Download CSV file to the user's device
 */
export function downloadCandidateListCsv(
  csvContent: string,
  filename: string = 'candidate-list.csv'
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
export function generateCsvFilename(weekendName?: string): string {
  const now = new Date()
  const dateString = now.toISOString().split('T')[0] // YYYY-MM-DD
  const baseName = weekendName ? `${weekendName}-candidates` : 'candidates'
  return `${baseName}-${dateString}.csv`
}
