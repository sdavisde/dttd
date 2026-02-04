'use server'

import { redirect } from 'next/navigation'
import { isNil } from 'lodash'
import { getActiveWeekends, getWeekendOptions } from '@/services/weekend'
import { getAllCandidatesWithDetails } from '@/actions/candidates'
import { WeekendType } from '@/lib/weekend/types'
import { Result, Results, isErr, isOk } from '@/lib/results'
import { HydratedCandidate } from '@/lib/candidates/types'

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

  let activeWeekendGroupId = Results.unwrap(activeWeekendsResult).MENS.groupId

  // Handle defaults and redirection
  // 1. If no weekend selected, and we have an active one -> redirect to active
  // 2. If 'weekendType' is missing, default to MENS
  const targetWeekend = weekend ?? activeWeekendGroupId
  const targetType = weekendType ?? WeekendType.MENS

  // If we have a target weekend but it's not in the params, OR match missing type, redirect
  // The original logic was: if ((!weekend && targetWeekend) || !weekendType)
  // We want to preserve that behavior but using our new vars.
  const isWeekendMissingButAvailable = isNil(weekend) && !isNil(targetWeekend)
  const isTypeMissing = isNil(weekendType)

  if (isWeekendMissingButAvailable || isTypeMissing) {
    const params = new URLSearchParams()
    if (targetWeekend) params.set('weekend', targetWeekend)
    params.set('weekendType', targetType)
    redirect(`/review-candidates?${params.toString()}`)
  }

  // Fetch candidates if we have a weekend selected
  let candidates: HydratedCandidate[] = []
  if (!isNil(weekend)) {
    const candidatesResult = await getAllCandidatesWithDetails({
      weekendGroupId: weekend,
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
    currentWeekendId: weekend,
    currentWeekendType: targetType,
  }
}
