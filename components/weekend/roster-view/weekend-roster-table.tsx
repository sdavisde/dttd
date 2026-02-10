'use client'

import { useState, useMemo } from 'react'
import { WeekendRosterMember } from '@/services/weekend'
import { DataTable } from '@/components/ui/data-table'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { EditTeamMemberModal } from './edit-team-member-modal'
import { MedicalInfoModal } from './medical-info-modal'
import { getWeekendRosterColumns, rosterGlobalFilterFn } from './config/columns'

type WeekendRosterTableProps = {
  roster: Array<WeekendRosterMember>
  isEditable: boolean
  /** Whether to include payment/status information (defaults to true) */
  includePaymentInformation?: boolean
}

export function WeekendRosterTable({
  roster,
  isEditable,
  includePaymentInformation = true,
}: WeekendRosterTableProps) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [medicalModalOpen, setMedicalModalOpen] = useState(false)
  const [selectedRosterMember, setSelectedRosterMember] =
    useState<WeekendRosterMember | null>(null)

  const handleEditRosterMember = (rosterMember: WeekendRosterMember) => {
    setSelectedRosterMember(rosterMember)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setSelectedRosterMember(null)
  }

  const handleOpenMedicalModal = (rosterMember: WeekendRosterMember) => {
    setSelectedRosterMember(rosterMember)
    setMedicalModalOpen(true)
  }

  const handleCloseMedicalModal = () => {
    setMedicalModalOpen(false)
    setSelectedRosterMember(null)
  }

  // Filter out dropped members
  const filteredRoster = useMemo(() => {
    return roster.filter((member) => member.status !== 'drop')
  }, [roster])

  // URL state management
  const urlState = useDataTableUrlState({
    defaultSort: [{ id: 'role', desc: false }],
  })

  // Column definitions with callbacks
  const columns = useMemo(
    () =>
      getWeekendRosterColumns({
        onEdit: handleEditRosterMember,
        onMedical: handleOpenMedicalModal,
        isEditable,
      }),
    [isEditable]
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredRoster}
        user={null}
        urlState={urlState}
        globalFilterFn={rosterGlobalFilterFn}
        searchPlaceholder="Search team members by name, email, phone, role, or status..."
        columnVisibility={{
          payment: includePaymentInformation,
          actions: isEditable,
        }}
        emptyState={{
          noData: 'No team members assigned to this weekend.',
          noResults: 'No team members found matching your search.',
        }}
      />

      <EditTeamMemberModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        rosterMember={selectedRosterMember}
      />

      <MedicalInfoModal
        open={medicalModalOpen}
        onClose={handleCloseMedicalModal}
        member={selectedRosterMember}
      />
    </>
  )
}
