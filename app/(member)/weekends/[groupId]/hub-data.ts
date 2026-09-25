import 'server-only'

import { cache } from 'react'
import { getCachedWeekendGroup } from '@/services/weekend/cached'
import { getCachedEventsForGroup } from '@/services/events/cached'

// Shared reads for the hub frame and the tab pages. Both come from the
// cross-request cache (the group and its events are the same for every
// viewer; writes to them call updateTag), and `cache` memoises them per
// render so a hub page costs one lookup each no matter how many components
// ask.

export const loadHubGroup = cache(async (groupId: string) =>
  getCachedWeekendGroup(groupId)
)

export const loadHubEvents = cache(async (groupId: string) =>
  getCachedEventsForGroup(groupId)
)
