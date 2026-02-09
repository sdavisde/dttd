'use client'

import { useMemo } from 'react'
import { HydratedCandidate } from '@/lib/candidates/types'
import { User } from '@/lib/users/types'
import { DataTable, useDataTableUrlState } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { candidateColumns, candidateGlobalFilterFn } from '../config/columns'

type CandidateListTableProps = {
  candidates: HydratedCandidate[]
  user: User | null
}

export function CandidateListTable({
  candidates,
  user,
}: CandidateListTableProps) {
  const urlState = useDataTableUrlState({
    defaultSort: [{ id: 'name', desc: false }],
    defaultPageSize: 25,
  })

  // Pre-filter: exclude rejected and sponsored candidates
  const filteredCandidates = useMemo(
    () =>
      candidates.filter(
        (c) => c.status !== 'rejected' && c.status !== 'sponsored'
      ),
    [candidates]
  )

  return (
    <DataTable
      columns={candidateColumns}
      data={filteredCandidates}
      user={user}
      initialSort={[{ id: 'name', desc: false }]}
      globalFilterFn={candidateGlobalFilterFn}
      urlState={urlState}
      searchPlaceholder="Search by name, email, phone, sponsor, or church..."
      emptyState={{
        noData: (
          <p className="text-muted-foreground">
            No candidates for this weekend.
          </p>
        ),
        noResults: (
          <div className="space-y-2">
            <p className="text-muted-foreground">
              No candidates found matching your search.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => urlState.onGlobalFilterChange('')}
            >
              Clear filters
            </Button>
          </div>
        ),
      }}
    />
  )
}
