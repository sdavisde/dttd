'use client'

import type { ReactNode } from 'react'
import { isNil } from 'lodash'
import { ChevronDown } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

/**
 * Field label styling for the person editor — the board's small uppercase
 * caption above every input.
 */
export const editorFieldLabelClass =
  'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'

interface EditorSectionCardProps {
  title: string
  /** Appended to the heading in muted text, e.g. "· served DTTD #10, #11". */
  summary?: string | null
  /** Contact info and Roles open by default; everything else starts closed. */
  defaultOpen?: boolean
  className?: string
  children: ReactNode
}

/**
 * One bordered, collapsible card in the per-person editor. The heading is the
 * button: it toggles on click, Enter and Space (Radix), and the chevron flips
 * to point up while the card is open.
 */
export function EditorSectionCard({
  title,
  summary,
  defaultOpen = false,
  className,
  children,
}: EditorSectionCardProps) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className={cn('rounded-md border border-divider bg-card', className)}
    >
      <CollapsibleTrigger className="group flex min-h-11 w-full items-center gap-1.5 rounded-md px-3.5 py-2.5 text-left text-sm font-semibold text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <span className="shrink-0">{title}</span>
        {!isNil(summary) && summary !== '' && (
          <span className="truncate font-normal text-muted-foreground">
            · {summary}
          </span>
        )}
        <ChevronDown
          aria-hidden
          className="ml-auto size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-divider px-3.5 py-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
