'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText } from 'lucide-react'
import type { WeekendRosterMember } from '@/services/weekend'
import {
  generateRosterCsv,
  downloadRosterCsv,
  generateRosterCsvFilename,
  type RosterExportOptions,
} from './utils/csv-export'

type ExportRosterButtonProps = {
  roster: WeekendRosterMember[]
  /** Whether the viewer is allowed to export (mirrors WRITE_TEAM_ROSTER) */
  canExport: boolean
  /** Permission-gated columns to include in the export */
  options: RosterExportOptions
  weekendName?: string
}

export function ExportRosterButton({
  roster,
  canExport,
  options,
  weekendName,
}: ExportRosterButtonProps) {
  if (!canExport) {
    return null
  }

  const handleExportCsv = () => {
    // Exclude dropped members so the export matches the active roster table
    const activeRoster = roster.filter((member) => member.status !== 'drop')
    const csvContent = generateRosterCsv(activeRoster, options)
    const filename = generateRosterCsvFilename(weekendName)
    downloadRosterCsv(csvContent, filename)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCsv}>
          <FileText className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
