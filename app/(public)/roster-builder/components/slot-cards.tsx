'use client'

import { useState, useMemo } from 'react'
import {
  X,
  Calendar,
  Star,
  AlertTriangle,
  CheckCircle2,
  MoreVertical,
  UserX,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  accentColor,
  accentDraftColor,
  onRemove,
  onFinalize,
  onDrop,
}: {
  slot: RosterSlot
  accentColor: string
  accentDraftColor: string
  onRemove: () => void
  onFinalize?: () => void
  onDrop?: () => void
}) {
  const assignment = slot.assignment
  if (assignment.type === 'empty') return null
  const member = assignment.member
  const isDraft = assignment.type === 'draft'

  return (
    <div
      className={`group relative rounded-lg border border-l-4 p-4 shadow-sm transition-all hover:shadow-md ${
        isDraft
          ? `${accentDraftColor} bg-muted/30 dark:bg-muted/10`
          : `${accentColor} bg-card`
      }`}
    >
      {/* Top-right actions */}
      <div className="absolute right-2 top-2 flex items-center gap-0.5">
        {isDraft ? (
          <button
            onClick={onRemove}
            className="rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            aria-label={`Remove ${fullName(member)}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                aria-label={`Actions for ${fullName(member)}`}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={onDrop}
                className="text-amber-600 dark:text-amber-400"
              >
                <UserX className="mr-2 h-4 w-4" />
                Dropped
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRemove} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Role label + draft badge */}
      <div className="mb-1.5 flex items-start gap-2 pr-6">
        <p className="text-xs font-semibold text-muted-foreground leading-snug">
          {slotLabel(slot)}
        </p>
        {isDraft && (
          <span className="shrink-0 rounded-full border border-muted-foreground/20 px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
            Draft
          </span>
        )}
      </div>

      {/* Member name */}
      <p className="text-sm font-semibold leading-tight text-foreground truncate">
        {fullName(member)}
      </p>

      {/* Experience badge + indicator icons — combined row */}
      <div className="mt-2 flex items-center gap-2">
        <ExperienceBadge
          level={member.experienceLevel}
          weekendsServed={member.weekendsServed}
        />
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

      {/* Finalize button for drafts */}
      {isDraft && onFinalize != null && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 h-7 w-full gap-1.5 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Finalize
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Finalize Assignment</AlertDialogTitle>
              <AlertDialogDescription>
                Have you personally confirmed that{' '}
                <span className="font-semibold text-foreground">
                  {fullName(member)}
                </span>{' '}
                has accepted the{' '}
                <span className="font-semibold text-foreground">
                  {slotLabel(slot)}
                </span>{' '}
                position?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onFinalize}>
                Yes, Finalize
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
          <p className="text-sm font-medium text-muted-foreground leading-snug break-words">
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
