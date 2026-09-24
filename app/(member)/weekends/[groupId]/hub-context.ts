import 'server-only'

import { cache } from 'react'
import { notFound, redirect } from 'next/navigation'
import { isNil } from 'lodash'
import { getLoggedInUser } from '@/services/identity/user'
import { isErr } from '@/lib/results'
import type { User } from '@/lib/users/types'
import { parseWeekendSlug } from '@/lib/weekend/hub'
import type { Weekend, WeekendGroupWithId } from '@/lib/weekend/types'
import { WeekendType } from '@/lib/weekend/types'
import { loadHubGroup } from './hub-data'

/** Route params for every page under `/weekends/[groupId]/[weekend]`. */
export type HubParams = Promise<{ groupId: string; weekend: string }>

export type HubContext = {
  user: User
  group: WeekendGroupWithId
  weekendType: WeekendType
  weekend: Weekend
  /** The other weekend in the group (Women's when Men's is selected). */
  otherWeekend: Weekend
}

/**
 * Resolves the group, the viewer and the selected weekend for a hub page.
 * The hub layout and each tab page both call this; `cache` makes it one
 * lookup per request, and on a tab change only the page runs it again.
 */
export const loadHubContext = cache(
  async (groupId: string, slug: string): Promise<HubContext> => {
    const weekendType = parseWeekendSlug(slug)
    if (isNil(weekendType)) notFound()

    const [userResult, groupResult] = await Promise.all([
      getLoggedInUser(),
      loadHubGroup(groupId),
    ])
    if (isErr(userResult)) redirect('/login')
    if (isErr(groupResult)) notFound()

    const group = groupResult.data
    const otherType =
      weekendType === WeekendType.MENS ? WeekendType.WOMENS : WeekendType.MENS

    return {
      user: userResult.data,
      group,
      weekendType,
      weekend: group.weekends[weekendType],
      otherWeekend: group.weekends[otherType],
    }
  }
)

/** {@link loadHubContext} straight from a page's route params. */
export async function loadHubContextFromParams(params: HubParams) {
  const { groupId, weekend } = await params
  return loadHubContext(groupId, weekend)
}
