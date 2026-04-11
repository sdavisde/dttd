'use client'

import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from '@/components/ui/command'
import type { CHARole } from '@/lib/weekend/types'
import type { RosterBuilderCommunityMember } from '@/services/roster-builder'
import { getRolesForCategory } from '../roster-template'
import type { RoleCategory, FilterMode } from './roster-builder-types'
import { getCategoryColors, fullName } from './roster-builder-types'
import { FilledSlotCard, EmptySlotCard } from './slot-cards'

export function KanbanColumn({
  category,
  availableMembers,
  searchQuery,
  filterMode,
  onAssign,
  onRemove,
  onAddSlot,
}: {
  category: RoleCategory
  availableMembers: RosterBuilderCommunityMember[]
  searchQuery: string
  filterMode: FilterMode
  onAssign: (slotId: string, member: RosterBuilderCommunityMember) => void
  onRemove: (slotId: string) => void
  onAddSlot: (categoryName: string, role: CHARole) => void
}) {
  const [addOpen, setAddOpen] = useState(false)
  const filled = category.slots.filter(
    (s) => s.assignment.type !== 'empty'
  ).length
  const total = category.slots.length
  const colors = getCategoryColors(category.name)
  const allFilled = filled === total

  const visibleSlots = useMemo(() => {
    let slots = category.slots
    const q = searchQuery.trim().toLowerCase()
    if (q.length > 0) {
      slots = slots.filter(
        (s) =>
          s.role.toLowerCase().includes(q) ||
          (s.rollo ?? '').toLowerCase().includes(q) ||
          (s.assignment.type !== 'empty'
            ? fullName(s.assignment.member).toLowerCase().includes(q)
            : false)
      )
    }
    if (filterMode === 'filled')
      slots = slots.filter((s) => s.assignment.type !== 'empty')
    if (filterMode === 'empty')
      slots = slots.filter((s) => s.assignment.type === 'empty')
    return slots
  }, [category.slots, searchQuery, filterMode])

  const categoryRoles = useMemo(
    () => getRolesForCategory(category.name),
    [category.name]
  )

  if (visibleSlots.length === 0 && !addOpen) return null

  return (
    <div
      className={`flex w-72 shrink-0 flex-col rounded-xl border ${colors.border} bg-card shadow-sm`}
    >
      {/* Column header */}
      <div className={`rounded-t-xl border-b ${colors.header} px-4 py-3`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${colors.dot}`}
            />
            <span className="truncate text-sm font-semibold text-foreground">
              {category.name}
            </span>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
              allFilled
                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                : colors.badge
            }`}
          >
            {filled}/{total}
          </span>
        </div>
      </div>

      {/* Slots */}
      <div
        className="flex flex-col gap-2 overflow-y-auto p-3"
        style={{ maxHeight: '560px' }}
      >
        {visibleSlots.map((slot) =>
          slot.assignment.type !== 'empty' ? (
            <FilledSlotCard
              key={slot.id}
              slot={slot}
              onRemove={() => onRemove(slot.id)}
            />
          ) : (
            <EmptySlotCard
              key={slot.id}
              slot={slot}
              availableMembers={availableMembers}
              onAssign={(m) => onAssign(slot.id, m)}
            />
          )
        )}

        {/* Add Position button */}
        <Popover open={addOpen} onOpenChange={setAddOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/20 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
              <Plus className="h-3.5 w-3.5" />
              Add Position
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search roles..." className="h-9" />
              <CommandList className="max-h-48">
                <CommandEmpty>No roles found.</CommandEmpty>
                <CommandGroup>
                  {categoryRoles.map((role) => (
                    <CommandItem
                      key={role}
                      value={role}
                      onSelect={() => {
                        onAddSlot(category.name, role)
                        setAddOpen(false)
                      }}
                      className="text-sm"
                    >
                      {role}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
