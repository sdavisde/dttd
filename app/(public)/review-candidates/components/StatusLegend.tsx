import { CandidateStatus } from '@/lib/candidates/types'
import { StatusChip } from '@/components/candidates/status-chip'
import { Typography } from '@/components/ui/typography'

export function StatusLegend() {
  const statusDescriptions: Record<CandidateStatus, string> = {
    sponsored: 'Candidate has been sponsored and is ready for the next step',
    awaiting_forms: 'Candidate needs to complete and submit required forms',
    awaiting_payment: 'Payment is required before proceeding',
    confirmed: 'Candidate has been confirmed and is ready for the weekend',
    rejected: 'Candidate application has been rejected',
  }

  const allStatuses: CandidateStatus[] = [
    'sponsored',
    'awaiting_forms',
    'awaiting_payment',
    'confirmed',
    'rejected',
  ]

  return (
    <div className="grid grid-cols-1 gap-3">
      {allStatuses.map((status) => (
        <div
          key={status}
          className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
        >
          <StatusChip status={status} />
          <p className="flex-1 text-sm text-muted-foreground">
            {statusDescriptions[status]}
          </p>
        </div>
      ))}
    </div>
  )
}
