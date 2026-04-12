import 'server-only'

import { randomUUID } from 'crypto'
import { isEmpty, isNil, sumBy } from 'lodash'
import type { Result } from '@/lib/results'
import { err, ok, isErr, map, unwrap, unwrapOr } from '@/lib/results'
import { Permission, userHasPermission } from '@/lib/security'
import type { User } from '@/lib/users/types'
import { getWeekendRosterExperienceDistribution } from '@/services/master-roster/master-roster-service'
import type { ExperienceDistribution } from '@/services/master-roster/types'
import { formatWeekendTitle, trimWeekendTypeFromTitle } from '@/lib/weekend'
import { COMMUNITY_NAME } from '@/lib/weekend/constants'
import { logger } from '@/lib/logger'
import type { Tables } from '@/database.types'
import type {
  Weekend,
  WeekendStatusValue,
  RawWeekendRecord,
  WeekendGroup,
  WeekendGroupWithId,
  WeekendWriteInput,
  WeekendUpdateInput,
  CreateWeekendGroupInput,
  UpdateWeekendGroupInput,
} from '@/lib/weekend/types'
import { WeekendType, WeekendStatus } from '@/lib/weekend/types'
import { WeekendReference } from '@/lib/weekend/weekend-reference'
import type {
  RawWeekendRoster,
  PaymentRecord,
  WeekendRosterMember,
  WeekendSidebarPayload,
  LeadershipTeamMember,
  LeadershipTeamData,
} from './types'
import * as PaymentService from '@/services/payment/payment-service'
import { getPaymentSummary } from '@/lib/payments/utils'
import type { PaymentTransactionRow } from '@/services/payment/types'
import { CHARole } from '@/lib/weekend/types'
import * as WeekendRepository from './repository'
import * as GroupMemberRepository from '@/services/weekend-group-member/repository'

// ============================================================================
// Helper Functions (Private)
// ============================================================================

/**
 * Transforms an array of weekends into a grouped object by type.
 */
function toWeekendGroup(weekends: Weekend[]): Result<string, WeekendGroup> {
  const mensWeekend = weekends.find(
    (weekend) => weekend.type === WeekendType.MENS
  )
  const womensWeekend = weekends.find(
    (weekend) => weekend.type === WeekendType.WOMENS
  )

  if (isNil(mensWeekend) || isNil(womensWeekend)) {
    return err('No active weekends found')
  }

  return ok({
    MENS: mensWeekend,
    WOMENS: womensWeekend,
  })
}

/**
 * Maps a raw weekend record to a typed weekend.
 * Requires the weekend_groups(number) join to populate number.
 */
function normalizeWeekend(weekend: RawWeekendRecord): Weekend {
  return {
    ...weekend,
    number: weekend.weekend_groups?.number ?? null,
    status: (weekend.status as WeekendStatus) ?? null,
    groupId: weekend.group_id ?? null,
  }
}

function normalizeWeekendGroupWithId(
  weekends: Array<Weekend>,
  groupId: string
): Result<string, WeekendGroupWithId> {
  return map(toWeekendGroup(weekends), (weekendGroup) => ({
    groupId,
    weekends: weekendGroup,
  }))
}

/**
 * Validates that required dates are present.
 */
function ensureRequiredDates(
  type: WeekendType,
  payload: WeekendWriteInput
): Result<string, void> {
  if (isEmpty(payload.start_date) || isEmpty(payload.end_date)) {
    return err(
      `${type} weekend requires both start_date and end_date before saving`
    )
  }
  return ok(undefined)
}

/**
 * Prepares the insert payload for a weekend record.
 */
function prepareInsertPayload(
  groupId: string,
  type: WeekendType,
  payload: WeekendWriteInput
) {
  return {
    group_id: groupId,
    type,
    start_date: payload.start_date,
    end_date: payload.end_date,
    status: payload.status ?? WeekendStatus.PLANNING,
    title: payload.title ?? null,
  }
}

/**
 * Resolves the next group number by auto-incrementing from the highest existing number.
 * Defaults to 1 if no groups exist yet.
 */
async function resolveNextGroupNumber(): Promise<Result<string, number>> {
  const maxResult = await WeekendRepository.findMaxWeekendGroupNumber()
  if (isErr(maxResult)) {
    return maxResult
  }
  return ok(maxResult.data + 1)
}

