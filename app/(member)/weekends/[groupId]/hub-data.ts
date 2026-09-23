import 'server-only'

import { cache } from 'react'
import { getWeekendGroup } from '@/services/weekend'
import { getEventsForWeekendGroup } from '@/services/events'

// Per-request memoised reads shared by the hub frame and the tab pages, so a
// hub page costs one group lookup and one events query no matter how many
// components ask.

export const loadHubGroup = cache(async (groupId: string) =>
  getWeekendGroup(groupId)
)

export const loadHubEvents = cache(async (groupId: string) =>
  getEventsForWeekendGroup(groupId)
)
