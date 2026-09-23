'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MonthPickerPopover } from '@/components/ui/month-picker'
import { RECOGNIZED_COMMUNITIES } from '@/lib/communities/whitelist'
import type { CommunityFields } from '../types'
import { editorFieldLabelClass } from './editor-section-card'

interface CommunityInfoSectionProps {
  community: CommunityFields
  onChange: (fields: CommunityFields) => void
  disabled: boolean
}

export function CommunityInfoSection({
  community,
  onChange,
  disabled,
}: CommunityInfoSectionProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className={editorFieldLabelClass}>Church affiliation</Label>
        <Input
          value={community.churchAffiliation}
          onChange={(e) =>
            onChange({ ...community, churchAffiliation: e.target.value })
          }
          placeholder="My Church"
          disabled={disabled}
        />
      </div>
      <div className="space-y-1">
        <Label className={editorFieldLabelClass}>Weekend attended</Label>
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={community.weekendCommunity}
            onValueChange={(v) =>
              onChange({ ...community, weekendCommunity: v })
            }
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Community" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(RECOGNIZED_COMMUNITIES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            className="tabular-nums"
            value={community.weekendNumber}
            onChange={(e) =>
              onChange({ ...community, weekendNumber: e.target.value })
            }
            placeholder="Weekend #"
            disabled={disabled}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className={editorFieldLabelClass}>
          Essentials training date
        </Label>
        <MonthPickerPopover
          value={community.essentialsDate}
          onChange={(date) => onChange({ ...community, essentialsDate: date })}
          placeholder="Pick a date"
        />
      </div>
    </div>
  )
}
