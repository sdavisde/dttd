'use client'

import { useState } from 'react'
import { HydratedCandidate } from '@/lib/candidates/types'
import { logger } from '@/lib/logger'
import { deleteCandidate, updateCandidateStatus } from '@/actions/candidates'
import { CandidateTable } from './CandidateTable'
import { CandidateDetailSheet } from './CandidateDetailSheet'
import { CandidateTableControls } from './CandidateTableControls'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { TablePagination } from '@/components/ui/table-pagination'
import { useCandidateReviewTable } from '@/hooks/use-candidate-review-table'
import * as Results from '@/lib/results'
import { sendCandidateForms } from '@/actions/emails'
import { sendPaymentRequestEmail } from '@/actions/emails'
import { useRouter } from 'next/navigation'

interface CandidateReviewTableProps {
  candidates: HydratedCandidate[]
}

export function CandidateReviewTable({
  candidates,
}: CandidateReviewTableProps) {
  const [selectedCandidate, setSelectedCandidate] =
    useState<HydratedCandidate | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  // Table controls hook
  const {
    paginatedCandidates,
    searchQuery,
    setSearchQuery,
    statusFilters,
    toggleStatusFilter,
    showArchived,
    setShowArchived,
    sortColumn,
    sortDirection,
    handleSort,
    pagination,
    setPage,
    setPageSize,
    clearFilters,
  } = useCandidateReviewTable(candidates, {
    initialPageSize: 25,
    initialPage: 1,
  })

  const handleRowClick = (candidate: HydratedCandidate) => {
    setSelectedCandidate(candidate)
    setIsSheetOpen(true)
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCandidate) return

    setIsDeleting(true)
    try {
      const result = await deleteCandidate(selectedCandidate.id)

      if (Results.isOk(result)) {
        // Close both dialogs and refresh the page to update the table
        setIsDeleteDialogOpen(false)
        setIsSheetOpen(false)
        setSelectedCandidate(null)
        router.refresh()
      } else {
        logger.error(`Failed to delete candidate: ${result.error.message}`)
        alert(`Failed to delete: ${result.error.message}`)
      }
    } catch (error) {
      logger.error('Error deleting candidate')
      alert('An unexpected error occurred while deleting')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
  }

  const handleApprove = async (candidate: HydratedCandidate) => {
    // TODO: Implement approval logic
    console.log('Approving candidate:', candidate.id)
  }

  const handleReject = async (candidate: HydratedCandidate) => {
    // TODO: Implement rejection logic
    console.log('Rejecting candidate:', candidate.id)
  }

  const onSendForms = async (candidate: HydratedCandidate) => {
    logger.info(`Sending candidate forms: ${candidate.id}`)

    // Placeholder logic for now
    /*
    const candidateSponsorshipInfo =
      candidate.candidate_sponsorship_info
    if (!candidateSponsorshipInfo) {
      logger.error('Candidate sponsorship info not found')
      return
    }

    // Set the candidate status to awaiting_forms
    const result = await updateCandidateStatus(
      candidate.id,
      'awaiting_forms'
    )
    if (Results.isErr(result)) {
      logger.error(`Failed to update candidate status: ${result.error.message}`)
      return
    }

    const candidateFormsResult = await sendCandidateForms(
      candidateSponsorshipInfo
    )
    if (Results.isErr(candidateFormsResult)) {
      logger.error(
        `Failed to send candidate forms: ${candidateFormsResult.error.message}`
      )
      return
    }

    // Close the sheet and refresh the page to update the status
    setIsSheetOpen(false)
    setSelectedCandidate(null)
    router.refresh()
    */
  }

  const onSendPaymentRequest = async (candidate: HydratedCandidate) => {
    logger.info(`Sending payment request: ${candidate.id}`)

    // Placeholder logic
    /*
    const result = await sendPaymentRequestEmail(candidate.id)

    if (Results.isErr(result)) {
      logger.error(
        `Failed to send payment request email: ${result.error.message}`
      )
      alert(`Failed to send payment request email: ${result.error.message}`)
    }

    // Close the sheet and refresh the page to update the status
    setIsSheetOpen(false)
    setSelectedCandidate(null)
    router.refresh()
    */
  }

  return (
    <>
      <div className="space-y-4">
        <CandidateTableControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilters={statusFilters}
          onToggleStatus={toggleStatusFilter}
          showArchived={showArchived}
          onToggleArchived={setShowArchived}
          onClearFilters={clearFilters}
        />

        <CandidateTable
          candidates={paginatedCandidates}
          onRowClick={handleRowClick}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          showArchived={showArchived}
          onSendForms={onSendForms}
          onSendPaymentRequest={onSendPaymentRequest}
          onReject={handleReject}
        />

        <TablePagination
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />


      </div>

      <CandidateDetailSheet
        candidate={selectedCandidate}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Candidate"
        itemName={selectedCandidate?.candidate_sponsorship_info?.candidate_name}
        isDeleting={isDeleting}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete Candidate"
      />
    </>
  )
}
