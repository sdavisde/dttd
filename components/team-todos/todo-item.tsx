'use client'

import Link from 'next/link'
import { Square, CheckSquare, Info, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { isNil } from 'lodash'

type TodoItemProps = {
  /** Display text for the TODO item */
  label: string
  /** URL to navigate to, or null if disabled */
  href: string | null
  /** Whether this TODO is complete */
  isComplete: boolean
  /** Tooltip text shown when item is disabled */
  tooltip?: string
}

export function TodoItem({ label, href, isComplete, tooltip }: TodoItemProps) {
  const CheckIcon = isComplete ? CheckSquare : Square
  const isClickable = !isNil(href) && !isComplete

  const content = (
    <div
      className={cn(
        'flex items-center gap-3 py-2',
        isComplete && 'text-muted-foreground'
      )}
    >
      <CheckIcon
        className={cn('size-5 shrink-0', isComplete && 'text-muted-foreground')}
        aria-hidden="true"
      />
      <span className={cn(isComplete && 'line-through')}>{label}</span>
      {!href && tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="size-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      )}
      {isClickable && (
        <ChevronRight
          className="size-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      )}
    </div>
  )

  // Disabled item (no href)
  if (isNil(href)) {
    return (
      <div className="cursor-not-allowed opacity-60" aria-disabled="true">
        {content}
      </div>
    )
  }

  // Active link
  return (
    <Link
      href={href}
      className={cn(
        'block hover:bg-muted/50 rounded-md -mx-2 px-2 transition-colors',
        isComplete && 'pointer-events-none'
      )}
    >
      {content}
    </Link>
  )
}