/**
 * Checks if an update payload has any defined values.
 */
function hasDefinedUpdateValues(payload: WeekendUpdateInput): boolean {
  return Object.values(payload).some((value) => !isNil(value))
}

/**
 * Formats a weekend label for display.
 */
function getWeekendLabel(weekend: Weekend | null): string {
  if (isNil(weekend)) {
    return 'Unknown Weekend'
  }
  return trimWeekendTypeFromTitle(formatWeekendTitle(weekend))
}

/**
 * Normalizes a raw weekend roster record into a WeekendRosterMember.
 */
function normalizeRosterMember(
  raw: RawWeekendRoster,
  baseFee: number,
  groupMemberId: string | null = null,
  medicalProfile: WeekendRosterMember['medical_profile'] = null
): WeekendRosterMember {
  const all_payments = raw.payments ?? []
  const total_paid = sumBy(all_payments, (p) => p.gross_amount)

  return {
    id: raw.id,
    cha_role: raw.cha_role,
    status: raw.status,
    weekend_id: raw.weekend_id,
    user_id: raw.user_id,
    created_at: raw.created_at,
    rollo: raw.rollo,
    special_needs: raw.special_needs,
    users: raw.users,
    groupMemberId,
    payment_info: all_payments[0] ?? null,
    total_paid,
    all_payments,
    paymentSummary: getPaymentSummary(all_payments, baseFee),
    forms_complete: raw.forms_complete,
    medical_profile: medicalProfile,
  }
}

// ============================================================================
// Service Functions (Exported)
// ============================================================================

/**
 * Fetches active weekends grouped by type.
 */
export async function getActiveWeekends(): Promise<
  Result<string, Record<WeekendType, Weekend>>
> {
  const result = await WeekendRepository.findActiveWeekends()

  if (isErr(result)) {
    return result
  }

  const data = result.data
  if (isEmpty(data)) {
    return err('No active weekends found')
  }

  const normalizedGroups = data.map(normalizeWeekend)
  return toWeekendGroup(normalizedGroups)
}

/**
 * Fetches a weekend group by its group ID.
 */
export async function getWeekendGroup(
  groupId: string
): Promise<Result<string, WeekendGroupWithId>> {
  if (groupId === '') {
    return err('group_id is required to fetch a group')
  }

  const result = await WeekendRepository.findWeekendsByGroupId(groupId)

  if (isErr(result)) {
    return result
  }

  const data = result.data
  if (isEmpty(data)) {
    return err(`Weekend group ${groupId} not found`)
  }

  const typedWeekends = data.map(normalizeWeekend)
  return normalizeWeekendGroupWithId(typedWeekends, groupId)
}

/**
 * Fetches all weekend groups, optionally filtered by statuses.
 */
export async function getWeekendGroupsByStatus(
  statuses?: WeekendStatusValue[]
): Promise<Result<string, WeekendGroupWithId[]>> {
  const result = await WeekendRepository.findWeekendsByStatuses(statuses)

  if (isErr(result)) {
    return result
  }

  const data = result.data
  if (isEmpty(data)) {
    return ok([])
  }

  // Group weekends by group_id
  const groups = new Map<string, Weekend[]>()

  for (const rawWeekend of data) {
    const weekend = normalizeWeekend(rawWeekend)

    if (isNil(weekend.groupId)) {
      continue
    }

    const existing = groups.get(weekend.groupId) ?? []
    existing.push(weekend)
    groups.set(weekend.groupId, existing)
  }

  // Transform and sort by weekend number
  const groupedWeekendResults = Array.from(groups.entries()).map(
    ([groupId, weekends]) => normalizeWeekendGroupWithId(weekends, groupId)
  )

  if (groupedWeekendResults.some(isErr)) {
    return err('Failed to transform weekend groups')
  }

  const groupedWeekends = groupedWeekendResults.map(unwrap)
  const sortedAndGroupedWeekends = groupedWeekends.sort((a, b) => {
    const aNumber =
      a.weekends.MENS?.number ??
      a.weekends.WOMENS?.number ??
      Number.MAX_SAFE_INTEGER
    const bNumber =
      b.weekends.MENS?.number ??
      b.weekends.WOMENS?.number ??
      Number.MAX_SAFE_INTEGER
    return aNumber - bNumber
  })

  return ok(sortedAndGroupedWeekends)
}

