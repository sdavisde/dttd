'use client'

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
import { Typography } from '@/components/ui/typography'
import type { ContactFields } from '../types'

interface ContactInfoSectionProps {
  contact: ContactFields
  onChange: (fields: ContactFields) => void
  disabled: boolean
}

export function ContactInfoSection({
  contact,
  onChange,
  disabled,
}: ContactInfoSectionProps) {
  return (
    <section className="space-y-2">
      <Typography variant="muted" className="text-sm font-bold">
        Contact Information
      </Typography>
      <div className="bg-muted/20 rounded-md p-4 space-y-3 border">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">First Name</Label>
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
            <Label className="text-xs">Last Name</Label>
            <Input
              value={contact.lastName}
              onChange={(e) =>
                onChange({ ...contact, lastName: e.target.value })
              }
              placeholder="Last name"
              disabled={disabled}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Email</Label>
          <Input
            type="email"
            value={contact.email}
            onChange={(e) => onChange({ ...contact, email: e.target.value })}
            placeholder="email@example.com"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Phone</Label>
          <PhoneInput
            value={contact.phone}
            onChange={(e) => onChange({ ...contact, phone: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Gender</Label>
          <Select
            value={contact.gender}
            onValueChange={(v) => onChange({ ...contact, gender: v })}
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
    </section>
  )
}
