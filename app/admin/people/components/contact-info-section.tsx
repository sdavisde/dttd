'use client'

import { isNil } from 'lodash'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FieldErrors, SectionChange } from '../hooks/use-user-edit-form'
import type { ContactFields } from '../types'
import { EditorFieldError, editorFieldLabelClass } from './editor-section-card'

interface ContactInfoSectionProps {
  contact: ContactFields
  onChange: SectionChange<ContactFields>
  errors?: FieldErrors<ContactFields>
  disabled: boolean
}

export function ContactInfoSection({
  contact,
  onChange,
  errors = {},
  disabled,
}: ContactInfoSectionProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className={editorFieldLabelClass}>First name</Label>
          <Input
            value={contact.firstName}
            onChange={(e) =>
              onChange({ ...contact, firstName: e.target.value })
            }
            placeholder="First name"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label className={editorFieldLabelClass}>Last name</Label>
          <Input
            value={contact.lastName}
            onChange={(e) => onChange({ ...contact, lastName: e.target.value })}
            placeholder="Last name"
            disabled={disabled}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className={editorFieldLabelClass}>Phone</Label>
          <PhoneInput
            className="tabular-nums"
            value={contact.phone}
            onChange={(e) => onChange({ ...contact, phone: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label className={editorFieldLabelClass}>Email</Label>
          <Input
            type="email"
            value={contact.email}
            onChange={(e) => onChange({ ...contact, email: e.target.value })}
            placeholder="email@example.com"
            aria-invalid={!isNil(errors.email)}
            disabled={disabled}
          />
          <EditorFieldError message={errors.email} />
        </div>
      </div>
      <div className="space-y-1">
        <Label className={editorFieldLabelClass}>Gender</Label>
        <Select
          value={contact.gender}
          onValueChange={(v) =>
            onChange({ ...contact, gender: v }, { immediate: true })
          }
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
