'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
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
import { roleChipClasses } from '../config/columns'

interface RolesEditSectionProps {
  options: { value: string; label: string }[]
  selectedRoleIds: string[]
  onChange: (ids: string[]) => void
  disabled: boolean
}

/**
 * Roles as removable chips plus a dashed "+ Add role" chip, per the People
 * board. Roles themselves are defined on the Security page; this only assigns
 * them, and it saves with the rest of the editor.
 */
export function RolesEditSection({
  options,
  selectedRoleIds,
  onChange,
  disabled,
}: RolesEditSectionProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const selected = selectedRoleIds
    .map((id) => options.find((option) => option.value === id))
    .filter((option): option is { value: string; label: string } => {
      return option !== undefined
    })
  const unassigned = options.filter(
    (option) => !selectedRoleIds.includes(option.value)
  )

  const removeRole = (id: string) => {
    onChange(selectedRoleIds.filter((roleId) => roleId !== id))
  }

  const addRole = (id: string) => {
    onChange([...selectedRoleIds, id])
    setPickerOpen(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {selected.length === 0 && (
        <span className="text-sm text-muted-foreground">No roles yet.</span>
      )}

      {selected.map((option) => (
        <span
          key={option.value}
          className={cn(
            'inline-flex min-h-11 items-center gap-1 rounded-full pl-3 text-[13px] font-semibold sm:min-h-0 sm:py-0.5 sm:pl-2.5 sm:text-xs',
            disabled ? 'pr-3 sm:pr-2.5' : 'pr-0.5 sm:pr-1',
            roleChipClasses(option.label)
          )}
        >
          {option.label}
          {!disabled && (
            <button
              type="button"
              onClick={() => removeRole(option.value)}
              aria-label={`Remove ${option.label}`}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full opacity-70 outline-none hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:size-4"
            >
              <X aria-hidden className="size-3" />
            </button>
          )}
        </span>
      ))}

      {!disabled && unassigned.length > 0 && (
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-full border border-dashed border-border px-3 text-[13px] font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:min-h-0 sm:py-0.5 sm:px-2.5 sm:text-xs"
            >
              + Add role
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <Command>
              <CommandInput placeholder="Find a role…" />
              <CommandList>
                <CommandEmpty>No roles left to add.</CommandEmpty>
                <CommandGroup>
                  {unassigned.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => addRole(option.value)}
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
