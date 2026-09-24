'use client'

import { useId, useState } from 'react'
import { isNil } from 'lodash'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Permission } from '@/lib/security'
import {
  countPhrases,
  summariseRole,
  type SummaryGroup,
} from '@/lib/security/role-summary'

interface RoleSummaryCardProps {
  /** Own ∪ inherited — what the role really grants. */
  effective: ReadonlySet<Permission>
  parentLabel: string | null
}

/**
 * The plain-English answer to "so what can this role actually do?", computed
 * from the effective set and shown right under the header. Closed to one line
 * until it is opened; then two columns, Can and Can't, each grouped by area.
 * One line when the role has Full access.
 */
export function RoleSummaryCard({
  effective,
  parentLabel,
}: RoleSummaryCardProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const summary = summariseRole(effective)
  const Chevron = open ? ChevronDown : ChevronRight
  const count =
    summary.kind === 'full-access' ? null : countPhrases(summary.can)

  return (
    <div className="flex flex-col gap-2.5 rounded-md border border-border bg-card px-4 py-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 cursor-pointer items-center gap-2 text-left text-sm font-semibold text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:min-h-0"
      >
        <Chevron aria-hidden className="size-3.5 shrink-0" />
        <span>
          What this role can do{' '}
          <span className="font-normal text-muted-foreground tabular-nums">
            —{' '}
            {isNil(count)
              ? 'every permission'
              : `${count} ${count === 1 ? 'permission' : 'permissions'}`}
          </span>
        </span>
      </button>

      {open && (
        <div id={panelId} className="flex flex-col gap-3">
          <p className="text-xs leading-snug text-muted-foreground">
            {isNil(parentLabel)
              ? 'Computed from what you set below.'
              : `Computed from ${parentLabel} plus this role.`}
          </p>
          {summary.kind === 'full-access' ? (
            <p className="text-sm leading-5 text-foreground">
              Everything — this role has Full access.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SummaryColumn
                heading="Can"
                headingClass="text-success"
                groups={summary.can}
                empty="Nothing yet."
              />
              <SummaryColumn
                heading="Can’t"
                headingClass="text-destructive"
                groups={summary.cant}
                empty="Nothing — every area is covered."
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SummaryColumn({
  heading,
  headingClass,
  groups,
  empty,
}: {
  heading: string
  headingClass: string
  groups: readonly SummaryGroup[]
  empty: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          'text-[12px] font-semibold tracking-wider uppercase',
          headingClass
        )}
      >
        {heading}
      </div>
      {groups.length === 0 ? (
        <p className="text-sm leading-5 text-muted-foreground">{empty}</p>
      ) : (
        groups.map((group) => (
          <div key={group.area} className="flex flex-col gap-0.5">
            <div className="text-xs font-medium text-muted-foreground">
              {group.area}
            </div>
            {group.phrases.map((phrase) => (
              <div key={phrase} className="text-sm leading-5 text-foreground">
                {phrase}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
