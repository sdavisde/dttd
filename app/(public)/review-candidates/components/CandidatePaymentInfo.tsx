'use client'

import { Info, Plus } from 'lucide-react'
import { CandidatePaymentInfoModal } from './CandidatePaymentInfoModal'
import { CandidateCashCheckPaymentModal } from './CandidateCashCheckPaymentModal'
import { PAYMENT_CONSTANTS } from '@/lib/constants/payments'
import { HydratedCandidate } from '@/lib/candidates/types'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type CandidatePaymentInfoProps = {
  candidate: HydratedCandidate
  canEditPayments: boolean
}

export const CandidatePaymentInfo = ({
  candidate,
  canEditPayments,
}: CandidatePaymentInfoProps) => {
  const [paymentInfoModalOpen, setPaymentInfoModalOpen] = useState(false)
  const [cashCheckModalOpen, setCashCheckModalOpen] = useState(false)

  const handleShowPaymentInfo = () => {
    setPaymentInfoModalOpen(true)
  }

  const handleClosePaymentInfoModal = () => {
    setPaymentInfoModalOpen(false)
  }

  const handleShowCashCheckModal = () => {
    setCashCheckModalOpen(true)
  }

  const handleCloseCashCheckModal = () => {
    setCashCheckModalOpen(false)
  }

  const { paid, display } = formatPaymentSummary(candidate)
  const hasPayments = (candidate.candidate_payments?.length ?? 0) > 0

  return (
    <div className="flex items-center gap-2">
      {/* Price Display - Clickable only when payments exist */}
      {hasPayments ? (
        <Button
          variant="outline"
          size="sm"
          className="p-2 hover:bg-muted text-left rounded-lg w-20 flex items-center gap-1"
          onClick={handleShowPaymentInfo}
          title="View payment details"
        >
          <Info className="text-gray" />
          <span
            className={cn(
              'text-sm font-medium',
              paid > 0 ? 'text-green-600' : 'text-muted-foreground'
            )}
          >
            {display}
          </span>
        </Button>
      ) : (
        <div className="p-1 text-center rounded-lg w-20">
          <span className={cn('text-sm font-medium', 'text-muted-foreground')}>
            {display}
          </span>
        </div>
      )}

      {/* Manual Payment Button - Always visible when canEditPayments */}
      {canEditPayments && (
        <Button
          variant="outline"
          size="sm"
          className="p-2 aspect-square transition-colors"
          onClick={handleShowCashCheckModal}
          title="Record manual payment"
        >
          <Plus className="text-muted-foreground hover:text-foreground transition-colors" />
          <span>Payment</span>
        </Button>
      )}

      <CandidatePaymentInfoModal
        open={paymentInfoModalOpen}
        onClose={handleClosePaymentInfoModal}
        candidate={candidate}
      />

      <CandidateCashCheckPaymentModal
        open={cashCheckModalOpen}
        onClose={handleCloseCashCheckModal}
        candidate={candidate}
      />
    </div>
  )
}

// Format payment summary for display
function formatPaymentSummary(candidate: HydratedCandidate) {
  const totalFee = PAYMENT_CONSTANTS.CANDIDATE_FEE
  const paid =
    candidate.candidate_payments?.reduce((sum, p) => sum + p.gross_amount, 0) ??
    0
  const balance = totalFee - paid

  return {
    paid,
    balance,
    display: `$${paid.toFixed(0)}`,
    isPaidInFull: balance <= 0,
  }
}
