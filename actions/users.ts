'use server'

import { createClient } from '@/lib/supabase/server'
import { Result, err, ok } from '@/lib/results'
import { User } from '@/lib/users/types'
import { logger } from '@/lib/logger'
import { genderMatchesWeekend } from '@/lib/weekend'

export async function getUsers(): Promise<Result<Error, Array<User>>> {
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
      return err(new Error(`Failed to fetch users: ${error.message}`))
    }

    if (!data) {
      return ok([])
    }

    const users: User[] = data
      .map((u) => {
        if (!u.email) {
          logger.error('User has no email', { userId: u.id })
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

        return {
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          gender: u.gender,
          email: u.email,
          phone_number: u.phone_number,
          role,
          team_member_info: rosterRecord ?? null,
        }
      })
      .filter((it) => it !== null)

    return ok(users)
  } catch (error) {
    return err(
      new Error(
        `Error while fetching users: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

export async function getLoggedInUser(): Promise<Result<Error, User>> {
  try {
    const supabase = await createClient()

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return err(new Error('User not found'))
    }

    // Single query: users + roles + weekend roster (joined to active weekend)
    const { data: user, error } = await supabase
      .from('users')
      .select(
        `
          id,
          first_name,
          last_name,
          gender,
          email,
          phone_number,
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
      .eq('id', authUser.id)
      .single()

    if (error) {
      return err(new Error(`Failed to fetch users: ${error.message}`))
    }

    if (!user) {
      return err(new Error('User not found'))
    }

    if (!user.email) {
      logger.error('User has no email', { userId: authUser.id })
      return err(new Error('User has no email'))
    }

    // Handle role (pick the first one if multiple)
    const roleRow = user.user_roles?.[0]?.roles ?? null
    const role = roleRow
      ? {
          id: roleRow.id,
          label: roleRow.label,
          permissions: roleRow.permissions ?? [],
        }
      : null

    // team_member_info: find roster record for active weekend & matching gender
    const rosterRecord = (user.weekend_roster ?? []).find((wr) => {
      if (!wr.weekends) return false
      const wk = wr.weekends
      return (
        wk.status === 'ACTIVE' && genderMatchesWeekend(user.gender, wk.type)
      )
    })

    return ok({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      gender: user.gender,
      email: user.email,
      phone_number: user.phone_number,
      role,
      team_member_info: rosterRecord ?? null,
    })
  } catch (error) {
    return err(
      new Error(
        `Error while fetching users: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

export async function deleteUser(
  userId: string
): Promise<Result<Error, boolean>> {
  try {
    const supabase = await createClient()

    // Delete related records first (foreign key constraints)
    // Delete user roles
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (roleError) {
      return err(new Error(`Failed to delete user roles: ${roleError.message}`))
    }

    // Delete weekend roster entries
    const { error: rosterError } = await supabase
      .from('weekend_roster')
      .delete()
      .eq('user_id', userId)

    if (rosterError) {
      return err(
        new Error(
          `Failed to delete weekend roster entries: ${rosterError.message}`
        )
      )
    }

    // Finally delete the user
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (userError) {
      return err(new Error(`Failed to delete user: ${userError.message}`))
    }

    return ok(true)
  } catch (error) {
    return err(
      new Error(
        `Error while deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

export async function assignUserRole(
  userId: string,
  roleId: string
): Promise<Result<Error, true>> {
  try {
    const supabase = await createClient()

    // Remove any existing role first (one role per user business logic)
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      return err(
        new Error(`Failed to remove existing user role: ${deleteError.message}`)
      )
    }

    // Insert the new role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId })

    if (insertError) {
      return err(
        new Error(`Failed to assign user role: ${insertError.message}`)
      )
    }

    return ok(true)
  } catch (error) {
    return err(
      new Error(
        `Error while assigning user role: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}

export async function removeUserRole(
  userId: string
): Promise<Result<Error, true>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (error) {
      return err(new Error(`Failed to remove user role: ${error.message}`))
    }

    return ok(true)
  } catch (error) {
    return err(
      new Error(
        `Error while removing user role: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    )
  }
}
