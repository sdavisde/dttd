'use server'

import { redirect } from 'next/navigation'
import { isNil } from 'lodash'
import { getActiveWeekends, getWeekendOptions } from '@/services/weekend'
import { getAllCandidatesWithDetails } from '@/actions/candidates'
import { WeekendType } from '@/lib/weekend/types'
import * as Results from '@/lib/results'
import { HydratedCandidate } from '@/lib/candidates/types'
import { User } from '@/lib/users/types'
import { getLoggedInUser } from '@/services/identity/user'
import { logger } from '@/lib/logger'

export interface CandidateListPageData {
  candidates: HydratedCandidate[]
  weekendOptions: Array<{ id: string; label: string }>
  currentWeekendId: string | undefined
  currentWeekendType: WeekendType
  user: User | null
}

export async function getCandidateListPageData(
  searchParams: Promise<{
    weekend?: string
    weekendType?: WeekendType
  }>
): Promise<CandidateListPageData> {
  const awaitedParams = await searchParams
  // "weekend" is actually the weekend group id (either mens or womens)
  const { weekend, weekendType } = awaitedParams

  const userResult = await getLoggedInUser()
  const user = Results.isOk(userResult) ? userResult.data : null

  const [weekendOptionsResult, activeWeekendsResult] = await Promise.all([
    getWeekendOptions(),
    getActiveWeekends(),
  ])

  const weekendOptions = Results.unwrapOr(weekendOptionsResult, [])

  if (Results.isErr(activeWeekendsResult)) {
    logger.error(
      'Failed to render /candidate-list: Could not load active weekends'
    )
    throw new Error('Could not load candidate list')
  }

  // using mens weekend because we're just finding the groupid
  const activeWeekend = activeWeekendsResult.data[WeekendType.MENS]
  const activeWeekendGroupId = activeWeekend.groupId

  if (isNil(activeWeekendGroupId)) {
    logger.error(
      'Failed to render /candidate-list: Could not load active weekend group ID'
    )
    throw new Error('Could not load candidate list')
  }

  // Handle defaults and redirection
  const targetWeekend = weekend ?? activeWeekendGroupId
  const targetType = weekendType ?? WeekendType.MENS

  const isWeekendMissingButAvailable = isNil(weekend) && !isNil(targetWeekend)
  const isTypeMissing = isNil(weekendType)

  if (isWeekendMissingButAvailable || isTypeMissing) {
    const params = new URLSearchParams()
    params.set('weekend', targetWeekend)
    params.set('weekendType', targetType)
    redirect(`/candidate-list?${params.toString()}`)
  }

  // Fetch candidates if we have a weekend selected
  const candidatesResult = await getAllCandidatesWithDetails({
    weekendGroupId: targetWeekend,
    weekendType: targetType,
  })

  const candidates = Results.unwrap(candidatesResult)

  return {
    candidates,
    weekendOptions,
    currentWeekendId: weekend,
    currentWeekendType: targetType,
    user,
  }
}
