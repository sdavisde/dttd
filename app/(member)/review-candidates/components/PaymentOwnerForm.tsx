'use client'

import { useState, useTransition } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { updateCandidatePaymentOwner } from '@/actions/candidates'
import { toast } from 'sonner'
import * as Results from '@/lib/results'
import { Loader2 } from 'lucide-react'

interface PaymentOwnerFormProps {
  candidateId: string
  initialPaymentOwner: string | null | undefined
  onUpdate?: () => void
}

export function PaymentOwnerForm({
  candidateId,
  initialPaymentOwner,
  onUpdate,
}: PaymentOwnerFormProps) {
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState(initialPaymentOwner ?? '')

  const handleValueChange = (newValue: string) => {
    setValue(newValue)
    startTransition(async () => {
      const result = await updateCandidatePaymentOwner(candidateId, newValue)

      if (Results.isErr(result)) {
        toast.error(result.error)
        // Revert on error
        setValue(initialPaymentOwner ?? '')
      } else {
        toast.success('Payment owner updated')
        onUpdate?.()
      }
    })
  }

  return (
    <div className="flex items-center gap-4">
      <RadioGroup
        value={value}
        onValueChange={handleValueChange}
        className="flex flex-row gap-4"
        disabled={isPending}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sponsor" id="po-sponsor" />
          <Label htmlFor="po-sponsor">Sponsor</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="candidate" id="po-candidate" />
          <Label htmlFor="po-candidate">Candidate</Label>
        </div>
      </RadioGroup>
      {isPending && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}
