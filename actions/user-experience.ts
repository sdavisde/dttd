'use server'

import { createClient } from '@/lib/supabase/server'
import { Result, err, ok } from '@/lib/results'
import {
  UserExperience,
  calculateExperienceLevel,
  calculateRectorReadyStatus,
  groupExperienceByCommunity,
  countDistinctWeekends,
  UserExperienceSchema,
} from '@/lib/users/experience'
import z from 'zod'
import { isNil } from 'lodash'
import { UserExperienceFormValue } from '@/components/team-forms/schemas'
import { UserServiceHistory } from '@/services/master-roster/types'
import { WeekendReference } from '@/lib/weekend/weekend-reference'

/**
 * @deprecated - move a version of this function to the master roster service and call that instead.
 * I figure we don't need to join on weekends anymore and can just use the weekend reference
 */
export async function getUserServiceHistory(
  userId: string
): Promise<Result<string, UserServiceHistory>> {
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
        weekend_reference,
        rollo,
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
      .order('created_at', { ascending: true })

    if (error) {
      return err(`Failed to fetch user experience: ${error.message}`)
    }

    if (isNil(data)) {
      return ok({
        level: 1,
        rectorReady: {
          isReady: false,
          statusLabel: 'In Progress',
          criteria: {
            hasServedHeadOrAssistantHead: false,
            hasServedTeamHead: false,
            hasGivenTwoOrMoreTalks: false,
            hasWorkedDining: false,
            hasServedAsRector: false,
          },
        },
        experience: [],
        totalWeekends: 0,
        totalDTTDWeekends: 0,
        records: [],
      })
    }

    const parseResult = z.array(UserExperienceSchema).safeParse(data)

    if (!parseResult.success) {
      return err(
        `Invalid experience data: ${parseResult.error.issues
          .map((e) => e.message)
          .join(', ')}`
      )
    }

    const records: UserExperience[] = parseResult.data

    const totalWeekends = countDistinctWeekends(records)
    const level = calculateExperienceLevel(totalWeekends)
    const rectorReady = calculateRectorReadyStatus(records)
    const groupedExperience = groupExperienceByCommunity(records)
    const totalDTTDWeekends = groupedExperience.filter(
      (g) => g.community === 'DTTD'
    ).length

    return ok({
      level,
      rectorReady,
      experience: records,
      totalWeekends,
      totalDTTDWeekends,
    })
  } catch (error) {
    return err(
      `Error while fetching user experience: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Upserts a single user experience entry (External)
 * @deprecated - move a version of this function to the master roster service and call that instead
 */
export async function upsertUserExperience(
  userId: string,
  entry: UserExperienceFormValue
): Promise<Result<string, void>> {
  try {
    const supabase = await createClient()

    if (isNil(entry.community) || isNil(entry.weekend_number)) {
      return err('Missing community or weekend number')
    }

    const weekend_reference = new WeekendReference(
      entry.community,
      parseInt(entry.weekend_number)
    )

    const payload = {
      user_id: userId,
      cha_role: entry.cha_role, // Enum string
      weekend_reference: weekend_reference.toString(),
      updated_at: new Date().toISOString(),
      // Ensure weekend_id is null for external
      weekend_id: null,
      ...(entry.id ? { id: entry.id } : {}),
    }

    const { error } = await supabase.from('users_experience').upsert([payload]) // Upsert on ID (primary key)

    if (error) {
      console.error('Error saving experience:', error)
      // Check for specific unique violation if constraint name differs
      return err(`Failed to save experience: ${error.message}`)
    }

    return ok(undefined)
  } catch (e) {
    console.error('Unexpected error saving experience:', e)
    return err('Unexpected error')
  }
}

/**
 * @deprecated - move a version of this function to the master roster service and call that instead
 */
export async function deleteUserExperience(
  experienceId: string
): Promise<Result<string, void>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('users_experience')
      .delete()
      .eq('id', experienceId)

    if (error) {
      console.error('Error deleting experience:', error)
      return err(`Failed to delete experience: ${error.message}`)
    }

    return ok(undefined)
  } catch (e) {
    console.error('Unexpected error deleting experience:', e)
    return err('Unexpected error')
  }
}