/**
 * Transitions a finished weekend group's roster into users_experience records.
 * Deduplicates across MENS/WOMENS weekends — same user+role = one record.
 * Creates separate records for additional_cha_role.
 * Idempotent: skips records that already exist.
 */
export async function transitionWeekendGroupToFinished(
  groupId: string
): Promise<Result<string, { created: number; skipped: number }>> {
  // 1. Fetch all active (non-dropped) roster members for this group
  const rosterResult =
    await WeekendRepository.findActiveRosterByGroupId(groupId)

  if (isErr(rosterResult)) {
    logger.error(
      { groupId, error: rosterResult.error },
      'Failed to fetch roster for experience transition'
    )
    return rosterResult
  }

  const rosterRecords = rosterResult.data
  if (isEmpty(rosterRecords)) {
    logger.info({ groupId }, 'No active roster members to transition')
    return ok({ created: 0, skipped: 0 })
  }

  // 2. Build experience records (primary + additional roles)
  type ExperienceRecord = {
    user_id: string
    cha_role: string
    weekend_id: string
    weekend_reference: string
    rollo: string | null
  }

  const experienceMap = new Map<string, ExperienceRecord>()

  for (const record of rosterRecords) {
    const groupNumber = record.group_number
    if (isNil(groupNumber)) {
      logger.warn(
        { groupId, user_id: record.user_id },
        'Skipping roster record with no group number'
      )
      continue
    }

    const weekendRef = new WeekendReference(
      COMMUNITY_NAME,
      groupNumber
    ).toString()

    // Primary role
    if (!isNil(record.cha_role)) {
      const key = `${record.user_id}::${record.cha_role}::${weekendRef}`
      const existing = experienceMap.get(key)

      if (isNil(existing)) {
        experienceMap.set(key, {
          user_id: record.user_id,
          cha_role: record.cha_role,
          weekend_id: record.weekend_id,
          weekend_reference: weekendRef,
          rollo: record.rollo,
        })
      } else if (isNil(existing.rollo) && !isNil(record.rollo)) {
        // Prefer the record that has a rollo
        existing.rollo = record.rollo
      }
    }

    // Additional role (separate experience record, no rollo)
    if (!isNil(record.additional_cha_role)) {
      const key = `${record.user_id}::${record.additional_cha_role}::${weekendRef}`
      if (!experienceMap.has(key)) {
        experienceMap.set(key, {
          user_id: record.user_id,
          cha_role: record.additional_cha_role,
          weekend_id: record.weekend_id,
          weekend_reference: weekendRef,
          rollo: null,
        })
      }
    }
  }

  const experienceRecords = Array.from(experienceMap.values())

  if (isEmpty(experienceRecords)) {
    logger.info({ groupId }, 'No valid experience records to create')
    return ok({ created: 0, skipped: 0 })
  }

  // 3. Check for existing experience records (idempotency guard)
  const weekendIdsResult =
    await WeekendRepository.findWeekendIdsByGroupId(groupId)

  if (isErr(weekendIdsResult)) {
    logger.error(
      { groupId, error: weekendIdsResult.error },
      'Failed to fetch weekend IDs for dedup check'
    )
    return weekendIdsResult
  }

  const existingResult =
    await WeekendRepository.findExistingExperienceForWeekends(
      weekendIdsResult.data
    )

  if (isErr(existingResult)) {
    logger.error(
      { groupId, error: existingResult.error },
      'Failed to fetch existing experience records'
    )
    return existingResult
  }

  const existingKeys = new Set(
    existingResult.data.map(
      (e) => `${e.user_id}::${e.cha_role}::${e.weekend_id}`
    )
  )

  // Filter out records that already exist
  // Check against all weekend IDs in the group (a record may reference either MENS or WOMENS weekend_id)
  const weekendIds = weekendIdsResult.data
  const newRecords = experienceRecords.filter((c) => {
    return !weekendIds.some((wid) =>
      existingKeys.has(`${c.user_id}::${c.cha_role}::${wid}`)
    )
  })

  const skipped = experienceRecords.length - newRecords.length

  if (isEmpty(newRecords)) {
    logger.info(
      { groupId, skipped },
      'All experience records already exist — nothing to insert'
    )
    return ok({ created: 0, skipped })
  }

  // 4. Bulk insert
  const insertResult =
    await WeekendRepository.insertUserExperienceRecords(newRecords)

  if (isErr(insertResult)) {
    logger.error(
      { groupId, error: insertResult.error, recordCount: newRecords.length },
      'Failed to insert experience records'
    )
    return insertResult
  }

  logger.info(
    {
      groupId,
      created: insertResult.data,
      skipped,
      totalRosterMembers: rosterRecords.length,
    },
    'Experience transition completed'
  )

  return ok({ created: insertResult.data, skipped })
}

