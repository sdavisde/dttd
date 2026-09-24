'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isNil } from 'lodash'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  FeeInputs,
  feeInputValuesFrom,
  parseFeeInputs,
  type FeeInputValues,
} from '@/components/fees/fee-inputs'
import { isErr } from '@/lib/results'
import { toastError } from '@/lib/toast-error'
import { formatWeekendGroupTitle } from '@/lib/weekend'
import {
  formatFee,
  formatGroupPrice,
  type GroupFees,
} from '@/lib/payments/group-fees'
import type { FeeChangeImpact } from '@/lib/payments/fee-change-impact'
import {
  getGroupFeeHistory,
  previewGroupFeeChange,
  updateGroupFees,
  type FeeChange,
  type FeeDefaults,
} from '@/services/fees'

type GroupFeesDialogProps = {
  open: boolean
  onClose: () => void
  groupId: string
  groupNumber: number | null
  /** Null when fees aren't tracked for this group. */
  fees: GroupFees | null
  /** Prefills the form when the group has no fees yet. */
  defaults: FeeDefaults | null
  canManageFees: boolean
  canReadHistory: boolean
}

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`

/**
 * A group's price, and — for MANAGE_FEES holders — changing it. A change is
 * reviewed before it saves: the confirmation says who it affects, in people
 * and dollars, because a save moves balances for the whole group.
 */
export function GroupFeesDialog({
  open,
  onClose,
  groupId,
  groupNumber,
  fees,
  defaults,
  canManageFees,
  canReadHistory,
}: GroupFeesDialogProps) {
  const router = useRouter()
  const title = formatWeekendGroupTitle(groupNumber)

  const initialValues = !isNil(fees)
    ? feeInputValuesFrom(fees.teamFee, fees.onlineSurcharge)
    : feeInputValuesFrom(
        defaults?.weekendFee ?? 0,
        defaults?.onlineSurcharge ?? 0
      )

  const [mode, setMode] = useState<'view' | 'edit' | 'review'>('view')
  const [values, setValues] = useState<FeeInputValues>(initialValues)
  const [impact, setImpact] = useState<FeeChangeImpact | null>(null)
  const [isWorking, setIsWorking] = useState(false)
  const [history, setHistory] = useState<FeeChange[] | null>(null)

  useEffect(() => {
    if (!open || !canReadHistory) return
    let active = true
    getGroupFeeHistory(groupId).then((result) => {
      if (!active) return
      if (isErr(result)) {
        toastError('Unable to load the fee history.', { error: result.error })
        return
      }
      setHistory(result.data)
    })
    return () => {
      active = false
    }
  }, [open, canReadHistory, groupId])

  const parsed = parseFeeInputs(values)
  const proposed: GroupFees | null = isNil(parsed)
    ? null
    : {
        teamFee: parsed.weekendFee,
        candidateFee: parsed.weekendFee,
        onlineSurcharge: parsed.onlineSurcharge,
      }
  const unchanged =
    !isNil(fees) &&
    !isNil(proposed) &&
    proposed.teamFee === fees.teamFee &&
    proposed.candidateFee === fees.candidateFee &&
    proposed.onlineSurcharge === fees.onlineSurcharge

  const handleReview = async () => {
    if (isNil(proposed)) return
    setIsWorking(true)
    try {
      const result = await previewGroupFeeChange({
        groupId,
        groupNumber,
        fees: proposed,
      })
      if (isErr(result)) {
        toastError('Unable to check who this change affects.', {
          error: result.error,
        })
        return
      }
      setImpact(result.data)
      setMode('review')
    } finally {
      setIsWorking(false)
    }
  }

  const handleSave = async () => {
    if (isNil(proposed)) return
    setIsWorking(true)
    try {
      const result = await updateGroupFees({ groupId, fees: proposed })
      if (isErr(result)) {
        toastError('Unable to save the new fee. Please try again.', {
          error: result.error,
        })
        return
      }
      toast.success(`${title}'s fee is now ${formatGroupPrice(result.data)}`)
      router.refresh()
      onClose()
    } finally {
      setIsWorking(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next && !isWorking) onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title} fees</DialogTitle>
          <DialogDescription>
            {isNil(fees)
              ? "Fees aren't tracked for this group, so nobody in it shows as owing."
              : formatGroupPrice(fees)}
          </DialogDescription>
        </DialogHeader>

        {mode === 'edit' && (
          <FeeInputs
            idPrefix={`group-fees-${groupId}`}
            values={values}
            onChange={setValues}
            disabled={isWorking}
          />
        )}

        {mode === 'review' && !isNil(impact) && !isNil(proposed) && (
          <div className="space-y-2 rounded-md border bg-muted/40 p-4 text-sm">
            <p className="font-semibold">
              New price: {formatGroupPrice(proposed)}
            </p>
            <ImpactSummary impact={impact} />
            <p className="text-muted-foreground">
              Everyone in {title} owes the new amount. The change is logged.
            </p>
          </div>
        )}

        {mode === 'view' && canReadHistory && <FeeHistory history={history} />}

        <DialogFooter className="gap-2">
          {mode === 'view' && (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {canManageFees && (
                <Button onClick={() => setMode('edit')}>
                  {isNil(fees) ? 'Set fees' : 'Change fee'}
                </Button>
              )}
            </>
          )}
          {mode === 'edit' && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setValues(initialValues)
                  setMode('view')
                }}
                disabled={isWorking}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={isWorking || isNil(proposed) || unchanged}
              >
                {isWorking ? 'Checking…' : 'Review change'}
              </Button>
            </>
          )}
          {mode === 'review' && (
            <>
              <Button
                variant="outline"
                onClick={() => setMode('edit')}
                disabled={isWorking}
              >
                Back
              </Button>
              <Button onClick={handleSave} disabled={isWorking}>
                {isWorking ? 'Saving…' : 'Save new fee'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ImpactSummary({ impact }: { impact: FeeChangeImpact }) {
  const lines: string[] = []
  if (impact.moreOwed.people > 0) {
    const paid =
      impact.moreOwed.alreadyPaid > 0
        ? ` — ${plural(impact.moreOwed.alreadyPaid, 'has', 'have')} already paid and will owe the difference`
        : ''
    lines.push(
      `${plural(impact.moreOwed.people, 'person', 'people')} will owe ${formatFee(impact.moreOwed.total)} more in total${paid}.`
    )
  }
  if (impact.newlyOverpaid.people > 0) {
    lines.push(
      `${plural(impact.newlyOverpaid.people, 'person', 'people')} will have paid ${formatFee(impact.newlyOverpaid.total)} more than they owe. They'll show under Overpaid on the Payments page.`
    )
  }
  if (lines.length === 0) {
    lines.push('Nobody’s balance changes.')
  }
  return (
    <>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </>
  )
}

function FeeHistory({ history }: { history: FeeChange[] | null }) {
  if (isNil(history)) {
    return <p className="text-sm text-muted-foreground">Loading history…</p>
  }
  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No fee changes recorded.</p>
    )
  }
  return (
    <div className="space-y-2">
      <Separator />
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        History
      </p>
      <ul className="space-y-2 text-sm">
        {history.map((change) => (
          <li key={change.id} className="flex flex-col">
            <span>
              {isNil(change.before)
                ? `Set to ${isNil(change.after) ? 'no fees' : formatGroupPrice(change.after)}`
                : `${formatGroupPrice(change.before)} → ${isNil(change.after) ? 'no fees' : formatGroupPrice(change.after)}`}
            </span>
            <span className="text-[13px] text-muted-foreground">
              {new Date(change.changedAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              {' · '}
              {change.changedByName ?? 'System'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
