'use client'

import { useState } from 'react'
import { isNil } from 'lodash'
import { useAutoSave } from '@/hooks/use-auto-save'
import { AutoSaveStatusIndicator } from '@/components/auto-save/auto-save-status'
import {
  FeeInputs,
  feeInputValuesFrom,
  parseFeeInputs,
  type FeeInputValues,
} from '@/components/fees/fee-inputs'
import { formatFee } from '@/lib/payments/group-fees'
import { updateFeeDefaults, type FeeDefaults } from '@/services/fees'

/**
 * The defaults new groups start at. Auto-saves: unlike a group's own fee,
 * changing a default moves nobody's balance.
 */
export function FeeDefaultsEditor({
  defaults,
  canEdit,
}: {
  defaults: FeeDefaults
  canEdit: boolean
}) {
  const [values, setValues] = useState<FeeInputValues>(
    feeInputValuesFrom(defaults.weekendFee, defaults.onlineSurcharge)
  )
  const parsed = parseFeeInputs(values)

  const autoSave = useAutoSave({
    value: parsed ?? defaults,
    isValid: !isNil(parsed),
    enabled: canEdit,
    errorMessage: 'Unable to save the default fees. Please try again.',
    save: updateFeeDefaults,
  })

  return (
    <>
      <div className="flex items-center gap-3 pb-1">
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          Fees for new weekend groups
        </h2>
        {canEdit && (
          <AutoSaveStatusIndicator
            status={autoSave.status}
            onRetry={autoSave.flush}
            className="ml-auto"
          />
        )}
      </div>
      <div className="py-3">
        {canEdit ? (
          <FeeInputs
            idPrefix="fee-defaults"
            values={values}
            onChange={setValues}
          />
        ) : (
          <p className="text-sm">
            <span className="font-semibold tabular-nums">
              {formatFee(defaults.weekendFee)}
            </span>{' '}
            weekend fee ·{' '}
            <span className="tabular-nums">
              {formatFee(defaults.onlineSurcharge)}
            </span>{' '}
            card processing when paying online
          </p>
        )}
      </div>
      <p className="text-[13px] text-muted-foreground">
        Changes apply to new weekend groups. To change a current group&apos;s
        fee, open it on the Weekends page.
      </p>
    </>
  )
}