/**
 * Sets a weekend group as active, marking the previous active group as finished.
 * When finishing a previous group, automatically creates users_experience records
 * for all non-dropped roster members.
 */
export async function setActiveWeekendGroup(
  groupId: string
): Promise<Result<string, WeekendGroupWithId>> {
  if (groupId === '') {
    return err('group_id is required to set active weekend')
  }

  // 1. Find the currently active group ID before we finish it
  const activeGroupResult = await WeekendRepository.findActiveGroupId()
  const previousGroupId = unwrapOr(activeGroupResult, null)

  // 2. Find all currently ACTIVE weekends and update them to FINISHED
  const finishResult =
    await WeekendRepository.updateWeekendStatusByCurrentStatus(
      WeekendStatus.ACTIVE,
      WeekendStatus.FINISHED
    )

  if (isErr(finishResult)) {
    return err(
      `Failed to mark previous active weekends as finished: ${finishResult.error}`
    )
  }

  // 3. Transition the finished group's roster to experience records
  if (!isNil(previousGroupId)) {
    const transitionResult =
      await transitionWeekendGroupToFinished(previousGroupId)

    if (isErr(transitionResult)) {
      // Log but don't block — the status change already happened
      logger.error(
        { previousGroupId, error: transitionResult.error },
        'Experience transition failed for finished weekend group'
      )
    } else {
      logger.info(
        {
          previousGroupId,
          created: transitionResult.data.created,
          skipped: transitionResult.data.skipped,
        },
        'Experience records created for finished weekend group'
      )
    }
  }

  // 4. Update the selected weekend group to ACTIVE
  const activateResult = await WeekendRepository.updateWeekendStatusByGroupId(
    groupId,
    WeekendStatus.ACTIVE
  )

  if (isErr(activateResult)) {
    return err(`Failed to set weekend group as active: ${activateResult.error}`)
  }

  // 5. Return the updated group
  return getWeekendGroup(groupId)
}

/**
 * Creates a new weekend group with MENS and WOMENS weekends.
 */
export async function createWeekendGroup(
  input: CreateWeekendGroupInput
): Promise<Result<string, WeekendGroupWithId>> {
  if (isNil(input.groupId)) {
    return err('groupId is required when creating a weekend group')
  }

  // Validate both weekends have required dates
  const mensValidation = ensureRequiredDates(WeekendType.MENS, input.mens)
  if (isErr(mensValidation)) {
    return err(mensValidation.error)
  }

  const womensValidation = ensureRequiredDates(WeekendType.WOMENS, input.womens)
  if (isErr(womensValidation)) {
    return err(womensValidation.error)
  }

  // Determine group number by auto-incrementing
  const groupNumber = await resolveNextGroupNumber()
  if (isErr(groupNumber)) {
    return groupNumber
  }

  // Auto-generate titles if not provided
  const groupTitle = new WeekendReference(
    COMMUNITY_NAME,
    groupNumber.data
  ).toString()
  const mensInput = {
    ...input.mens,
    title: input.mens.title ?? `Mens ${groupTitle}`,
  }
  const womensInput = {
    ...input.womens,
    title: input.womens.title ?? `Womens ${groupTitle}`,
  }

  // Create the weekend_groups parent record first (FK dependency)
  const groupResult = await WeekendRepository.insertWeekendGroupRecord(
    input.groupId,
    groupNumber.data
  )
  if (isErr(groupResult)) {
    return groupResult
  }

  // Prepare and insert payloads
  const insertPayload = [
    prepareInsertPayload(input.groupId, WeekendType.MENS, mensInput),
    prepareInsertPayload(input.groupId, WeekendType.WOMENS, womensInput),
  ]

  const result = await WeekendRepository.insertWeekendGroup(insertPayload)

  if (isErr(result)) {
    return result
  }

  const data = result.data
  if (isEmpty(data)) {
    return err('Failed to create weekend group')
  }

  return normalizeWeekendGroupWithId(data.map(normalizeWeekend), input.groupId)
}

