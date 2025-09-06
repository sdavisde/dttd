'use client'

import { Info, Plus } from 'lucide-react'
import { PaymentInfoModal } from './payment-info-modal'
import { CashCheckPaymentModal } from './cash-check-payment-modal'
import { PAYMENT_CONSTANTS } from '@/lib/constants/payments'
import { WeekendRosterMember } from '@/actions/weekend'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type PaymentInfoProps = {
  member: WeekendRosterMember
  isEditable: boolean
}
export const PaymentInfo = ({ member, isEditable }: PaymentInfoProps) => {
  const [paymentInfoModalOpen, setPaymentInfoModalOpen] = useState(false)
  const [selectedPaymentMember, setSelectedPaymentMember] =
    useState<WeekendRosterMember | null>(null)
  const [cashCheckModalOpen, setCashCheckModalOpen] = useState(false)
  const [selectedCashCheckMember, setSelectedCashCheckMember] =
    useState<WeekendRosterMember | null>(null)

  const handleShowPaymentInfo = (rosterMember: WeekendRosterMember) => {
    setSelectedPaymentMember(rosterMember)
    setPaymentInfoModalOpen(true)
  }

  const handleClosePaymentInfoModal = () => {
    setPaymentInfoModalOpen(false)
    setSelectedPaymentMember(null)
  }

  const handleShowCashCheckModal = (rosterMember: WeekendRosterMember) => {
    setSelectedCashCheckMember(rosterMember)
    setCashCheckModalOpen(true)
  }

  const handleCloseCashCheckModal = () => {
    setCashCheckModalOpen(false)
    setSelectedCashCheckMember(null)
  }

  const { paid, balance, display, isPaidInFull } = formatPaymentSummary(member)
  const hasPayments = member.all_payments.length > 0

  return (
    <div className="flex items-center gap-2">
      {/* Price Display - Clickable only when payments exist */}
      {hasPayments ? (
        <Button
          variant="outline"
          size="sm"
          className="p-2 hover:bg-muted text-left rounded-lg w-20 flex items-center gap-1"
          onClick={() => handleShowPaymentInfo(member)}
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

      {/* Manual Payment Button - Always visible when editable */}
      {isEditable && (
        <Button
          variant="outline"
          size="sm"
          className="p-2 aspect-square transition-colors"
          onClick={() => handleShowCashCheckModal(member)}
          title="Record manual payment"
        >
          <Plus className="text-muted-foreground hover:text-foreground transition-colors" />
          <span>New Payment</span>
        </Button>
      )}

      <PaymentInfoModal
        open={paymentInfoModalOpen}
        onClose={handleClosePaymentInfoModal}
        rosterMember={selectedPaymentMember}
      />

      <CashCheckPaymentModal
        open={cashCheckModalOpen}
        onClose={handleCloseCashCheckModal}
        rosterMember={selectedCashCheckMember}
      />
    </div>
  )
}

// Format payment summary for display
function formatPaymentSummary(member: WeekendRosterMember) {
  const totalFee = PAYMENT_CONSTANTS.TEAM_FEE
  const paid = member.total_paid || 0
  const balance = totalFee - paid

  return {
    paid,
    balance,
    display: `$${paid.toFixed(0)}`,
    isPaidInFull: balance <= 0,
  }
}
