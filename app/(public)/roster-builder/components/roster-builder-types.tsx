import { isNil } from 'lodash'
import type { CHARole } from '@/lib/weekend/types'
import type { RosterBuilderCommunityMember } from '@/services/roster-builder'
import {
  DEFAULT_ROSTER_TEMPLATE,
  getRolesForCategory,
} from '../roster-template'

// ── Types ─────────────────────────────────────────────────────────────────────

export type SlotAssignment =
  | { type: 'empty' }
  | {
      type: 'draft'
      draftId: string
      member: RosterBuilderCommunityMember
    }
  | {
      type: 'finalized'
      rosterId: string
      member: RosterBuilderCommunityMember
    }

export type RosterSlot = {
  id: string
  role: string
  rollo: string | null
  required: boolean
  assignment: SlotAssignment
}

export type RoleCategory = {
  name: string
  slots: RosterSlot[]
}

export type RosterBuilderBoardProps = {
  weekendId: string
  weekendTitle: string
  rectorUserId: string
  communityMembers: RosterBuilderCommunityMember[]
}

export type FilterMode = 'all' | 'filled' | 'empty'

// ── Category color palette ────────────────────────────────────────────────────

export type CategoryColorSet = {
  header: string
  border: string
  dot: string
  badge: string
}

const CATEGORY_COLORS: Record<string, CategoryColorSet> = {
  Leadership: {
    header:
      'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
  Rollistas: {
    header:
      'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  Spiritual: {
    header:
      'bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800',
    border: 'border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
    badge:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  Prayer: {
    header:
      'bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:border-pink-800',
    border: 'border-pink-200 dark:border-pink-800',
    dot: 'bg-pink-500',
    badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  },
  Chapel: {
    header:
      'bg-fuchsia-50 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:border-fuchsia-800',
    border: 'border-fuchsia-200 dark:border-fuchsia-800',
    dot: 'bg-fuchsia-500',
    badge:
      'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200',
  },
  Music: {
    header:
      'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800',
    border: 'border-green-200 dark:border-green-800',
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  Tech: {
    header:
      'bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-700',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-500',
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  },
  Palanca: {
    header:
      'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800',
    border: 'border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  },
  Table: {
    header:
      'bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800',
    border: 'border-orange-200 dark:border-orange-800',
    dot: 'bg-orange-500',
    badge:
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  Dorm: {
    header:
      'bg-lime-50 border-lime-200 dark:bg-lime-950/40 dark:border-lime-800',
    border: 'border-lime-200 dark:border-lime-800',
    dot: 'bg-lime-500',
    badge: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  },
  'Dining & Food': {
    header:
      'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-800',
    border: 'border-yellow-200 dark:border-yellow-800',
    dot: 'bg-yellow-500',
    badge:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  Mobile: {
    header:
      'bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800',
    border: 'border-teal-200 dark:border-teal-800',
    dot: 'bg-teal-500',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  },
}

export function getCategoryColors(name: string): CategoryColorSet {
  return (
    CATEGORY_COLORS[name] ?? {
      header: 'bg-muted border-border',
      border: 'border-border',
      dot: 'bg-muted-foreground',
      badge: 'bg-muted text-muted-foreground',
    }
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function fullName(m: RosterBuilderCommunityMember): string {
  return `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim()
}

export function slotLabel(slot: RosterSlot): string {
  if (slot.rollo != null) return `${slot.role} — ${slot.rollo}`
  return slot.role
}

export function getExperienceLabel(level: 1 | 2 | 3): {
  label: string
  color: string
} {
  if (level === 3) return { label: 'Veteran', color: 'amber' }
  if (level === 2) return { label: 'Experienced', color: 'blue' }
  return { label: 'Served', color: 'green' }
}

export function ExperienceBadge({
  level,
  weekendsServed,
}: {
  level: 1 | 2 | 3
  weekendsServed: number
}) {
  const exp = getExperienceLabel(level)
  return (
    <span
      className="inline-flex items-center rounded-full border border-transparent px-2 py-0.5 text-xs font-semibold"
      style={{
        backgroundColor: `var(--experience-level-${level})`,
        color: `var(--experience-level-${level}-fg)`,
      }}
    >
      {exp.label} · {weekendsServed}w
    </span>
  )
}

export function getEligibilityWarning(
  role: string,
  member: RosterBuilderCommunityMember
): string | null {
  const check = member.eligibility[role]
  if (!isNil(check) && !check.eligible) {
    return `Not eligible — ${check.reason}`
  }
  return null
}

export function getEligibleRoleSummary(
  member: RosterBuilderCommunityMember
): string {
  if (member.rectorReadyStatus.isReady)
    return 'Eligible for: All roles including Rector/Rover'
  if (member.hasBeenSectionHead && member.hasGivenRollo)
    return 'Eligible for: Head, Asst Head, and all general positions'
  if (member.hasBeenSectionHead)
    return 'Eligible for: General positions (needs rollo for Head)'
  return 'Eligible for: General positions'
}

// ── Build initial categories from template + real data ────────────────────────

let nextSlotId = 1
export function generateSlotId(): string {
  return `slot-${nextSlotId++}`
}

export function buildInitialCategories(
  communityMembers: RosterBuilderCommunityMember[]
): RoleCategory[] {
  // Build lookup maps for assigned members
  const memberById = new Map(communityMembers.map((m) => [m.id, m]))

  // Track which (role, rollo) combos have been filled by real assignments
  // so we can match them against template slots
  const assignedMembers = communityMembers.filter(
    (m) => m.assignmentStatus.type !== 'unassigned'
  )

  return DEFAULT_ROSTER_TEMPLATE.map((templateCat) => {
    // Clone template slots as RosterSlots
    const slots: RosterSlot[] = templateCat.slots.map((ts) => ({
      id: generateSlotId(),
      role: ts.role,
      rollo: ts.rollo ?? null,
      required: ts.required,
      assignment: { type: 'empty' as const },
    }))

    // Try to fill template slots with existing assignments
    for (const member of assignedMembers) {
      const status = member.assignmentStatus
      if (status.type === 'unassigned') continue

      const role = status.chaRole
      const rollo = status.rollo

      // Find a matching empty slot in this category
      const matchIdx = slots.findIndex(
        (s) =>
          s.assignment.type === 'empty' &&
          s.role === role &&
          (s.rollo ?? null) === (rollo ?? null)
      )

      if (matchIdx !== -1) {
        if (status.type === 'finalized') {
          slots[matchIdx].assignment = {
            type: 'finalized',
            rosterId: status.rosterId,
            member,
          }
        } else if (status.type === 'draft') {
          slots[matchIdx].assignment = {
            type: 'draft',
            draftId: status.draftId,
            member,
          }
        }
      } else {
        // No matching template slot — check if this role belongs in this category
        const categoryRoles = getRolesForCategory(templateCat.name)
        if (categoryRoles.includes(role as CHARole)) {
          // Add an extra slot for this assignment
          const newSlot: RosterSlot = {
            id: generateSlotId(),
            role,
            rollo: rollo ?? null,
            required: false,
            assignment:
              status.type === 'finalized'
                ? { type: 'finalized', rosterId: status.rosterId, member }
                : { type: 'draft', draftId: status.draftId, member },
          }
          slots.push(newSlot)
        }
      }
    }

    return { name: templateCat.name, slots }
  })
}