/**
 * Updates an existing weekend group.
 */
export async function updateWeekendGroup(
  groupId: string,
  updates: UpdateWeekendGroupInput
): Promise<Result<string, WeekendGroupWithId>> {
  if (isNil(groupId)) {
    return err('group_id is required to update a group')
  }

  if (isNil(updates.mens) && isNil(updates.womens)) {
    return err('No updates were provided for either mens or womens weekend')
  }

  // Apply updates to each weekend type if provided
  const applyUpdate = async (
    type: WeekendType,
    payload?: WeekendUpdateInput
  ): Promise<Result<string, Weekend | null>> => {
    if (isNil(payload)) {
      return ok(null)
    }

    if (!hasDefinedUpdateValues(payload)) {
      return ok(null)
    }

    const result = await WeekendRepository.updateWeekendByGroupAndType(
      groupId,
      type,
      payload
    )

    if (isErr(result)) {
      return result
    }

    if (isNil(result.data)) {
      return err(`Failed to update ${type} weekend`)
    }

    return ok(normalizeWeekend(result.data))
  }

  const mensResult = await applyUpdate(WeekendType.MENS, updates.mens)
  if (isErr(mensResult)) {
    return err(mensResult.error)
  }

  const womensResult = await applyUpdate(WeekendType.WOMENS, updates.womens)
  if (isErr(womensResult)) {
    return err(womensResult.error)
  }

  // Return the full updated group
  return getWeekendGroup(groupId)
}

/**
 * Deletes a weekend group.
 */
export async function deleteWeekendGroup(
  groupId: string
): Promise<Result<string, { success: boolean }>> {
  if (groupId === '') {
    return err('group_id is required to delete a group')
  }

  const result = await WeekendRepository.deleteWeekendsByGroupId(groupId)

  if (isErr(result)) {
    return result
  }

  return ok({ success: true })
}

/**
 * Saves a weekend group from the sidebar UI (creates or updates).
 */
export async function saveWeekendGroupFromSidebar(
  payload: WeekendSidebarPayload
): Promise<Result<string, WeekendGroupWithId>> {
  // If no groupId, create a new group (title auto-generated from group number)
  if (isNil(payload.groupId)) {
    const groupId = randomUUID()
    return createWeekendGroup({
      groupId,
      mens: {
        start_date: payload.mensStart,
        end_date: payload.mensEnd,
      },
      womens: {
        start_date: payload.womensStart,
        end_date: payload.womensEnd,
      },
    })
  }

  // Otherwise, update existing group (dates only)
  return updateWeekendGroup(payload.groupId, {
    mens: {
      start_date: payload.mensStart,
      end_date: payload.mensEnd,
    },
    womens: {
      start_date: payload.womensStart,
      end_date: payload.womensEnd,
    },
  })
}

/**
 * Fetches a single weekend by ID.
 */
export async function getWeekendById(
  weekendId: string
): Promise<Result<string, Weekend>> {
  const result = await WeekendRepository.findWeekendById(weekendId)

  if (isErr(result)) {
    return result
  }

  if (isNil(result.data)) {
    return err('Weekend not found')
  }

  return ok(normalizeWeekend(result.data))
}

/**
 * Fetches the roster for a weekend with normalized data.
 * Payments are fetched from the payment_transaction table.
 */
