import { notFound, redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import { isErr } from '@/lib/results'
import { hubPath, resolveWeekendType, WEEKEND_PARAM } from '@/lib/weekend/hub'
import { loadHubGroup } from './hub-data'

type PageProps = {
  params: Promise<{ groupId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * The group root has no page of its own: it sends the viewer to their own
 * weekend's overview (or the one an old `?weekend=` link asked for).
 */
export default async function WeekendGroupRedirect({
  params,
  searchParams,
}: PageProps) {
  const [{ groupId }, query] = await Promise.all([params, searchParams])
  const [userResult, groupResult] = await Promise.all([
    getLoggedInUser(),
    loadHubGroup(groupId),
  ])
  if (isErr(userResult)) redirect('/login')
  if (isErr(groupResult)) notFound()

  const weekendType = resolveWeekendType(
    query[WEEKEND_PARAM],
    userResult.data.gender
  )
  redirect(hubPath(groupResult.data.groupId, 'overview', weekendType))
}
