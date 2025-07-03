'use client'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Box } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { Candidate } from '@/lib/candidates/types'
import { StatusChip } from '@/components/candidates/status-chip'

interface CandidateTableProps {
  candidates: Candidate[]
  onRowClick: (candidate: Candidate) => void
  onStatusInfoClick: () => void
}

export function CandidateTable({ candidates, onRowClick, onStatusInfoClick }: CandidateTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Candidate Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Sponsor</TableCell>
            <TableCell>Submitted</TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Status</span>
                <IconButton
                  size='small'
                  onClick={onStatusInfoClick}
                  sx={{ p: 0.5 }}
                  title='Status Information'
                >
                  <HelpOutlineIcon fontSize='small' />
                </IconButton>
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {candidates.map((candidate, index) => (
            <TableRow
              key={candidate.id}
              onClick={() => onRowClick(candidate)}
              sx={{
                backgroundColor: index % 2 === 0 ? 'inherit' : 'rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  cursor: 'pointer',
                },
              }}
            >
              <TableCell sx={{ fontWeight: 'bold' }}>{candidate.name}</TableCell>
              <TableCell>{candidate.email}</TableCell>
              <TableCell>{candidate.sponsor_name}</TableCell>
              <TableCell>{new Date(candidate.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <StatusChip status={candidate.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