export async function getWeekendRoster(
  weekendId: string
): Promise<Result<string, Array<WeekendRosterMember>>> {
  const result =
    await WeekendRepository.findWeekendRosterIncludingDropped(weekendId)

  if (isErr(result)) {
    return result
  }

  if (isNil(result.data)) {
    return err('No roster found for weekend')
  }

  const rosterRecords = result.data

  // Resolve group member IDs for all roster records, then fetch payments and forms_complete
  const groupMemberResults = await Promise.all(
    rosterRecords.map(async (record) => {
      const memberResult = await GroupMemberRepository.getGroupMemberByRosterId(
        record.id
      )
      return {
        rosterId: record.id,
        groupMemberId: unwrapOr(memberResult, null)?.id ?? null,
      }
    })
  )

  const groupMemberMap = new Map<string, string | null>()
  for (const { rosterId, groupMemberId } of groupMemberResults) {
    groupMemberMap.set(rosterId, groupMemberId)
  }

  // Fetch payments, forms_complete, medical profiles, and team fee in parallel
  const [
    paymentsByRoster,
    formsCompleteByRoster,
    medicalProfilesByRoster,
    teamFeeResult,
  ] = await Promise.all([
    Promise.all(
      rosterRecords.map(async (record) => {
        const groupMemberId = groupMemberMap.get(record.id) ?? null
        if (isNil(groupMemberId)) {
          return { rosterId: record.id, payments: [] }
        }
        const paymentsResult = await PaymentService.getPaymentForTarget(
          'weekend_group_member',
          groupMemberId
        )
        return {
          rosterId: record.id,
          payments: unwrapOr(paymentsResult, []),
        }
      })
    ),
    Promise.all(
      rosterRecords.map(async (record) => {
        const groupMemberId = groupMemberMap.get(record.id) ?? null
        if (isNil(groupMemberId)) {
          return { rosterId: record.id, forms_complete: false }
        }
        const completionsResult =
          await GroupMemberRepository.getFormCompletions(groupMemberId)
        if (isErr(completionsResult)) {
          return { rosterId: record.id, forms_complete: false }
        }
        return {
          rosterId: record.id,
          forms_complete: completionsResult.data.length >= 5,
        }
      })
    ),
    Promise.all(
      rosterRecords.map(async (record) => {
        if (isNil(record.user_id)) {
          return { rosterId: record.id, medicalProfile: null }
        }
        const profileResult = await GroupMemberRepository.getUserMedicalProfile(
          record.user_id
        )
        if (isErr(profileResult) || isNil(profileResult.data)) {
          return { rosterId: record.id, medicalProfile: null }
        }
        const profile = profileResult.data
        return {
          rosterId: record.id,
          medicalProfile: {
            emergency_contact_name: profile.emergency_contact_name,
            emergency_contact_phone: profile.emergency_contact_phone,
            medical_conditions: profile.medical_conditions,
          },
        }
      })
    ),
    PaymentService.getTeamFee(),
  ])

  // Stripe fee in dollars (unitAmount is in cents)
  const baseFee =
    !isErr(teamFeeResult) && !isNil(teamFeeResult.data.unitAmount)
      ? teamFeeResult.data.unitAmount / 100
      : 0

  // Build lookup maps
  const paymentsMap = new Map<string, PaymentRecord[]>()
  for (const { rosterId, payments } of paymentsByRoster) {
    paymentsMap.set(rosterId, payments)
  }

  const formsCompleteMap = new Map<string, boolean>()
  for (const { rosterId, forms_complete } of formsCompleteByRoster) {
    formsCompleteMap.set(rosterId, forms_complete)
  }

  const medicalProfileMap = new Map<
    string,
    WeekendRosterMember['medical_profile']
  >()
  for (const { rosterId, medicalProfile } of medicalProfilesByRoster) {
    medicalProfileMap.set(rosterId, medicalProfile)
  }

  // Combine roster records with their payments, forms_complete, and groupMemberId
  const rawRosterWithPayments: RawWeekendRoster[] = rosterRecords.map(
    (record) => ({
      ...record,
      payments: paymentsMap.get(record.id) ?? [],
      forms_complete: formsCompleteMap.get(record.id) ?? false,
    })
  )

  const normalizedRoster = rawRosterWithPayments.map((record) =>
    normalizeRosterMember(
      record,
      baseFee,
      groupMemberMap.get(record.id) ?? null,
      medicalProfileMap.get(record.id) ?? null
    )
  )
  return ok(normalizedRoster)
}

/**
 * Fetches all users.
 */
export async function getAllUsers(): Promise<
  Result<string, Array<Tables<'users'>>>
> {
  const result = await WeekendRepository.findAllUsers()

  if (isErr(result)) {
    return result
  }

  if (isEmpty(result.data)) {
    return err('No users found')
  }

  return ok(result.data)
}

/**
 * Adds a user to a weekend roster.
 * Also upserts a weekend_group_members row so the user can complete forms and pay.
 */
