'use client'

import { useState } from 'react'
import { HydratedCandidate } from '@/lib/candidates/types'
import { logger } from '@/lib/logger'
import { updateCandidateStatus } from '@/actions/candidates'
import { CandidateTable } from './CandidateTable'
import { CandidateTableControls } from './CandidateTableControls'
import { TablePagination } from '@/components/ui/table-pagination'
import { useCandidateReviewTable } from '@/hooks/use-candidate-review-table'
import * as Results from '@/lib/results'
import {
  sendCandidateForms,
  sendPaymentRequestEmail,
} from '@/services/notifications'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SendFormsConfirmationModal } from './SendFormsConfirmationModal'
import { SendPaymentRequestConfirmationModal } from './SendPaymentRequestConfirmationModal'
import { RejectCandidateConfirmationModal } from './RejectCandidateConfirmationModal'

interface CandidateReviewTableProps {
  candidates: HydratedCandidate[]
  canEditPayments?: boolean
}

export function CandidateReviewTable({
  candidates,
  canEditPayments = false,
}: CandidateReviewTableProps) {
  const [isSendFormsModalOpen, setIsSendFormsModalOpen] = useState(false)
  const [candidateForSendForms, setCandidateForSendForms] =
    useState<HydratedCandidate | null>(null)
  const [isSendPaymentModalOpen, setIsSendPaymentModalOpen] = useState(false)
  const [candidateForSendPayment, setCandidateForSendPayment] =
    useState<HydratedCandidate | null>(null)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [candidateForReject, setCandidateForReject] =
    useState<HydratedCandidate | null>(null)
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

  const handleReject = (candidate: HydratedCandidate) => {
    setCandidateForReject(candidate)
    setIsRejectModalOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!candidateForReject) return

    logger.info(`Rejecting candidate: ${candidateForReject.id}`)

    const result = await updateCandidateStatus(
      candidateForReject.id,
      'rejected'
    )

    if (Results.isErr(result)) {
      logger.error(`Failed to reject candidate: ${result.error}`)
      toast.error(`Failed to reject candidate: ${result.error}`)
      return
    }

    toast.success('Candidate rejected')
    setIsRejectModalOpen(false)
    setCandidateForReject(null)
    router.refresh()
  }

  const handleRejectCancel = () => {
    setIsRejectModalOpen(false)
    setCandidateForReject(null)
  }

  const onSendForms = (candidate: HydratedCandidate) => {
    setCandidateForSendForms(candidate)
    setIsSendFormsModalOpen(true)
  }

  const handleSendFormsConfirm = async () => {
    if (!candidateForSendForms) return

    logger.info(`Sending candidate forms: ${candidateForSendForms.id}`)

    const candidateSponsorshipInfo =
      candidateForSendForms.candidate_sponsorship_info
    if (!candidateSponsorshipInfo) {
      logger.error('Candidate sponsorship info not found')
      return
    }

    // Set the candidate status to awaiting_forms
    const result = await updateCandidateStatus(
      candidateForSendForms.id,
      'awaiting_forms'
    )
    if (Results.isErr(result)) {
      logger.error(`Failed to update candidate status: ${result.error}`)
      toast.error(`Failed to update status: ${result.error}`)
      return
    }

    const candidateFormsResult = await sendCandidateForms(
      candidateSponsorshipInfo
    )
    if (Results.isErr(candidateFormsResult)) {
      logger.error(
        `Failed to send candidate forms: ${candidateFormsResult.error}`
      )
      toast.error(`Failed to send forms email: ${candidateFormsResult.error}`)
      return
    }

    toast.success('Candidate forms sent successfully')
    setIsSendFormsModalOpen(false)
    setCandidateForSendForms(null)
    router.refresh()
  }

  const handleSendFormsCancel = () => {
    setIsSendFormsModalOpen(false)
    setCandidateForSendForms(null)
  }

  const onSendPaymentRequest = (candidate: HydratedCandidate) => {
    setCandidateForSendPayment(candidate)
    setIsSendPaymentModalOpen(true)
  }

  const handleSendPaymentRequestConfirm = async () => {
    if (!candidateForSendPayment) return

    logger.info(`Sending payment request: ${candidateForSendPayment.id}`)

    const result = await sendPaymentRequestEmail(candidateForSendPayment.id)

    if (Results.isErr(result)) {
      logger.error(`Failed to send payment request email: ${result.error}`)
      toast.error(`Failed to send payment request email: ${result.error}`)
      return
    }

    toast.success('Payment request sent successfully')
    setIsSendPaymentModalOpen(false)
    setCandidateForSendPayment(null)
    router.refresh()
  }

  const handleSendPaymentRequestCancel = () => {
    setIsSendPaymentModalOpen(false)
    setCandidateForSendPayment(null)
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
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          showArchived={showArchived}
          canEditPayments={canEditPayments}
          onSendForms={onSendForms}
          onSendPaymentRequest={onSendPaymentRequest}
          onReject={handleReject}
        />

        <TablePagination
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          alwaysShow={true}
        />
      </div>

      <SendFormsConfirmationModal
        isOpen={isSendFormsModalOpen}
        candidate={candidateForSendForms}
        onCancel={handleSendFormsCancel}
        onConfirm={handleSendFormsConfirm}
      />

      <SendPaymentRequestConfirmationModal
        isOpen={isSendPaymentModalOpen}
        candidate={candidateForSendPayment}
        onCancel={handleSendPaymentRequestCancel}
        onConfirm={handleSendPaymentRequestConfirm}
      />

      <RejectCandidateConfirmationModal
        isOpen={isRejectModalOpen}
        candidate={candidateForReject}
        onCancel={handleRejectCancel}
        onConfirm={handleRejectConfirm}
      />
    </>
  )
}
