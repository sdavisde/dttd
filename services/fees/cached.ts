import 'server-only'

import { defineCachedRead } from '@/lib/cache/cached-read'
import { TAGS, groupFeesTags } from '@/lib/cache/tags'
import * as FeesService from './fees-service'

// Every fee write calls updateTag; the day is a safety net.
const DAY_SECONDS = 60 * 60 * 24

/** {@link FeesService.getGroupFees}, shared across requests. */
export const getCachedGroupFees = defineCachedRead(
  'group-fees',
  (client, groupId: string) => FeesService.getGroupFees(groupId, { client }),
  { tags: (groupId) => groupFeesTags(groupId), revalidateSeconds: DAY_SECONDS }
)

/**
 * {@link FeesService.getGroupFeesForWeekend}, shared across requests. The
 * weekend → group hop is a `weekends` read, so both tags apply.
 */
export const getCachedGroupFeesForWeekend = defineCachedRead(
  'group-fees-for-weekend',
  (client, weekendId: string) =>
    FeesService.getGroupFeesForWeekend(weekendId, { client }),
  {
    tags: () => [TAGS.groupFees, TAGS.weekends],
    revalidateSeconds: DAY_SECONDS,
  }
)
