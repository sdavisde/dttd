import { isNil } from 'lodash'
import { CHARole } from '@/lib/weekend/types'
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
  weekendType: string
  rectorUserId: string
  communityMembers: RosterBuilderCommunityMember[]
  hasSecuelaEvent: boolean
}

export type FilterMode = 'all' | 'filled' | 'empty'

// ── Category color palette ────────────────────────────────────────────────────

export type CategoryColorSet = {
  header: string
  border: string
  dot: string
  badge: string
  accent: string
  accentDraft: string
}

const CATEGORY_COLORS: Record<string, CategoryColorSet> = {
  Leadership: {
    header:
      'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    accent: 'border-l-amber-400 dark:border-l-amber-500',
    accentDraft: 'border-l-amber-300 dark:border-l-amber-700',
  },
  Rollistas: {
    header:
      'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    accent: 'border-l-blue-400 dark:border-l-blue-500',
    accentDraft: 'border-l-blue-300 dark:border-l-blue-700',
  },
  Spiritual: {
    header:
      'bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800',
    border: 'border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
    badge:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    accent: 'border-l-purple-400 dark:border-l-purple-500',
    accentDraft: 'border-l-purple-300 dark:border-l-purple-700',
  },
  Prayer: {
    header:
      'bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:border-pink-800',
    border: 'border-pink-200 dark:border-pink-800',
    dot: 'bg-pink-500',
    badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    accent: 'border-l-pink-400 dark:border-l-pink-500',
    accentDraft: 'border-l-pink-300 dark:border-l-pink-700',
  },
  Chapel: {
    header:
      'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800',
    border: 'border-indigo-200 dark:border-indigo-800',
    dot: 'bg-indigo-500',
    badge:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    accent: 'border-l-indigo-400 dark:border-l-indigo-500',
    accentDraft: 'border-l-indigo-300 dark:border-l-indigo-700',
  },
  Music: {
    header:
      'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800',
    border: 'border-green-200 dark:border-green-800',
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    accent: 'border-l-green-400 dark:border-l-green-500',
    accentDraft: 'border-l-green-300 dark:border-l-green-700',
  },
  Tech: {
    header:
      'bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-700',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-500',
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    accent: 'border-l-slate-400 dark:border-l-slate-500',
    accentDraft: 'border-l-slate-300 dark:border-l-slate-600',
  },
  Palanca: {
    header:
      'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800',
    border: 'border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    accent: 'border-l-rose-400 dark:border-l-rose-500',
    accentDraft: 'border-l-rose-300 dark:border-l-rose-700',
  },
  Table: {
    header:
      'bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800',
    border: 'border-orange-200 dark:border-orange-800',
    dot: 'bg-orange-500',
    badge:
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    accent: 'border-l-orange-400 dark:border-l-orange-500',
    accentDraft: 'border-l-orange-300 dark:border-l-orange-700',
  },
  Dorm: {
    header:
      'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    badge:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    accent: 'border-l-emerald-400 dark:border-l-emerald-500',
    accentDraft: 'border-l-emerald-300 dark:border-l-emerald-700',
  },
  'Dining & Food': {
    header:
      'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-800',
    border: 'border-yellow-200 dark:border-yellow-800',
    dot: 'bg-yellow-500',
    badge:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    accent: 'border-l-yellow-400 dark:border-l-yellow-500',
    accentDraft: 'border-l-yellow-300 dark:border-l-yellow-700',
  },
  Mobile: {
    header:
      'bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800',
    border: 'border-teal-200 dark:border-teal-800',
    dot: 'bg-teal-500',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    accent: 'border-l-teal-400 dark:border-l-teal-500',
    accentDraft: 'border-l-teal-300 dark:border-l-teal-700',
  },
}

export function getCategoryColors(name: string): CategoryColorSet {
  return (
    CATEGORY_COLORS[name] ?? {
      header: 'bg-muted border-border',
      border: 'border-border',
      dot: 'bg-muted-foreground',
      badge: 'bg-muted text-muted-foreground',
      accent: 'border-l-muted-foreground',
      accentDraft: 'border-l-muted-foreground/50',
    }
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function fullName(m: RosterBuilderCommunityMember): string {
  return `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim()
}

export function slotLabel(slot: RosterSlot): string {
  if (slot.rollo != null) return `${slot.role} — ${slot.rollo}`
  if (slot.role === CHARole.TABLE_LEADER) return `${slot.role} — Silent`
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
  if (member.rectorReadyStatus.criteria.hasServedAsRector)
    return 'Eligible for: All roles (Past Rector)'
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
