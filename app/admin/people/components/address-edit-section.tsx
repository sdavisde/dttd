'use client'

import { isNil } from 'lodash'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FieldErrors } from '../hooks/use-user-edit-form'
import type { AddressFields } from '../types'
import { EditorFieldError, editorFieldLabelClass } from './editor-section-card'

interface AddressEditSectionProps {
  address: AddressFields
  onChange: (fields: AddressFields) => void
  errors?: FieldErrors<AddressFields>
  disabled: boolean
}

export function AddressEditSection({
  address,
  onChange,
  errors = {},
  disabled,
}: AddressEditSectionProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className={editorFieldLabelClass}>Street address</Label>
        <Input
          value={address.addressLine1}
          onChange={(e) =>
            onChange({ ...address, addressLine1: e.target.value })
          }
          placeholder="123 Main St"
          aria-invalid={!isNil(errors.addressLine1)}
          disabled={disabled}
        />
        <EditorFieldError message={errors.addressLine1} />
      </div>
      <div className="space-y-1">
        <Label className={editorFieldLabelClass}>Apt / suite (optional)</Label>
        <Input
          value={address.addressLine2}
          onChange={(e) =>
            onChange({ ...address, addressLine2: e.target.value })
          }
          placeholder="Apt 4B"
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className={editorFieldLabelClass}>City</Label>
          <Input
            value={address.city}
            onChange={(e) => onChange({ ...address, city: e.target.value })}
            placeholder="City"
            aria-invalid={!isNil(errors.city)}
            disabled={disabled}
          />
          <EditorFieldError message={errors.city} />
        </div>
        <div className="space-y-1">
          <Label className={editorFieldLabelClass}>State</Label>
          <Input
            value={address.state}
            onChange={(e) => onChange({ ...address, state: e.target.value })}
            placeholder="TX"
            aria-invalid={!isNil(errors.state)}
            disabled={disabled}
          />
          <EditorFieldError message={errors.state} />
        </div>
        <div className="space-y-1">
          <Label className={editorFieldLabelClass}>Zip</Label>
          <Input
            className="tabular-nums"
            value={address.zip}
            onChange={(e) => onChange({ ...address, zip: e.target.value })}
            placeholder="12345"
            aria-invalid={!isNil(errors.zip)}
            disabled={disabled}
          />
          <EditorFieldError message={errors.zip} />
        </div>
      </div>
    </div>
  )
}
