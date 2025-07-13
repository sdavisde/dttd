'use client'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { HydratedCandidate } from '@/lib/candidates/types'
import { StatusChip } from '@/components/candidates/status-chip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { HelpCircle } from 'lucide-react'

interface CandidateTableProps {
  candidates: HydratedCandidate[]
  onRowClick: (candidate: HydratedCandidate) => void
  onStatusInfoClick: () => void
}

export function CandidateTable({ candidates, onRowClick, onStatusInfoClick }: CandidateTableProps) {
  return (
    <Table>
      {/* // todo: Need to make sure mens/womens column is added */}
      <TableHeader>
        <TableRow>
          <TableHead>Candidate Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Sponsor</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>
            <div className='flex items-center gap-1'>
              <span>Status</span>
              <Button
                onClick={onStatusInfoClick}
                title='Status Information'
                variant='ghost'
              >
                <HelpCircle
                  size={20}
                  className='text-muted-foreground'
                />
              </Button>
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate, index) => (
          <TableRow
            key={candidate.id}
            onClick={() => onRowClick(candidate)}
            className={cn(index % 2 === 0 ? 'bg-transparent' : 'bg-muted', 'hover:bg-muted/50 cursor-pointer')}
          >
            <TableCell>{candidate.candidate_sponsorship_info?.candidate_name}</TableCell>
            <TableCell>{candidate.candidate_sponsorship_info?.candidate_email}</TableCell>
            <TableCell>{candidate.candidate_sponsorship_info?.sponsor_name}</TableCell>
            <TableCell>{new Date(candidate.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <StatusChip status={candidate.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
