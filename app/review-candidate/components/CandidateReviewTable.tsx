'use client'

import { useState } from 'react'
import { Candidate } from '@/lib/candidates/types'
import { logger } from '@/lib/logger'
import { createCandidateFromSponsorshipRequest, deleteCandidate } from '@/actions/candidates'
import { CandidateTable } from './CandidateTable'
import { CandidateDetailDialog } from './CandidateDetailDialog'
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog'
import { StatusInfoDialog } from './StatusInfoDialog'
import * as Results from '@/lib/results'
import { sendCandidateForms } from '@/actions/emails'

interface CandidateReviewTableProps {
  candidates: Candidate[]
}

export function CandidateReviewTable({ candidates }: CandidateReviewTableProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isStatusInfoOpen, setIsStatusInfoOpen] = useState(false)

  const handleRowClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCandidate) return

    setIsDeleting(true)
    try {
      // Determine if this is a candidate or sponsorship request based on the ID type
      const isSponsorshipRequest = typeof selectedCandidate.id === 'string' && !isNaN(Number(selectedCandidate.id))
      const type = isSponsorshipRequest ? 'sponsorship_request' : 'candidate'
      const id = isSponsorshipRequest ? Number(selectedCandidate.id) : selectedCandidate.id

      const result = await deleteCandidate(id, type)

      if (Results.isOk(result)) {
        // Close both dialogs and refresh the page to update the table
        setIsDeleteDialogOpen(false)
        setIsDialogOpen(false)
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

  const onSendForms = async (id: string) => {
    // First, creates a candidate record from sponsorship request
    // Then, sends candidate and sponsor an email notification
    logger.info('Sending candidate forms:', id)
    const result = await createCandidateFromSponsorshipRequest(Number(id))
    if (Results.isErr(result)) {
      logger.error('Failed to create candidate from sponsorship request:', result.error)
      return
    }

    const candidate = result.data.candidate
    const sponsorEmail = candidate.sponsor_email
    const candidateEmail = candidate.email

    const sponsorResult = await sendCandidateForms(candidate)
  }

  return (
    <>
      <CandidateTable
        candidates={candidates}
        onRowClick={handleRowClick}
        onStatusInfoClick={() => setIsStatusInfoOpen(true)}
      />

      <CandidateDetailDialog
        candidate={selectedCandidate}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onDelete={handleDeleteClick}
        onApprove={handleApprove}
        onReject={handleReject}
        onSendForms={onSendForms}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        candidateName={selectedCandidate?.name}
        isDeleting={isDeleting}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />

      <StatusInfoDialog
        isOpen={isStatusInfoOpen}
        onClose={() => setIsStatusInfoOpen(false)}
      />
    </>
  )
}
