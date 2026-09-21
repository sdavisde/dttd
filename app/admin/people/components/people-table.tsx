'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserRoleSidebar } from './UserRoleSidebar'
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

export default function PeopleTable({
  masterRoster,
  roles,
  canViewExperience,
  canEdit,
}: PeopleTableProps) {
  const [selectedMember, setSelectedMember] =
    useState<MasterRosterMember | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const urlState = useDataTableUrlState({ defaultPageSize: 25 })
  const handleMemberClick = (member: MasterRosterMember) => {
    setSelectedMember(member)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedMember(null)
    setIsModalOpen(false)
  }

  return (
    <div className="my-4">
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
          container: 'bg-card overflow-hidden [&_tbody_tr]:border-divider',
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

      <UserRoleSidebar
        member={selectedMember}
        roles={roles}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        canEdit={canEdit}
      />
    </div>
  )
}
