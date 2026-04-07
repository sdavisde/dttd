'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Typography } from '@/components/ui/typography'
import type { AddressFields } from '../types'

interface AddressEditSectionProps {
  address: AddressFields
  onChange: (fields: AddressFields) => void
  disabled: boolean
}

export function AddressEditSection({
  address,
  onChange,
  disabled,
}: AddressEditSectionProps) {
  return (
    <section className="space-y-2">
      <Typography variant="muted" className="text-sm font-bold">
        Address
      </Typography>
      <div className="bg-muted/20 rounded-md p-4 space-y-3 border">
        <div className="space-y-1">
          <Label className="text-xs">Street Address</Label>
          <Input
            value={address.addressLine1}
            onChange={(e) =>
              onChange({ ...address, addressLine1: e.target.value })
            }
            placeholder="123 Main St"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Apt / Suite (Optional)</Label>
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
            <Label className="text-xs">City</Label>
            <Input
              value={address.city}
              onChange={(e) => onChange({ ...address, city: e.target.value })}
              placeholder="City"
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">State</Label>
            <Input
              value={address.state}
              onChange={(e) => onChange({ ...address, state: e.target.value })}
              placeholder="TX"
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Zip</Label>
            <Input
              value={address.zip}
              onChange={(e) => onChange({ ...address, zip: e.target.value })}
              placeholder="12345"
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
