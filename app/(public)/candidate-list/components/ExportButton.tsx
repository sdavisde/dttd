'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText } from 'lucide-react'
import { HydratedCandidate } from '@/lib/candidates/types'
import { User } from '@/lib/users/types'
import { userHasPermission, Permission } from '@/lib/security'
import { isNil } from 'lodash'
import {
  generateCandidateListCsv,
  downloadCandidateListCsv,
  generateCsvFilename,
} from '../utils/csv-export'

type ExportButtonProps = {
  candidates: HydratedCandidate[]
  user: User | null
  weekendName?: string
}

export function ExportButton({
  candidates,
  user,
  weekendName,
}: ExportButtonProps) {
  // Check if user has permission to export
  const canExport =
    !isNil(user) && userHasPermission(user, [Permission.EXPORT_CANDIDATE_LIST])

  if (!canExport) {
    return null
  }

  const handleExportCsv = () => {
    const csvContent = generateCandidateListCsv(candidates, user)
    const filename = generateCsvFilename(weekendName)
    downloadCandidateListCsv(csvContent, filename)
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
