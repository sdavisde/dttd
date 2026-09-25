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

/** The group and the selected weekend: shared data, the same for everyone. */
export type HubGroupContext = {
  group: WeekendGroupWithId
  weekendType: WeekendType
  weekend: Weekend
  /** The other weekend in the group (Women's when Men's is selected). */
  otherWeekend: Weekend
}

/** {@link HubGroupContext} plus the viewer. */
export type HubContext = HubGroupContext & {
  user: User
}

/**
 * Resolves the group and the selected weekend for a hub page from the
 * shared cache — no viewer lookup, so the hub frame and the tabs that show
 * only shared data never wait on the session. `cache` makes it one lookup
 * per request however many segments ask.
 */
export const loadHubGroupContext = cache(
  async (groupId: string, slug: string): Promise<HubGroupContext> => {
    const weekendType = parseWeekendSlug(slug)
    if (isNil(weekendType)) notFound()

    const groupResult = await loadHubGroup(groupId)
    if (isErr(groupResult)) notFound()

    const group = groupResult.data
    const otherType =
      weekendType === WeekendType.MENS ? WeekendType.WOMENS : WeekendType.MENS

    return {
      group,
      weekendType,
      weekend: group.weekends[weekendType],
      otherWeekend: group.weekends[otherType],
    }
  }
)

/**
 * {@link loadHubGroupContext} plus the viewer, for tabs whose content
 * depends on who is looking. The two reads run in parallel.
 */
export const loadHubContext = cache(
  async (groupId: string, slug: string): Promise<HubContext> => {
    const [userResult, groupContext] = await Promise.all([
      getLoggedInUser(),
      loadHubGroupContext(groupId, slug),
    ])
    if (isErr(userResult)) redirect('/login')

    return { user: userResult.data, ...groupContext }
  }
)

/** {@link loadHubGroupContext} straight from a page's route params. */
export async function loadHubGroupContextFromParams(params: HubParams) {
  const { groupId, weekend } = await params
  return loadHubGroupContext(groupId, weekend)
}

/** {@link loadHubContext} straight from a page's route params. */
export async function loadHubContextFromParams(params: HubParams) {
  const { groupId, weekend } = await params
  return loadHubContext(groupId, weekend)
}
