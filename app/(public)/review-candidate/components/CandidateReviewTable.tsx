'use client'

import { useState } from 'react'
import { HydratedCandidate } from '@/lib/candidates/types'
import { logger } from '@/lib/logger'
import { deleteCandidate, updateCandidateStatus } from '@/actions/candidates'
import { CandidateTable } from './CandidateTable'
import { CandidateDetailSheet } from './CandidateDetailSheet'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { StatusInfoSheet } from './StatusInfoSheet'
import * as Results from '@/lib/results'
import { sendCandidateForms } from '@/actions/emails'
import { sendPaymentRequestEmail } from '@/actions/emails'

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
  const [isStatusInfoOpen, setIsStatusInfoOpen] = useState(false)

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
        window.location.reload()
      } else {
        logger.error('Failed to delete candidate:', result.error)
        alert(`Failed to delete: ${result.error.message}`)
      }
    } catch (error) {
      logger.error('Error deleting candidate:', error)
      alert('An unexpected error occurred while deleting')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
  }

  const handleApprove = async (id: string) => {
    // TODO: Implement approval logic
    console.log('Approving candidate:', id)
  }

  const handleReject = async (id: string) => {
    // TODO: Implement rejection logic
    console.log('Rejecting candidate:', id)
  }

  const onSendForms = async () => {
    logger.info('Sending candidate forms:', selectedCandidate?.id)

    const candidateSponsorshipInfo =
      selectedCandidate?.candidate_sponsorship_info
    if (!candidateSponsorshipInfo) {
      logger.error('Candidate sponsorship info not found')
      return
    }

    // Set the candidate status to awaiting_forms
    const result = await updateCandidateStatus(
      selectedCandidate.id,
      'awaiting_forms'
    )
    if (Results.isErr(result)) {
      logger.error('Failed to update candidate status:', result.error)
      return
    }

    const candidateFormsResult = await sendCandidateForms(
      candidateSponsorshipInfo
    )
    if (Results.isErr(candidateFormsResult)) {
      logger.error(
        'Failed to send candidate forms:',
        candidateFormsResult.error
      )
      return
    }
  }

  const onSendPaymentRequest = async () => {
    logger.info('Sending payment request:', selectedCandidate?.id)

    if (!selectedCandidate) {
      logger.error('No candidate selected to send payment request')
      return
    }

    const result = await sendPaymentRequestEmail(selectedCandidate.id)

    if (Results.isErr(result)) {
      logger.error('Failed to send payment request email:', result.error)
      alert(`Failed to send payment request email: ${result.error.message}`)
    }

    // Close the sheet and refresh the page to update the status
    setIsSheetOpen(false)
    setSelectedCandidate(null)
    window.location.reload()
  }

  return (
    <>
      <CandidateTable
        candidates={candidates}
        onRowClick={handleRowClick}
        onStatusInfoClick={() => setIsStatusInfoOpen(true)}
      />

      <CandidateDetailSheet
        candidate={selectedCandidate}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onDelete={handleDeleteClick}
        onApprove={handleApprove}
        onReject={handleReject}
        onSendForms={onSendForms}
        onSendPaymentRequest={onSendPaymentRequest}
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

      <StatusInfoSheet
        isOpen={isStatusInfoOpen}
        onClose={() => setIsStatusInfoOpen(false)}
      />
    </>
  )
}
