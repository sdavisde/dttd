'use client'

import { useState } from 'react'
import Link from 'next/link'
import { isNil } from 'lodash'
import { PersonEditor } from './person-editor'
import { SelectedMemberProvider } from './selected-member-context'
import { DataTable, useDataTableUrlState } from '@/components/ui/data-table'
import type {
  MasterRoster as MasterRosterType,
  MasterRosterMember,
} from '@/services/master-roster/types'
import {
  masterRosterColumns,
  masterRosterGlobalFilterFn,
} from '../config/columns'

interface PeopleTableProps {
  masterRoster: MasterRosterType
  roles: Array<{ id: string; label: string; permissions: string[] }>
  canViewExperience: boolean
  canEdit: boolean
}

/**
 * Tints the row whose editor is open and gives it the board's 3px left bar.
 * The shared DataTable has no per-row class hook, so the selected row publishes
 * an invisible marker (see selected-member-context) that these `:has()` rules
 * key off. The first cell loses 3px of padding to absorb the bar.
 */
const SELECTED_ROW_CLASSES = [
  '[&_tbody_tr:has([data-row-selected])]:bg-selected',
  '[&_tbody_tr:has([data-row-selected])>td:first-child]:border-l-[3px]',
  '[&_tbody_tr:has([data-row-selected])>td:first-child]:border-l-primary',
  '[&_tbody_tr:has([data-row-selected])>td:first-child]:pl-[9px]',
].join(' ')

export default function PeopleTable({
  masterRoster,
  roles,
  canViewExperience,
  canEdit,
}: PeopleTableProps) {
  const [selectedMember, setSelectedMember] =
    useState<MasterRosterMember | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const urlState = useDataTableUrlState({ defaultPageSize: 25 })

  const handleMemberClick = (member: MasterRosterMember) => {
    setSelectedMember(member)
    setIsEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setSelectedMember(null)
    setIsEditorOpen(false)
  }

  const selectedMemberId =
    isEditorOpen && !isNil(selectedMember) ? selectedMember.id : null

  return (
    <SelectedMemberProvider value={selectedMemberId}>
      <div className="my-4 flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1">
          <DataTable
            columns={masterRosterColumns}
            data={masterRoster.members}
            user={null}
            globalFilterFn={masterRosterGlobalFilterFn}
            urlState={urlState}
            searchPlaceholder="Find a person…"
            onRowClick={handleMemberClick}
            columnVisibility={{
              level: canViewExperience,
              rectorReady: canViewExperience,
            }}
            emptyState={{
              noData: 'No users found in the system.',
              noResults: 'No users found matching your search.',
            }}
            appearance={{
              zebra: false,
              container: `bg-card overflow-hidden [&_tbody_tr]:border-divider ${SELECTED_ROW_CLASSES}`,
              header:
                'h-auto px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground [&_button]:h-7 [&_button]:text-xs [&_button]:font-semibold [&_button]:uppercase [&_button]:tracking-wider [&_button]:text-muted-foreground',
            }}
          />

          <p className="mt-3 text-[13px] text-muted-foreground">
            {masterRoster.members.length} people · roles &amp; permissions are
            defined on the{' '}
            <Link
              href="/admin/roles"
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Security page →
            </Link>
          </p>
        </div>

        <PersonEditor
          member={selectedMember}
          roles={roles}
          isOpen={isEditorOpen}
          onClose={handleCloseEditor}
          canEdit={canEdit}
        />
      </div>
    </SelectedMemberProvider>
  )
}
