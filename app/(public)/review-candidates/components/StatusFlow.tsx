'use client'

import { Badge } from '@/components/ui/badge'
import { ArrowRight, ArrowDown } from 'lucide-react'
import { CandidateStatus } from '@/lib/candidates/types'

const STATUSES: Array<{
  id: CandidateStatus
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'warning'
}> = [
  { id: 'sponsored', label: 'Sponsored', variant: 'default' },
  { id: 'awaiting_forms', label: 'Awaiting Forms', variant: 'warning' },
  { id: 'completed_forms', label: 'Forms Completed', variant: 'default' },
  { id: 'awaiting_payment', label: 'Awaiting Payment', variant: 'warning' },
  { id: 'confirmed', label: 'Confirmed', variant: 'default' },
]

interface StatusFlowProps {
  currentStatus?: CandidateStatus
}

export function StatusFlow({ currentStatus }: StatusFlowProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 my-4">
      {STATUSES.map((status, index) => (
        <div key={status.id} className="flex flex-col sm:flex-row items-center">
          <Badge
            variant={currentStatus === status.id ? 'default' : 'outline'}
            className={`min-w-[100px] text-center ${
              currentStatus === status.id ? 'font-bold' : 'font-normal'
            }`}
          >
            {status.label}
          </Badge>
          {index < STATUSES.length - 1 && (
            <div className="flex items-center mx-2 text-gray-400">
              <ArrowDown className="sm:hidden h-4 w-4" />
              <ArrowRight className="hidden sm:block h-4 w-4" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
