'use server'

import { createClient } from '@/lib/supabase/server'
import { Result, err, ok } from '@/lib/results'
import {
  UserServiceHistory,
  UserExperience,
  calculateExperienceLevel,
  calculateRectorReadyStatus,
  groupExperienceByCommunity,
  countDistinctWeekends,
  UserExperienceSchema,
} from '@/lib/users/experience'
import z from 'zod'
import { isNil } from 'lodash'

export async function getUserServiceHistory(
  userId: string
): Promise<Result<Error, UserServiceHistory>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users_experience')
      .select(
        `
        id,
        user_id,
        weekend_id,
        cha_role,
        external_community_weekend,
        rollo,
        served_date,
        created_at,
        updated_at,
        weekends (
          id,
          number,
          type,
          start_date,
          title
        )
      `
      )
      .eq('user_id', userId)
      .order('served_date', { ascending: false })

    if (error) {
      return err(new Error(`Failed to fetch user experience: ${error.message}`))
    }

    if (isNil(data)) {
      return ok({
        level: 1,
        rectorReady: {
          isReady: false,
          criteria: {
            hasServedHeadOrAssistantHead: false,
            hasServedTeamHead: false,
            hasGivenTwoOrMoreTalks: false,
            hasWorkedDining: false,
          },
        },
        groupedExperience: [],
        totalWeekends: 0,
        totalDTTDWeekends: 0,
      })
    }

    const parseResult = z.array(UserExperienceSchema).safeParse(data)

    if (!parseResult.success) {
      return err(
        new Error(
          `Invalid experience data: ${parseResult.error.issues.map((e) => e.message).join(', ')}`
        )
      )
    }

    const records: UserExperience[] = parseResult.data

    const totalWeekends = countDistinctWeekends(records)
    const level = calculateExperienceLevel(totalWeekends)
    const rectorReady = calculateRectorReadyStatus(records)
    const groupedExperience = groupExperienceByCommunity(records)
    const totalDTTDWeekends = groupedExperience.filter((g) => g.community === 'DTTD').length

    return ok({
      level,
      rectorReady,
      groupedExperience,
      totalWeekends,
      totalDTTDWeekends,
    })
  } catch (error) {
    return err(
      new Error(
        `Error while fetching user experience: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}
