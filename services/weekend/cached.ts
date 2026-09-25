import 'server-only'

import { defineCachedRead } from '@/lib/cache/cached-read'
import { TAGS, weekendGroupTags } from '@/lib/cache/tags'
import * as WeekendService from './weekend-service'

// Weekend groups change a few times a year and every write to them calls
// updateTag, so the day-long revalidation is only a safety net.
const DAY_SECONDS = 60 * 60 * 24

/** {@link WeekendService.getWeekendGroup}, shared across requests. */
export const getCachedWeekendGroup = defineCachedRead(
  'weekend-group',
  (client, groupId: string) =>
    WeekendService.getWeekendGroup(groupId, { client }),
  {
    tags: (groupId) => weekendGroupTags(groupId),
    revalidateSeconds: DAY_SECONDS,
  }
)

/** {@link WeekendService.getActiveGroupId}, shared across requests. */
export const getCachedActiveGroupId = defineCachedRead(
  'active-group-id',
  (client) => WeekendService.getActiveGroupId({ client }),
  { tags: () => [TAGS.weekends], revalidateSeconds: DAY_SECONDS }
)

/** {@link WeekendService.getActiveWeekends}, shared across requests. */
export const getCachedActiveWeekends = defineCachedRead(
  'active-weekends',
  (client) => WeekendService.readActiveWeekends({ client }),
  { tags: () => [TAGS.weekends], revalidateSeconds: DAY_SECONDS }
)

/** {@link WeekendService.getAllWeekendGroups}, shared across requests. */
export const getCachedAllWeekendGroups = defineCachedRead(
  'all-weekend-groups',
  (client) => WeekendService.getAllWeekendGroups({ client }),
  { tags: () => [TAGS.weekends], revalidateSeconds: DAY_SECONDS }
)