export async function addUserToWeekendRoster(
  weekendId: string,
  userId: string,
  role: string,
  rollo?: string
): Promise<Result<string, void>> {
  // Step 1: Ensure a weekend_group_members row exists (needed for FK on roster)
  const weekendResult = await WeekendRepository.findWeekendById(weekendId)
  if (isErr(weekendResult) || isNil(weekendResult.data?.group_id)) {
    return err('Weekend or group_id not found')
  }

  const groupMemberResult = await GroupMemberRepository.upsertGroupMember(
    weekendResult.data.group_id,
    userId
  )
  if (isErr(groupMemberResult)) {
    return groupMemberResult
  }

  // Step 2: Create the roster row linked to the group member
  const rosterResult = await WeekendRepository.insertWeekendRosterMember({
    weekend_id: weekendId,
    user_id: userId,
    group_member_id: groupMemberResult.data,
    status: 'awaiting_payment',
    cha_role: role,
    rollo: rollo ?? null,
  })

  if (isErr(rosterResult)) {
    return rosterResult
  }

  return ok(undefined)
}

/**
 * Fetches a weekend roster record for payment flow.
 * Uses admin client to bypass RLS - required for webhook flows.
 */
export async function getWeekendRosterRecord(
  teamUserId: string | null,
  weekendId: string | null
): Promise<Result<string, Tables<'weekend_roster'>>> {
  if (isNil(teamUserId) || isNil(weekendId)) {
    return err('Team user ID or weekend ID is null')
  }

  const result = await WeekendRepository.findWeekendRosterRecord(
    teamUserId,
    weekendId
  )

  if (isErr(result)) {
    return result
  }

  if (isNil(result.data)) {
    return err('Weekend roster record not found')
  }

  if (result.data.status === 'paid') {
    return err('Weekend roster record is already in status "paid"')
  }

  return ok(result.data)
}

/**
 * Records a manual (cash/check) payment for a weekend group member.
 * Creates a record in the payment_transaction table targeting weekend_group_member.
 */
export async function recordManualPayment(
  groupMemberId: string,
  paymentAmount: number,
  paymentMethod: 'cash' | 'check',
  paymentOwner: string,
  notes?: string
): Promise<Result<string, PaymentTransactionRow>> {
  // Generate a manual payment intent ID
  const paymentIntentId = `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`

  // Record payment in the payment_transaction table
  const result = await PaymentService.recordPayment({
    type: 'fee',
    target_type: 'weekend_group_member',
    target_id: groupMemberId,
    weekend_id: null,
    payment_intent_id: paymentIntentId,
    gross_amount: paymentAmount,
    payment_method: paymentMethod,
    payment_owner: paymentOwner,
    notes: notes ?? null,
  })

  if (isErr(result)) {
    return err(`Failed to record payment: ${result.error}`)
  }

  logger.info(
    `Manual payment recorded: ${paymentMethod} payment of $${paymentAmount} for group member ID ${groupMemberId}`
  )

  return ok(result.data)
}

/**
 * Fetches the special_needs field for a roster record.
 */
export async function getRosterSpecialNeeds(
  rosterId: string
): Promise<Result<string, string | null>> {
  return WeekendRepository.findRosterSpecialNeeds(rosterId)
}

/**
 * Fetches weekend group options for dropdowns/selectors.
 * Returns group IDs — suitable for filtering (e.g. candidate lists)
 * where gender is selected separately.
 */
export async function getWeekendOptions(): Promise<
  Result<string, Array<{ id: string; label: string }>>
> {
  const groupsResult = await getWeekendGroupsByStatus()
  if (isErr(groupsResult)) return err(groupsResult.error)

  const options = groupsResult.data.flatMap((group) => {
    // Use group ID (not individual weekend ID) since gender is selected separately
    const weekend = group.weekends.MENS ?? group.weekends.WOMENS
    if (isNil(weekend) || isNil(group.groupId)) return []

    const label = getWeekendLabel(weekend)
    return [{ id: group.groupId, label }]
  })

  // Return reversed (newest first)
  return ok(options.reverse())
}

// ============================================================================
// Composite Data Functions (for Server Components)
// ============================================================================

export type WeekendRosterViewData = {
  weekend: Weekend
  roster: WeekendRosterMember[]
  experienceDistribution: ExperienceDistribution | null
  availableUsers: Tables<'users'>[]
}

