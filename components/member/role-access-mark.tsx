import { KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'

export const ROLE_ACCESS_LABEL = 'Shown because of your role'

/**
 * A quiet key that marks a link only some people see (review candidates,
 * roster builder). Deliberately muted: it sets the item apart
 * without shouting about access levels.
 */
export function RoleAccessMark({ className }: { className?: string }) {
  return (
    <span title={ROLE_ACCESS_LABEL} className={cn('inline-flex', className)}>
      <KeyRound
        className="size-3.5 text-muted-foreground/70"
        aria-hidden
        strokeWidth={1.75}
      />
      <span className="sr-only">{ROLE_ACCESS_LABEL}</span>
    </span>
  )
}
