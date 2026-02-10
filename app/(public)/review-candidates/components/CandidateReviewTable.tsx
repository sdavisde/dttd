'use client'

import { useMemo, useState } from 'react'
import { HydratedCandidate } from '@/lib/candidates/types'
import { logger } from '@/lib/logger'
import { updateCandidateStatus } from '@/actions/candidates'
import * as Results from '@/lib/results'
import {
  sendCandidateForms,
  sendPaymentRequestEmail,
} from '@/services/notifications'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Users } from 'lucide-react'
import {
  DataTable,
  useDataTableUrlState,
  useQueryParam,
} from '@/components/ui/data-table'
import { booleanMarshaller } from '@/lib/marshallers'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  getCandidateReviewColumns,
  candidateReviewGlobalFilterFn,
} from '../config/columns'
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

  // "Show Archived" toggle synced to URL
  const [showArchived, setShowArchived] = useQueryParam('archived', {
    ...booleanMarshaller({ defaultValue: false }),
    history: 'replace',
  })

  // URL-synced table state
  const urlState = useDataTableUrlState({
    defaultSort: [{ id: 'status', desc: false }],
    defaultPageSize: 25,
  })

  // Pre-filter: exclude rejected candidates when "Show Archived" is off
  const filteredCandidates = useMemo(
    () =>
      showArchived
        ? candidates
        : candidates.filter((c) => c.status !== 'rejected'),
    [candidates, showArchived]
  )

  // Row click → navigate to candidate detail
  const handleRowClick = (candidate: HydratedCandidate) => {
    router.push(`/review-candidates/${candidate.id}`)
  }

  // Column definitions (stable via useMemo since callbacks are closures)
  const columns = useMemo(
    () =>
      getCandidateReviewColumns({
        onSendForms: (candidate) => {
          setCandidateForSendForms(candidate)
          setIsSendFormsModalOpen(true)
        },
        onSendPaymentRequest: (candidate) => {
          setCandidateForSendPayment(candidate)
          setIsSendPaymentModalOpen(true)
        },
        onReject: (candidate) => {
          setCandidateForReject(candidate)
          setIsRejectModalOpen(true)
        },
        onViewDetails: handleRowClick,
        canEditPayments,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canEditPayments]
  )

  // --- Modal handlers (unchanged) ---

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

  const handleSendFormsConfirm = async () => {
    if (!candidateForSendForms) return

    logger.info(`Sending candidate forms: ${candidateForSendForms.id}`)

    const candidateSponsorshipInfo =
      candidateForSendForms.candidate_sponsorship_info
    if (!candidateSponsorshipInfo) {
      logger.error('Candidate sponsorship info not found')
      return
    }

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
      <DataTable
        columns={columns}
        data={filteredCandidates}
        user={null}
        initialSort={[{ id: 'status', desc: false }]}
        globalFilterFn={candidateReviewGlobalFilterFn}
        urlState={urlState}
        searchPlaceholder="Search by name, email, or sponsor..."
        onRowClick={handleRowClick}
        toolbarChildren={
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-archived"
              checked={showArchived}
              onCheckedChange={(checked) => setShowArchived(checked === true)}
            />
            <Label
              htmlFor="show-archived"
              className="text-sm cursor-pointer whitespace-nowrap"
            >
              Show Archived
            </Label>
          </div>
        }
        emptyState={{
          noData: (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/40 mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No candidates found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                No candidates for this weekend.
              </p>
            </div>
          ),
          noResults: (
            <div className="space-y-2 py-4">
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