/**
 * Fetches all data required for the WeekendRosterView component.
 * Performs permission-based conditional fetching to minimize unnecessary queries.
 *
 * @param weekendId - The ID of the weekend to load data for
 * @param user - The logged-in user (for permission checks)
 * @returns All data needed to render the weekend roster view
 */
export async function getWeekendRosterViewData(
  weekendId: string,
  user: User
): Promise<Result<string, WeekendRosterViewData>> {
  const canEditRoster = userHasPermission(user, [Permission.WRITE_TEAM_ROSTER])
  const canViewExperienceDistribution = userHasPermission(user, [
    Permission.READ_USER_EXPERIENCE,
  ])

  const [weekendResult, rosterResult, usersResult, experienceResult] =
    await Promise.all([
      getWeekendById(weekendId),
      getWeekendRoster(weekendId),
      canEditRoster ? getAllUsers() : Promise.resolve(ok([])),
      canViewExperienceDistribution
        ? getWeekendRosterExperienceDistribution(weekendId)
        : Promise.resolve(ok(null)),
    ])

  if (isErr(weekendResult)) {
    return weekendResult
  }

  if (isErr(rosterResult)) {
    return rosterResult
  }

  const weekend = weekendResult.data
  const roster = rosterResult.data
  const users = unwrapOr(usersResult, [])
  const experienceDistribution = unwrapOr(experienceResult, null)

  // Filter users to only those not already on the roster
  const rosterUserIds = new Set(
    roster.map((r) => r.user_id).filter((id) => !isNil(id))
  )
  const availableUsers = users.filter((u) => !rosterUserIds.has(u.id))

  return ok({
    weekend,
    roster,
    experienceDistribution,
    availableUsers,
  })
}

// ============================================================================
// Leadership Team Functions
// ============================================================================

/**
 * Leadership roles that should appear in the leadership preview.
 * Order determines display priority (Rector first, then Head, etc.)
 */
const LEADERSHIP_ROLES = [
  CHARole.RECTOR,
  CHARole.HEAD,
  CHARole.ASSISTANT_HEAD,
  CHARole.BACKUP_RECTOR,
]

/**
 * Sorts leadership members by their role position in LEADERSHIP_ROLES.
 */
function sortByLeadershipRole(
  members: LeadershipTeamMember[]
): LeadershipTeamMember[] {
  return [...members].sort((a, b) => {
    const aIndex = LEADERSHIP_ROLES.indexOf(a.chaRole as CHARole)
    const bIndex = LEADERSHIP_ROLES.indexOf(b.chaRole as CHARole)
    // Roles not in the list go to the end
    const aPos = aIndex === -1 ? LEADERSHIP_ROLES.length : aIndex
    const bPos = bIndex === -1 ? LEADERSHIP_ROLES.length : bIndex
    return aPos - bPos
  })
}

/**
 * Transforms a raw leadership roster member into a LeadershipTeamMember.
 */
function normalizeLeadershipMember(
  member: WeekendRepository.RawLeadershipRosterMember
): LeadershipTeamMember | null {
  if (isNil(member.users) || isNil(member.cha_role)) {
    return null
  }

  const fullNameRaw =
    `${member.users.first_name ?? ''} ${member.users.last_name ?? ''}`.trim()
  const fullName = fullNameRaw !== '' ? fullNameRaw : 'Unknown'

  return {
    id: member.id,
    fullName,
    chaRole: member.cha_role,
  }
}

/**
 * Fetches leadership team members from active weekends.
 * Men leaders come from the active MENS weekend, women leaders from WOMENS weekend.
 */
export async function getActiveWeekendLeadershipTeam(): Promise<
  Result<string, LeadershipTeamData>
> {
  const result =
    await WeekendRepository.findActiveWeekendLeadershipRoster(LEADERSHIP_ROLES)

  if (isErr(result)) {
    return result
  }

  const { mensLeadership, womensLeadership } = result.data

  const menLeaders = sortByLeadershipRole(
    mensLeadership.map(normalizeLeadershipMember).filter((m) => !isNil(m))
  )

  const womenLeaders = sortByLeadershipRole(
    womensLeadership.map(normalizeLeadershipMember).filter((m) => !isNil(m))
  )

  return ok({
    menLeaders,
    womenLeaders,
  })
}
