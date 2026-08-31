'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileText } from 'lucide-react'
import type { HydratedCandidate } from '@/lib/candidates/types'
import type { User } from '@/lib/users/types'
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
