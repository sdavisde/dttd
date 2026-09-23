'use client'

import { useId, useState } from 'react'
import { isNil } from 'lodash'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Permission } from '@/lib/security'
import { phraseList, summariseRole } from '@/lib/security/role-summary'

interface RoleSummaryCardProps {
  /** Own ∪ inherited — what the role really grants. */
  effective: ReadonlySet<Permission>
  parentLabel: string | null
  /** Collapsed to its header when true (phones); open on desktop. */
  defaultCollapsed: boolean
}

/**
 * The plain-English answer to "so what can this role actually do?", computed
 * from the effective set and shown right under the header. Two columns, Can
 * and Can't; one line when the role has Full access.
 */
export function RoleSummaryCard({
  effective,
  parentLabel,
  defaultCollapsed,
}: RoleSummaryCardProps) {
  const [open, setOpen] = useState(!defaultCollapsed)
  const panelId = useId()
  const summary = summariseRole(effective)
  const Chevron = open ? ChevronDown : ChevronRight

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
          <span className="font-normal text-muted-foreground">
            —{' '}
            {isNil(parentLabel)
              ? 'computed from what you set below'
              : `computed from ${parentLabel} plus this role`}
          </span>
        </span>
      </button>

      {open && (
        <div id={panelId}>
          {summary.kind === 'full-access' ? (
            <p className="text-[13px] leading-relaxed text-foreground">
              Everything — this role has Full access.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SummaryColumn
                heading="Can"
                headingClass="text-success"
                permissions={summary.can}
                empty="Nothing yet."
              />
              <SummaryColumn
                heading="Can’t"
                headingClass="text-destructive"
                permissions={summary.cant}
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
  permissions,
  empty,
}: {
  heading: string
  headingClass: string
  permissions: readonly Permission[]
  empty: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          'text-[12px] font-semibold tracking-wider uppercase',
          headingClass
        )}
      >
        {heading}
      </div>
      <p className="text-[13px] leading-relaxed text-foreground">
        {permissions.length === 0 ? (
          <span className="text-muted-foreground">{empty}</span>
        ) : (
          phraseList(permissions)
        )}
      </p>
    </div>
  )
}
