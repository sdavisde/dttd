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
      return err(`Failed to fetch user experience: ${error.message}`)
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
      groupedExperience,
      totalWeekends,
      totalDTTDWeekends,
      records,
    })
  } catch (error) {
    return err(
      `Error while fetching user experience: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function getAllUsersServiceHistory(): Promise<
  Result<string, Map<string, UserServiceHistory>>
> {
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
        updated_at
      `
      )
      .order('served_date', { ascending: false })

    if (error) {
      return err(`Failed to fetch users experience: ${error.message}`)
    }

    if (isNil(data)) {
      return ok(new Map())
    }

    const parseResult = z.array(UserExperienceSchema).safeParse(data)

    if (!parseResult.success) {
      return err(
        `Invalid experience data: ${parseResult.error.issues.map((e) => e.message).join(', ')}`
      )
    }

    const records: UserExperience[] = parseResult.data

    // Group records by user_id
    const userRecordsMap = new Map<string, UserExperience[]>()
    for (const record of records) {
      const existing = userRecordsMap.get(record.user_id) ?? []
      existing.push(record)
      userRecordsMap.set(record.user_id, existing)
    }

    // Calculate service history for each user
    const resultMap = new Map<string, UserServiceHistory>()
    for (const [userId, userRecords] of userRecordsMap.entries()) {
      const totalWeekends = countDistinctWeekends(userRecords)
      const level = calculateExperienceLevel(totalWeekends)
      const rectorReady = calculateRectorReadyStatus(userRecords)
      const groupedExperience = groupExperienceByCommunity(userRecords)
      const totalDTTDWeekends = groupedExperience.filter(
        (g) => g.community === 'DTTD'
      ).length

      resultMap.set(userId, {
        level,
        rectorReady,
        groupedExperience,
        totalWeekends,
        totalDTTDWeekends,
      })
    }

    return ok(resultMap)
  } catch (error) {
    return err(
      `Error while fetching users experience: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Upserts a single user experience entry (External)
 */
export async function upsertUserExperience(
  userId: string,
  entry: {
    cha_role: string
    community_weekend: string
    date: string
    id?: string
  }
): Promise<Result<string, void>> {
  try {
    const supabase = await createClient()

    // Parse date from "YYYY-MM" to Date object (1st of month)
    // new Date('2023-12') usually works as UTC or local. Let's append '-01' to be safe for a date column
    const servedDate = new Date(`${entry.date}-01`).toISOString()

    const payload = {
      user_id: userId,
      cha_role: entry.cha_role, // Enum string
      external_community_weekend: entry.community_weekend,
      served_date: servedDate,
      updated_at: new Date().toISOString(),
      // Ensure weekend_id is null for external
      weekend_id: null,
      ...(entry.id ? { id: entry.id } : {}),
    }

    const { error } = await supabase.from('users_experience').upsert(payload) // Upsert on ID (primary key)

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
