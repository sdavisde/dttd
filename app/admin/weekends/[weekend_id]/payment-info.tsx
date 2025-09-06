'use client'

import { Info } from 'lucide-react'
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

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-auto p-1 hover:bg-muted text-left rounded-lg w-12"
        onClick={() =>
          isEditable
            ? handleShowCashCheckModal(member)
            : handleShowPaymentInfo(member)
        }
        title={isEditable ? 'Record payment' : 'View payment information'}
      >
        <span
          className={cn(
            'text-sm font-medium',
            paid > 0 ? 'text-green-600' : 'text-muted-foreground'
          )}
        >
          {display}
        </span>
      </Button>

      {member.all_payments.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 hover:bg-muted rounded-full transition-colors"
          onClick={() => handleShowPaymentInfo(member)}
          title="View payment details"
        >
          <Info className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
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
