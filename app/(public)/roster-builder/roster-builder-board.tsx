'use client'

import { useState, useMemo, useCallback, useTransition } from 'react'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { isNil } from 'lodash'
import { toast } from 'sonner'
import { toastError } from '@/lib/toast-error'
import { isErr } from '@/lib/results'
import type { RosterBuilderCommunityMember } from '@/services/roster-builder'
import {
  addDraftRosterMember,
  removeDraftRosterMember,
} from '@/services/roster-builder'
import type { CHARole } from '@/lib/weekend/types'
import type {
  RosterSlot,
  RosterBuilderBoardProps,
  FilterMode,
} from './components/roster-builder-types'
import {
  buildInitialCategories,
  generateSlotId,
} from './components/roster-builder-types'
import { StatsHeader } from './components/stats-header'
import { KanbanColumn } from './components/kanban-column'
import { Toolbar } from './components/toolbar'

// ── Main Component ────────────────────────────────────────────────────────────

export function RosterBuilderBoard({
  weekendId,
  weekendTitle,
  rectorUserId,
  communityMembers,
}: RosterBuilderBoardProps) {
  const [isPending, startTransition] = useTransition()
  const [categories, setCategories] = useState(() =>
    buildInitialCategories(communityMembers)
  )
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')

  // Derived: unassigned community members
  const availableMembers = useMemo(() => {
    const assignedIds = new Set<string>()
    for (const cat of categories) {
      for (const slot of cat.slots) {
        if (slot.assignment.type !== 'empty') {
          assignedIds.add(slot.assignment.member.id)
        }
      }
    }
    return communityMembers.filter((m) => !assignedIds.has(m.id))
  }, [categories, communityMembers])

  const { filledCount, totalCount } = useMemo(() => {
    let filled = 0
    let total = 0
    for (const cat of categories) {
      for (const slot of cat.slots) {
        total++
        if (slot.assignment.type !== 'empty') filled++
      }
    }
    return { filledCount: filled, totalCount: total }
  }, [categories])

  // Assign a member to a slot (creates a draft via server action)
  const handleAssign = useCallback(
    (slotId: string, member: RosterBuilderCommunityMember) => {
      // Find the slot to get role/rollo
      let targetSlot: RosterSlot | undefined
      for (const cat of categories) {
        targetSlot = cat.slots.find((s) => s.id === slotId)
        if (!isNil(targetSlot)) break
      }
      if (isNil(targetSlot)) return

      // Optimistic update
      const tempDraftId = `temp-${Date.now()}`
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          slots: cat.slots.map((s) =>
            s.id === slotId
              ? {
                  ...s,
                  assignment: {
                    type: 'draft' as const,
                    draftId: tempDraftId,
                    member,
                  },
                }
              : s
          ),
        }))
      )

      // Server action
      startTransition(async () => {
        const result = await addDraftRosterMember(
          weekendId,
          member.id,
          targetSlot!.role,
          rectorUserId,
          targetSlot!.rollo ?? undefined
        )

        if (isErr(result)) {
          // Rollback optimistic update
          setCategories((prev) =>
            prev.map((cat) => ({
              ...cat,
              slots: cat.slots.map((s) =>
                s.id === slotId
                  ? { ...s, assignment: { type: 'empty' as const } }
                  : s
              ),
            }))
          )
          toastError('Unable to assign member. Please try again.', {
            error: result.error,
          })
        }
      })
    },
    [categories, weekendId, rectorUserId]
  )

  // Remove a member from a slot
  const handleRemove = useCallback(
    (slotId: string) => {
      let targetSlot: RosterSlot | undefined
      for (const cat of categories) {
        targetSlot = cat.slots.find((s) => s.id === slotId)
        if (!isNil(targetSlot)) break
      }
      if (isNil(targetSlot) || targetSlot.assignment.type === 'empty') return

      // Only handle draft removal in this task (finalized removal is Task 5.0)
      if (targetSlot.assignment.type === 'finalized') {
        toast.info('Use the admin roster page to remove finalized members.')
        return
      }

      const draftId = targetSlot.assignment.draftId
      const savedAssignment = targetSlot.assignment

      // Optimistic update
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          slots: cat.slots.map((s) =>
            s.id === slotId
              ? { ...s, assignment: { type: 'empty' as const } }
              : s
          ),
        }))
      )

      startTransition(async () => {
        const result = await removeDraftRosterMember(draftId)
        if (isErr(result)) {
          // Rollback
          setCategories((prev) =>
            prev.map((cat) => ({
              ...cat,
              slots: cat.slots.map((s) =>
                s.id === slotId ? { ...s, assignment: savedAssignment } : s
              ),
            }))
          )
          toastError('Unable to remove member. Please try again.', {
            error: result.error,
          })
        }
      })
    },
    [categories]
  )

  // Add a new empty slot to a category
  const handleAddSlot = useCallback((categoryName: string, role: CHARole) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.name === categoryName
          ? {
              ...cat,
              slots: [
                ...cat.slots,
                {
                  id: generateSlotId(),
                  role,
                  rollo: null,
                  required: false,
                  assignment: { type: 'empty' as const },
                },
              ],
            }
          : cat
      )
    )
  }, [])

  // Filter columns
  const visibleCategories = useMemo(() => {
    if (search.trim().length === 0 && filterMode === 'all') return categories

    return categories
      .map((cat) => {
        let slots = cat.slots
        const q = search.trim().toLowerCase()
        if (q.length > 0) {
          slots = slots.filter(
            (s) =>
              s.role.toLowerCase().includes(q) ||
              (s.rollo ?? '').toLowerCase().includes(q) ||
              (s.assignment.type !== 'empty'
                ? `${s.assignment.member.firstName ?? ''} ${s.assignment.member.lastName ?? ''}`
                    .toLowerCase()
                    .includes(q)
                : false)
          )
        }
        if (filterMode === 'filled')
          slots = slots.filter((s) => s.assignment.type !== 'empty')
        if (filterMode === 'empty')
          slots = slots.filter((s) => s.assignment.type === 'empty')
        return { ...cat, slots }
      })
      .filter((cat) => cat.slots.length > 0)
  }, [categories, search, filterMode])

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 dark:bg-background">
      {/* Page header */}
      <header className="border-b bg-card px-6 py-5 shadow-sm">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              Roster Builder
            </h1>
            <Badge variant="outline" className="text-sm">
              {weekendTitle}
            </Badge>
          </div>
          <StatsHeader categories={categories} />
        </div>
      </header>

      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 border-b bg-card/95 px-6 py-3 shadow-sm backdrop-blur-sm">
        <div className="mx-auto max-w-screen-2xl">
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            filterMode={filterMode}
            onFilterModeChange={setFilterMode}
            communityMembers={communityMembers}
            categories={categories}
            onAssign={handleAssign}
            filledCount={filledCount}
            totalCount={totalCount}
          />
        </div>
      </div>

      {/* Horizontal kanban board */}
      <main className="flex-1 overflow-hidden px-6 py-4">
        <div className="mx-auto max-w-screen-2xl">
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex gap-3 pb-4">
              {visibleCategories.length === 0 ? (
                <div className="flex h-48 w-full items-center justify-center">
                  <div className="text-center">
                    <p className="text-base font-medium text-muted-foreground">
                      No columns match your current filters.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setSearch('')
                        setFilterMode('all')
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                </div>
              ) : (
                visibleCategories.map((cat) => (
                  <KanbanColumn
                    key={cat.name}
                    category={cat}
                    availableMembers={availableMembers}
                    searchQuery={search}
                    filterMode={filterMode}
                    onAssign={handleAssign}
                    onRemove={handleRemove}
                    onAddSlot={handleAddSlot}
                  />
                ))
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </main>
    </div>
  )
}
