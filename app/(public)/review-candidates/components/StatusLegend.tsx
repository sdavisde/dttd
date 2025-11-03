import { CandidateStatus } from '@/lib/candidates/types'
import { StatusChip } from '@/components/candidates/status-chip'
import { Typography } from '@/components/ui/typography'

export function StatusLegend() {
  const statusDescriptions: Record<CandidateStatus, string> = {
    sponsored: 'Candidate has been sponsored and is ready for the next step',
    awaiting_forms: 'Candidate needs to complete and submit required forms',
    pending_approval:
      'Candidate is waiting for approval from the review committee',
    awaiting_payment: 'Payment is required before proceeding',
    confirmed: 'Candidate has been confirmed and is ready for the weekend',
    rejected: 'Candidate application has been rejected',
  }

  const allStatuses: CandidateStatus[] = [
    'sponsored',
    'awaiting_forms',
    'pending_approval',
    'awaiting_payment',
    'confirmed',
    'rejected',
  ]

  return (
    <div className="mt-6 p-4 border border-border rounded-lg bg-muted/30">
      <Typography variant="h6" className="mb-3">
        Status Reference
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
    </div>
  )
}
