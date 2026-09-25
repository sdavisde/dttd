'use client'

import { isNil } from 'lodash'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatFee, parseFeeAmount } from '@/lib/payments/group-fees'

export type FeeInputValues = {
  /** The weekend fee as typed — one number for team and candidates. */
  weekendFee: string
  onlineSurcharge: string
}

/** The typed values as numbers, or null while either one is invalid. */
export function parseFeeInputs(
  values: FeeInputValues
): { weekendFee: number; onlineSurcharge: number } | null {
  const weekendFee = parseFeeAmount(values.weekendFee)
  const onlineSurcharge = parseFeeAmount(values.onlineSurcharge)
  return isNil(weekendFee) || isNil(onlineSurcharge)
    ? null
    : { weekendFee, onlineSurcharge }
}

export function feeInputValuesFrom(
  weekendFee: number,
  onlineSurcharge: number
): FeeInputValues {
  return {
    weekendFee: String(weekendFee),
    onlineSurcharge: String(onlineSurcharge),
  }
}

type FeeInputsProps = {
  idPrefix: string
  values: FeeInputValues
  onChange: (values: FeeInputValues) => void
  disabled?: boolean
}

/**
 * The weekend fee and the card-processing amount, with a live preview of what
 * cash and online payers are charged. The fee is framed as the price; the
 * surcharge is secondary.
 */
export function FeeInputs({
  idPrefix,
  values,
  onChange,
  disabled = false,
}: FeeInputsProps) {
  const parsed = parseFeeInputs(values)
  const feeInvalid = isNil(parseFeeAmount(values.weekendFee))
  const surchargeInvalid = isNil(parseFeeAmount(values.onlineSurcharge))

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-fee`}>Weekend fee</Label>
          <Input
            id={`${idPrefix}-fee`}
            inputMode="decimal"
            value={values.weekendFee}
            onChange={(e) =>
              onChange({ ...values, weekendFee: e.target.value })
            }
            disabled={disabled}
            aria-invalid={feeInvalid}
            className="h-11 tabular-nums md:h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-surcharge`}>Card processing</Label>
          <Input
            id={`${idPrefix}-surcharge`}
            inputMode="decimal"
            value={values.onlineSurcharge}
            onChange={(e) =>
              onChange({ ...values, onlineSurcharge: e.target.value })
            }
            disabled={disabled}
            aria-invalid={surchargeInvalid}
            className="h-11 tabular-nums md:h-9"
          />
        </div>
      </div>
      <p className="text-[13px] text-muted-foreground">
        {isNil(parsed)
          ? 'Enter dollar amounts, like 200 or 212.50.'
          : `Team members and candidates pay ${formatFee(parsed.weekendFee)} by cash or check, or ${formatFee(parsed.weekendFee + parsed.onlineSurcharge)} online (${formatFee(parsed.onlineSurcharge)} card processing).`}
      </p>
    </div>
  )
}
