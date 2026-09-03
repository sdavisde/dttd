import { isNil } from 'lodash'
import type { Event } from '@/services/events'

/**
 * The board keys event chips by scope, not by event type: group-wide events
 * read solid brown, Men's muted, Women's cream, community green.
 */
export type EventScope = 'both' | 'mens' | 'womens' | 'community'

export interface ScopeContext {
  mensWeekendId?: string
  womensWeekendId?: string
}

export function getEventScope(event: Event, ctx: ScopeContext): EventScope {
  if (!isNil(event.weekendId)) {
    if (event.weekendId === ctx.mensWeekendId) return 'mens'
    if (event.weekendId === ctx.womensWeekendId) return 'womens'
  }
  if (!isNil(event.weekendGroupId)) return 'both'
  return 'community'
}

export const SCOPE_CHIP_CLASSES: Record<EventScope, string> = {
  both: 'bg-primary text-primary-foreground',
  mens: 'bg-muted text-foreground',
  womens: 'bg-secondary text-secondary-foreground',
  community: 'bg-success/15 text-success',
}

export const SCOPE_DOT_CLASSES: Record<EventScope, string> = {
  both: 'bg-primary',
  mens: 'bg-muted border border-input',
  womens: 'bg-secondary border border-secondary-border',
  community: 'bg-success/20',
}

export function scopeLabel(scope: EventScope, groupNumber: number | null) {
  const suffix = isNil(groupNumber) ? '' : ` #${groupNumber}`
  switch (scope) {
    case 'both':
      return 'Both'
    case 'mens':
      return `Men's${suffix}`
    case 'womens':
      return `Women's${suffix}`
    case 'community':
      return 'Community'
  }
}
