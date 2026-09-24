'use client'

import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { SegmentedControl } from '@/components/ui/segmented-control'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LEDGER_STATUS_FILTERS,
  type LedgerStatusFilter,
} from '@/lib/payments/ledger'
import { cn } from '@/lib/utils'

const STATUS_FILTER_LABELS: Record<LedgerStatusFilter, string> = {
  all: 'All',
  outstanding: 'Outstanding',
  overpaid: 'Overpaid',
  paid: 'Paid',
  waived: 'Waived',
}

// Chips are 44px tall on touch screens and step down to the board's compact
// pill at md+, where a pointer is doing the clicking.
const CHIP_CLASSES =
  'h-11 gap-1.5 rounded-full border-border bg-card px-3.5 text-[13px] font-medium text-nav-foreground md:h-8'

type LedgerFiltersProps = {
  status: LedgerStatusFilter
  onStatusChange: (status: LedgerStatusFilter) => void
  weekendOptions: string[]
  selectedWeekends: string[]
  onWeekendsChange: (weekends: string[]) => void
  typeOptions: string[]
  selectedTypes: string[]
  onTypesChange: (types: string[]) => void
  roleOptions: string[]
  selectedRoles: string[]
  onRolesChange: (roles: string[]) => void
  yearOptions: number[]
  year: number | null
  onYearChange: (year: number | null) => void
  /** Hidden entirely when there is nothing voided to show. */
  showVoidedToggle: boolean
  showVoided: boolean
  onShowVoidedChange: (showVoided: boolean) => void
}

/**
 * The board's filter row: the All / Outstanding / Overpaid / Paid / Waived segmented
 * control and the Weekend, Type and Date chips. Wraps onto extra lines on a
 * narrow screen rather than scrolling sideways.
 */
export function LedgerFilters({
  status,
  onStatusChange,
  weekendOptions,
  selectedWeekends,
  onWeekendsChange,
  typeOptions,
  selectedTypes,
  onTypesChange,
  roleOptions,
  selectedRoles,
  onRolesChange,
  yearOptions,
  year,
  onYearChange,
  showVoidedToggle,
  showVoided,
  onShowVoidedChange,
}: LedgerFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SegmentedControl
        aria-label="Show"
        value={status}
        onValueChange={onStatusChange}
        options={LEDGER_STATUS_FILTERS.map((value) => ({
          value,
          label: STATUS_FILTER_LABELS[value],
        }))}
      />

      <MultiSelectChip
        label="Weekend"
        anyLabel="any"
        options={weekendOptions}
        selected={selectedWeekends}
        onChange={onWeekendsChange}
      />
      <MultiSelectChip
        label="Type"
        anyLabel="all fees"
        options={typeOptions}
        selected={selectedTypes}
        onChange={onTypesChange}
      />
      <MultiSelectChip
        label="Role"
        anyLabel="any"
        options={roleOptions}
        selected={selectedRoles}
        onChange={onRolesChange}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={CHIP_CLASSES}>
            Date: {year ?? 'any'}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup
            value={String(year ?? 'any')}
            onValueChange={(value) =>
              onYearChange(value === 'any' ? null : Number.parseInt(value, 10))
            }
          >
            <DropdownMenuRadioItem value="any">Any year</DropdownMenuRadioItem>
            {yearOptions.map((option) => (
              <DropdownMenuRadioItem key={option} value={String(option)}>
                {option}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {showVoidedToggle && (
        <div className="flex min-h-11 items-center gap-2 md:min-h-0">
          <Checkbox
            id="show-voided"
            checked={showVoided}
            onCheckedChange={(checked) => onShowVoidedChange(checked === true)}
          />
          <Label
            htmlFor="show-voided"
            className="text-muted-foreground text-sm font-normal"
          >
            Show voided
          </Label>
        </div>
      )}
    </div>
  )
}

function MultiSelectChip({
  label,
  anyLabel,
  options,
  selected,
  onChange,
}: {
  label: string
  anyLabel: string
  options: string[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const summary =
    selected.length === 0
      ? anyLabel
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selected`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            CHIP_CLASSES,
            selected.length > 0 && 'border-primary text-foreground'
          )}
        >
          <span className="max-w-[14rem] truncate">
            {label}: {summary}
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={selected.includes(option)}
            // Keep the menu open so several can be ticked in one go.
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={(checked) =>
              onChange(
                checked === true
                  ? [...selected, option]
                  : selected.filter((value) => value !== option)
              )
            }
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
