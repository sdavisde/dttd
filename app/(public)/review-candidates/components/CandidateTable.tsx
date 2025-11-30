import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HydratedCandidate } from '@/lib/candidates/types'
import { StatusChip } from '@/components/candidates/status-chip'
import { cn } from '@/lib/utils'

interface CandidateTableProps {
  candidates: HydratedCandidate[]
  onRowClick: (candidate: HydratedCandidate) => void
}

export function CandidateTable({
  candidates,
  onRowClick,
}: CandidateTableProps) {
  return (
    <>
      {/* Desktop Table - Hidden on mobile */}
      <div className="relative hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Sponsor</TableHead>
              <TableHead>Weekend</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate, index) => (
              <TableRow
                key={candidate.id}
                onClick={() => onRowClick(candidate)}
                className={cn(
                  index % 2 === 0 ? 'bg-transparent' : 'bg-muted',
                  'hover:bg-muted/50 cursor-pointer'
                )}
              >
                <TableCell>
                  {candidate.candidate_sponsorship_info?.candidate_name}
                </TableCell>
                <TableCell>
                  {candidate.candidate_sponsorship_info?.candidate_email}
                </TableCell>
                <TableCell>
                  {candidate.candidate_sponsorship_info?.sponsor_name}
                </TableCell>
                {/*<TableCell>
                  {candidate.weekends?.type === 'MENS' ? "Men's" : candidate.weekends?.type === 'WOMENS' ? "Women's" : 'Unassigned'}
                </TableCell>*/}
                <TableCell>
                  {new Date(candidate.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <StatusChip status={candidate.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card Layout - Shown only on mobile */}
      <div className="md:hidden space-y-3">
        {candidates.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No candidates found for this filter.
          </div>
        ) : (
          candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-card border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(candidate)}
            >
              {/* Header with name and status */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {candidate.candidate_sponsorship_info?.candidate_name ||
                    'Unknown Candidate'}
                </h3>
                <StatusChip status={candidate.status} />
              </div>

              {/* Content sections */}
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="text-muted-foreground w-16">Email:</span>
                  <span>
                    {candidate.candidate_sponsorship_info?.candidate_email ||
                      'Not provided'}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-16">Sponsor:</span>
                  <span>
                    {candidate.candidate_sponsorship_info?.sponsor_name ||
                      'Unknown'}
                  </span>
                </div>
                {/*<div className="flex">
                  <span className="text-muted-foreground w-16">Weekend:</span>
                  <span>
                    {candidate.weekends?.type === 'MENS'
                      ? "Men's Weekend"
                      : candidate.weekends?.type === 'WOMENS'
                        ? "Women's Weekend"
                        : 'Unassigned'}
                  </span>
                </div>*/}
                <div className="flex">
                  <span className="text-muted-foreground w-16">Submitted:</span>
                  <span>
                    {new Date(candidate.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
