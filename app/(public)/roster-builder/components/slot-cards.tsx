'use client'

import { useState, useMemo } from 'react'
import { X, Calendar, Star, AlertTriangle } from 'lucide-react'
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
import type { RosterBuilderCommunityMember } from '@/services/roster-builder'
import type { RosterSlot } from './roster-builder-types'
import {
  fullName,
  slotLabel,
  ExperienceBadge,
  getEligibilityWarning,
} from './roster-builder-types'

// ── Filled Slot Card ──────────────────────────────────────────────────────────

export function FilledSlotCard({
  slot,
  onRemove,
}: {
  slot: RosterSlot
  onRemove: () => void
}) {
  const assignment = slot.assignment
  if (assignment.type === 'empty') return null
  const member = assignment.member
  const isDraft = assignment.type === 'draft'

  return (
    <div
      className={`group relative rounded-lg p-4 shadow-sm transition-all hover:shadow-md ${
        isDraft
          ? 'border-2 border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10'
          : 'border bg-card'
      }`}
    >
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        aria-label={`Remove ${fullName(member)}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Draft indicator */}
      {isDraft && (
        <span className="absolute left-2 top-2 text-xs font-medium text-primary">
          Draft
        </span>
      )}

      {/* Role label */}
      <p
        className={`mb-1.5 truncate pr-6 text-xs font-medium uppercase tracking-wide text-muted-foreground ${isDraft ? 'mt-3' : ''}`}
      >
        {slotLabel(slot)}
      </p>

      {/* Member name */}
      <p className="text-base font-semibold leading-tight text-foreground truncate">
        {fullName(member)}
      </p>

      {/* Experience badge */}
      <div className="mt-2">
        <ExperienceBadge
          level={member.experienceLevel}
          weekendsServed={member.weekendsServed}
        />
      </div>

      {/* Indicator icons */}
      <div className="mt-2 flex items-center gap-2">
        {member.attendsSecuela && (
          <span
            title="Attends Secuela"
            className="text-blue-500 dark:text-blue-400"
          >
            <Calendar className="h-3.5 w-3.5" />
          </span>
        )}
        {member.rectorReadyStatus.isReady && (
          <span
            title="Rector Ready"
            className="text-amber-500 dark:text-amber-400"
          >
            <Star className="h-3.5 w-3.5 fill-amber-400" />
          </span>
        )}
      </div>

      {/* Last 2 past roles */}
      {member.experience.length > 0 && (
        <div className="mt-2 space-y-0.5 border-t pt-2">
          {member.experience.slice(0, 2).map((r, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-snug">
              {r.weekend_reference}: {r.cha_role}
              {r.rollo != null ? ` — ${r.rollo}` : ''}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Empty Slot Card ───────────────────────────────────────────────────────────

export function EmptySlotCard({
  slot,
  availableMembers,
  onAssign,
}: {
  slot: RosterSlot
  availableMembers: RosterBuilderCommunityMember[]
  onAssign: (member: RosterBuilderCommunityMember) => void
}) {
  const [open, setOpen] = useState(false)

  const sortedMembers = useMemo(() => {
    return [...availableMembers].sort((a, b) => {
      if (a.attendsSecuela !== b.attendsSecuela)
        return a.attendsSecuela ? -1 : 1
      return b.weekendsServed - a.weekendsServed
    })
  }, [availableMembers])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`w-full rounded-lg border-2 border-dashed p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 ${
            slot.required
              ? 'border-muted-foreground/25 dark:border-muted-foreground/20'
              : 'border-muted-foreground/15 dark:border-muted-foreground/10'
          }`}
        >
          <p className="text-sm font-medium text-muted-foreground leading-snug">
            {slotLabel(slot)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            {slot.required
              ? 'Required — click to assign'
              : 'Optional — click to assign'}
          </p>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="bottom">
        <Command>
          <CommandInput placeholder="Search members..." className="h-9" />
          <CommandList className="max-h-72">
            <CommandEmpty>No members found.</CommandEmpty>
            <CommandGroup heading={`${sortedMembers.length} available`}>
              {sortedMembers.map((m) => {
                const warning = getEligibilityWarning(slot.role, m)
                return (
                  <CommandItem
                    key={m.id}
                    value={`${fullName(m)} ${m.church ?? ''}`}
                    onSelect={() => {
                      onAssign(m)
                      setOpen(false)
                    }}
                    className="flex flex-col items-start gap-1 py-2.5"
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">
                          {fullName(m)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {m.church}
                        </p>
                      </div>
                      <ExperienceBadge
                        level={m.experienceLevel}
                        weekendsServed={m.weekendsServed}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {m.attendsSecuela && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-blue-600 dark:text-blue-400">
                          <Calendar className="h-3 w-3" /> Secuela
                        </span>
                      )}
                      {m.rectorReadyStatus.isReady && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                          <Star className="h-3 w-3" /> Rector Ready
                        </span>
                      )}
                    </div>
                    {warning !== null && (
                      <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        {warning}
                      </p>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
