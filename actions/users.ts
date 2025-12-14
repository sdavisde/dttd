'use server'

import { createClient } from '@/lib/supabase/server'
import { Result, err, ok } from '@/lib/results'
import { User } from '@/lib/users/types'
import { logger } from '@/lib/logger'
import { genderMatchesWeekend } from '@/lib/weekend'
import { Address, addressSchema } from '@/lib/users/validation'
import { BasicInfo, BasicInfoSchema } from '@/components/team-forms/schemas'
import { WeekendReference } from '@/lib/weekend/weekend-reference'

export async function getUsers(): Promise<Result<string, Array<User>>> {
  try {
    const supabase = await createClient()

    // Single query: users + roles + weekend roster (joined to active weekend)
    const { data, error } = await supabase.from('users').select(
      `
        id,
        first_name,
        last_name,
        gender,
        email,
        phone_number,
        address,
        church_affiliation,
        weekend_attended,
        essentials_training_date,
        special_gifts_and_skills,
        user_roles:user_roles (
          roles (
            id,
            label,
            permissions
          )
        ),
        weekend_roster:weekend_roster!user_id(
          id, user_id, weekend_id, cha_role, status, weekends(type, status)
        )
      `
    )

    if (error) {
      return err(`Failed to fetch users: ${error.message}`)
    }

    if (!data) {
      return ok([])
    }

    const users: User[] = data
      .map((u) => {
        if (!u.email) {
          logger.error({ userId: u.id }, `User has no email`)
          return null
        }

        // Handle role (pick the first one if multiple)
        const roleRow = u.user_roles?.[0]?.roles ?? null
        const role = roleRow
          ? {
              id: roleRow.id,
              label: roleRow.label,
              permissions: roleRow.permissions ?? [],
            }
          : null

        // team_member_info: find roster record for active weekend & matching gender
        const rosterRecord = (u.weekend_roster ?? []).find((wr) => {
          if (!wr.weekends) return false
          const wk = wr.weekends
          return (
            wk.status === 'ACTIVE' && genderMatchesWeekend(u.gender, wk.type)
          )
        })

        // Normalize address
        const addressResult = addressSchema.safeParse(u.address)
        const address = addressResult.success ? addressResult.data : null

        return {
          id: u.id,
          firstName: u.first_name,
          lastName: u.last_name,
          gender: u.gender,
          email: u.email,
          phoneNumber: u.phone_number,
          address,
          role,
          communityInformation: {
            churchAffiliation: u.church_affiliation,
            weekendAttended: u.weekend_attended,
            essentialsTrainingDate: u.essentials_training_date,
            specialGiftsAndSkills: u.special_gifts_and_skills,
          },
          teamMemberInfo: rosterRecord ?? null,
        }
      })
      .filter((it) => it !== null)

    return ok(users)
  } catch (error) {
    return err(
      `Error while fetching users: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * PATCH's a users address
 * @param userId
 * @param address
 * @returns
 */
export async function updateUserAddress(
  userId: string,
  address: Address
): Promise<Result<string, void>> {
  try {
    // Validate input
    const validation = addressSchema.safeParse(address)
    if (!validation.success) {
      return err(`Invalid address: ${validation.error.message}`)
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('users')
      .update({ address: address })
      .eq('id', userId)

    if (error) {
      console.error('Error updating address:', error)
      return err(`Failed to update address: ${error.message}`)
    }

    return ok(undefined)
  } catch (error) {
    console.error('Unexpected error updating address:', error)
    return err(
      `Error updating address: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function deleteUser(
  userId: string
): Promise<Result<string, boolean>> {
  try {
    const supabase = await createClient()

    // Delete related records first (foreign key constraints)
    // Delete user roles
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (roleError) {
      return err(`Failed to delete user roles: ${roleError.message}`)
    }

    // Delete weekend roster entries
    const { error: rosterError } = await supabase
      .from('weekend_roster')
      .delete()
      .eq('user_id', userId)

    if (rosterError) {
      return err(
        `Failed to delete weekend roster entries: ${rosterError.message}`
      )
    }

    // Finally delete the user
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (userError) {
      return err(`Failed to delete user: ${userError.message}`)
    }

    return ok(true)
  } catch (error) {
    return err(
      `Error while deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function assignUserRole(
  userId: string,
  roleId: string
): Promise<Result<string, true>> {
  try {
    const supabase = await createClient()

    // Remove any existing role first (one role per user business logic)
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      return err(`Failed to remove existing user role: ${deleteError.message}`)
    }

    // Insert the new role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId })

    if (insertError) {
      return err(`Failed to assign user role: ${insertError.message}`)
    }

    return ok(true)
  } catch (error) {
    return err(
      `Error while assigning user role: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function removeUserRole(
  userId: string
): Promise<Result<string, true>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (error) {
      return err(`Failed to remove user role: ${error.message}`)
    }

    return ok(true)
  } catch (error) {
    return err(
      `Error while removing user role: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * PATCH's a users basic info (church, past weekend, essentials date)
 * @param userId
 * @param data
 * @returns
 */
export async function updateUserBasicInfo(
  userId: string,
  data: BasicInfo
): Promise<Result<string, void>> {
  try {
    // Validate input
    const validation = BasicInfoSchema.safeParse(data)

    if (!validation.success) {
      return err(validation.error.message)
    }

    const supabase = await createClient()

    const weekendAttendedStr = new WeekendReference(
      data.weekend_attended.community,
      parseInt(data.weekend_attended.weekend_number)
    ).toString()

    const { error } = await supabase
      .from('users')
      .update({
        church_affiliation: data.church_affiliation,
        weekend_attended: weekendAttendedStr,
        essentials_training_date: data.essentials_training_date
          ? data.essentials_training_date.toISOString()
          : null,
        special_gifts_and_skills: data.special_gifts_and_skills ?? null,
      })
      .eq('id', userId)

    if (error) {
      logger.error({ error, userId }, 'Error updating user basic info')
      return err(error.message)
    }

    return ok(undefined)
  } catch (error) {
    logger.error({ error, userId }, 'Unexpected error updating basic info')
    return err('An unexpected error occurred')
  }
}
