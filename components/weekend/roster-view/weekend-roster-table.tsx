'use client'

import { useState, useMemo } from 'react'
import type { WeekendRosterMember } from '@/services/weekend'
import { DataTable } from '@/components/ui/data-table'
import { useDataTableUrlState } from '@/hooks/use-data-table-url-state'
import { EditTeamMemberModal } from './edit-team-member-modal'
import { MedicalInfoModal } from './medical-info-modal'
import { TeamFormInfoModal } from './team-form-info-modal'
import { getWeekendRosterColumns, rosterGlobalFilterFn } from './config/columns'

type WeekendRosterTableProps = {
  roster: Array<WeekendRosterMember>
  isEditable: boolean
  /** Whether to include payment/status information (defaults to true) */
  includePaymentInformation?: boolean
  /** Whether to include emergency contact column */
  includeEmergencyContact?: boolean
  /** Whether to include special needs column */
  includeSpecialNeeds?: boolean
  /** Whether to include team form info column */
  includeTeamFormInfo?: boolean
}

export function WeekendRosterTable({
  roster,
  isEditable,
  includePaymentInformation = true,
  includeEmergencyContact = false,
  includeSpecialNeeds = false,
  includeTeamFormInfo = false,
}: WeekendRosterTableProps) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [medicalModalOpen, setMedicalModalOpen] = useState(false)
  const [formInfoModalOpen, setFormInfoModalOpen] = useState(false)
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

  const handleOpenFormInfoModal = (rosterMember: WeekendRosterMember) => {
    setSelectedRosterMember(rosterMember)
    setFormInfoModalOpen(true)
  }

  const handleCloseFormInfoModal = () => {
    setFormInfoModalOpen(false)
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
        onViewFormInfo: handleOpenFormInfoModal,
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
          forms: !includeTeamFormInfo,
          team_form_info: includeTeamFormInfo,
          emergency: includeEmergencyContact,
          special_needs: includeSpecialNeeds,
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

      <TeamFormInfoModal
        open={formInfoModalOpen}
        onClose={handleCloseFormInfoModal}
        member={selectedRosterMember}
      />
    </>
  )
}
