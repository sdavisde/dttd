'use server'

import { isNil } from 'lodash'
import { getActiveWeekends, getWeekendOptions } from '@/services/weekend'
import { getAllCandidatesWithDetails } from '@/actions/candidates'
import { WeekendType } from '@/lib/weekend/types'
import { Result, Results, isErr, isOk } from '@/lib/results'
import type { HydratedCandidate } from '@/lib/candidates/types'

export interface ReviewPageData {
  candidates: HydratedCandidate[]
  weekendOptions: Array<{ id: string; label: string }>
  currentWeekendId: string | undefined
  currentWeekendType: WeekendType
}

export async function getReviewPageData(
  searchParams: Promise<{
    weekend?: string
    weekendType?: WeekendType
  }>
): Promise<ReviewPageData> {
  const awaitedParams = await searchParams
  const { weekend, weekendType } = awaitedParams

  const [weekendOptionsResult, activeWeekendsResult] = await Promise.all([
    getWeekendOptions(),
    getActiveWeekends(),
  ])

  const weekendOptions = isOk(weekendOptionsResult)
    ? weekendOptionsResult.data
    : []

  const activeWeekendGroupId = Results.unwrap(activeWeekendsResult).MENS.groupId

  // Resolve defaults in place:
  // 1. If no weekend selected, fall back to the active one
  // 2. If 'weekendType' is missing, default to MENS
  //
  // We deliberately do NOT redirect to decorate the URL with the defaults: a
  // redirect dispatched from a deferred commit (the Suspense/loading.tsx shell
  // flushes before this page finishes rendering) replays client-side and
  // crashes Next's router. The URL simply stays bare until the user changes a
  // filter.
  const targetWeekend = weekend ?? activeWeekendGroupId ?? undefined
  const targetType = weekendType ?? WeekendType.MENS

  // Fetch candidates if we have a weekend resolved
  let candidates: HydratedCandidate[] = []
  if (!isNil(targetWeekend)) {
    const candidatesResult = await getAllCandidatesWithDetails({
      weekendGroupId: targetWeekend,
      weekendType: targetType,
    })

    if (isOk(candidatesResult)) {
      candidates = candidatesResult.data
    } else {
      console.error('Error fetching candidates:', candidatesResult.error)
    }
  }

  return {
    candidates,
    weekendOptions,
    currentWeekendId: targetWeekend,
    currentWeekendType: targetType,
  }
}
