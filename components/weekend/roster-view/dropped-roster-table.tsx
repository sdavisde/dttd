'use client'

import { useMemo } from 'react'
import { WeekendRosterMember } from '@/services/weekend'
import { DataTable } from '@/components/ui/data-table'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { droppedRosterColumns, rosterGlobalFilterFn } from './config/columns'

type DroppedRosterTableProps = {
  roster: Array<WeekendRosterMember>
}

export function DroppedRosterTable({ roster }: DroppedRosterTableProps) {
  // Filter to only show dropped members
  const droppedMembers = useMemo(() => {
    return roster.filter((member) => member.status === 'drop')
  }, [roster])

  // URL state management
  const urlState = useDataTableUrlState({
    defaultSort: [{ id: 'role', desc: false }],
  })

  // Early return if no dropped members and no search query
  if (droppedMembers.length === 0 && !urlState.globalFilter) {
    return null
  }

  return (
    <DataTable
      columns={droppedRosterColumns}
      data={droppedMembers}
      user={null}
      urlState={urlState}
      globalFilterFn={rosterGlobalFilterFn}
      searchPlaceholder="Search dropped members..."
      emptyState={{
        noData: 'No dropped members.',
        noResults: 'No dropped members found matching your search.',
      }}
    />
  )
}
