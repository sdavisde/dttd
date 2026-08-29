'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { isNil } from 'lodash'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { isOk } from '@/lib/results'
import { toastError } from '@/lib/toast-error'
import {
  getPaymentTargetOptions,
  reassignPayment,
} from '@/services/payment/actions'
import type {
  PaymentTargetOption,
  PaymentTransactionDTO,
} from '@/services/payment'
import {
  formatCurrency,
  formatPersonName,
  formatWeekendLabel,
} from '@/lib/payments/formatters'

type ReassignPaymentDialogProps = {
  open: boolean
  onClose: () => void
  payment: PaymentTransactionDTO
}

/** Stable key for an option, since target IDs are only unique within a type. */
function optionKey(
  option: Pick<PaymentTargetOption, 'targetType' | 'targetId'>
) {
  return `${option.targetType}:${option.targetId}`
}

export function ReassignPaymentDialog({
  open,
  onClose,
  payment,
}: ReassignPaymentDialogProps) {
  const [options, setOptions] = useState<PaymentTargetOption[]>([])
  // Starts true: the dialog is mounted only while open, so options are always
  // being fetched on the first render.
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Load the picker options on mount. They are only needed here, so fetching
  // when the dialog opens keeps them off the payments page's initial payload.
  useEffect(() => {
    let cancelled = false

    getPaymentTargetOptions()
      .then((result) => {
        if (cancelled) return
        if (isOk(result)) {
          setOptions(result.data)
        } else {
          toastError('Unable to load the list of people to reassign to.', {
            error: result.error,
          })
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingOptions(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const currentKey =
    isNil(payment.target_type) || isNil(payment.target_id)
      ? null
      : `${payment.target_type}:${payment.target_id}`

  const selected = options.find((option) => optionKey(option) === selectedKey)

  const handleClose = () => {
    setSelectedKey(null)
    setPickerOpen(false)
    onClose()
  }

  const handleSubmit = async () => {
    if (isNil(selected)) return
    setIsSubmitting(true)

    const result = await reassignPayment({
      paymentId: payment.id,
      targetType: selected.targetType,
      targetId: selected.targetId,
    })

    setIsSubmitting(false)

    if (isOk(result)) {
      toast.success(
        `${formatCurrency(payment.gross_amount)} payment reassigned to ${selected.name}`
      )
      handleClose()
      router.refresh()
      return
    }

    toastError('Unable to reassign this payment. Please try again.', {
      error: result.error,
      paymentId: payment.id,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign Payment</DialogTitle>
          <DialogDescription>
            Move this payment to the person it belongs to. The weekend it counts
            toward moves with it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 space-y-2 rounded-lg p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">
                {formatCurrency(payment.gross_amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Currently paid for:</span>
              <span className="font-medium">
                {formatPersonName(payment.target_name)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid by:</span>
              <span>{formatPersonName(payment.payment_owner)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weekend:</span>
              <span>{formatWeekendLabel(payment)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reassign-target">Reassign to</Label>
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="reassign-target"
                  variant="outline"
                  role="combobox"
                  aria-expanded={pickerOpen}
                  className="w-full justify-between font-normal"
                  disabled={isLoadingOptions}
                >
                  {isLoadingOptions ? (
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading people...
                    </span>
                  ) : !isNil(selected) ? (
                    <span className="truncate">{selected.name}</span>
                  ) : (
                    <span className="text-muted-foreground">
                      Select a candidate or team member...
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Search by name..." />
                  <CommandList>
                    <CommandEmpty>No one found.</CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => {
                        const key = optionKey(option)
                        const isCurrent = key === currentKey
                        return (
                          <CommandItem
                            key={key}
                            value={`${option.name} ${option.weekendLabel ?? ''}`}
                            disabled={isCurrent}
                            onSelect={() => {
                              setSelectedKey(key)
                              setPickerOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                key === selectedKey
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            <span className="flex-1 truncate">
                              {option.name}
                            </span>
                            <span className="text-muted-foreground ml-2 text-xs">
                              {isCurrent
                                ? 'Current'
                                : (option.weekendLabel ?? 'No weekend')}
                            </span>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isNil(selected)}
          >
            {isSubmitting ? 'Reassigning...' : 'Reassign Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
