import 'server-only'

import { defineCachedRead } from '@/lib/cache/cached-read'
import { eventsForGroupTags } from '@/lib/cache/tags'
import * as EventsService from './events-service'

// Every event write calls updateTag; the day is a safety net.
const DAY_SECONDS = 60 * 60 * 24

/** {@link EventsService.getEventsForWeekendGroup}, shared across requests. */
export const getCachedEventsForGroup = defineCachedRead(
  'events-for-group',
  (client, groupId: string) =>
    EventsService.getEventsForWeekendGroup(groupId, { client }),
  {
    tags: (groupId) => eventsForGroupTags(groupId),
    revalidateSeconds: DAY_SECONDS,
  }
)
