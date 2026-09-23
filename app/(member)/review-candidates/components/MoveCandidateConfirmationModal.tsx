'use client'

import { useEffect, useState } from 'react'
import { isNil } from 'lodash'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { HydratedCandidate } from '@/lib/candidates/types'
import {
  getMoveWeekendOptions,
  type MoveWeekendOption,
} from '@/actions/candidates'
import { isErr } from '@/lib/results'
import { toastError } from '@/lib/toast-error'
import { Info } from 'lucide-react'

interface MoveCandidateConfirmationModalProps {
  isOpen: boolean
  candidate: HydratedCandidate | null
  onCancel: () => void
  onConfirm: (targetWeekendId: string) => Promise<void>
}

export function MoveCandidateConfirmationModal({
  isOpen,
  candidate,
  onCancel,
  onConfirm,
}: MoveCandidateConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [options, setOptions] = useState<MoveWeekendOption[]>([])
  const [selectedWeekendId, setSelectedWeekendId] = useState<string>('')

  // Load eligible weekends whenever the modal opens for a candidate
  useEffect(() => {
    if (!isOpen || isNil(candidate)) return

    let cancelled = false
    setIsLoadingOptions(true)
    setSelectedWeekendId('')
    setOptions([])

    getMoveWeekendOptions(candidate.id).then((result) => {
      if (cancelled) return
      if (isErr(result)) {
        toastError('Unable to load weekends. Please try again.', {
          error: result.error,
        })
        setOptions([])
      } else {
        setOptions(result.data)
      }
      setIsLoadingOptions(false)
    })

    return () => {
      cancelled = true
    }
  }, [isOpen, candidate])

  if (isNil(candidate?.candidate_sponsorship_info)) {
    return null
  }

  const candidateName = candidate.candidate_sponsorship_info.candidate_name
  const selectedOption = options.find((o) => o.weekendId === selectedWeekendId)

  const handleConfirm = async () => {
    if (selectedWeekendId === '') return
    setIsLoading(true)
    try {
      await onConfirm(selectedWeekendId)
    } catch (error) {
      // Keep modal open on error; parent closes it on success
      console.error('Error in onConfirm:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (!isLoading) {
      onCancel()
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      onCancel()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Move Candidate</DialogTitle>
          <DialogDescription>
            Move{' '}
            <span className="font-semibold text-foreground">
              {candidateName}
            </span>{' '}
            to a different weekend. Their completed forms and payments move with
            them — nothing needs to be re-submitted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="move-weekend">Move to weekend</Label>
          <Select
            value={selectedWeekendId}
            onValueChange={setSelectedWeekendId}
            disabled={isLoadingOptions || isLoading}
          >
            <SelectTrigger id="move-weekend" className="w-full">
              <SelectValue
                placeholder={
                  isLoadingOptions ? 'Loading weekends...' : 'Select a weekend'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.weekendId} value={opt.weekendId}>
                  {opt.label} — {opt.count}/{opt.capacity}
                  {opt.isFull ? ' (full)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isLoadingOptions && options.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No other eligible weekends are available for this candidate.
            </p>
          )}
        </div>

        {selectedOption?.isFull === true && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              {selectedOption.label} is at capacity ({selectedOption.count}/
              {selectedOption.capacity}). You can still move this candidate, but
              the weekend will be over its {selectedOption.capacity}-candidate
              limit.
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || selectedWeekendId === ''}
          >
            {isLoading ? 'Moving...' : 'Confirm Move'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
