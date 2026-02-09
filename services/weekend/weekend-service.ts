import 'server-only'

import { randomUUID } from 'crypto'
import { isEmpty, isNil, sumBy } from 'lodash'
import { Result, err, ok, isErr, map, unwrap, unwrapOr } from '@/lib/results'
import { Permission, userHasPermission } from '@/lib/security'
import { User } from '@/lib/users/types'
import { getWeekendRosterExperienceDistribution } from '@/services/master-roster/master-roster-service'
import { ExperienceDistribution } from '@/services/master-roster/types'
import { formatWeekendTitle, trimWeekendTypeFromTitle } from '@/lib/weekend'
import { logger } from '@/lib/logger'
import { Tables } from '@/database.types'
import {
  Weekend,
  WeekendType,
  WeekendStatus,
  WeekendStatusValue,
  RawWeekendRecord,
  WeekendGroup,
  WeekendGroupWithId,
  WeekendWriteInput,
  WeekendUpdateInput,
  CreateWeekendGroupInput,
  UpdateWeekendGroupInput,
} from '@/lib/weekend/types'
import {
  RawWeekendRoster,
  PaymentRecord,
  WeekendRosterMember,
  WeekendSidebarPayload,
  LeadershipTeamMember,
  LeadershipTeamData,
} from './types'
import * as PaymentService from '@/services/payment/payment-service'
import type { PaymentTransactionRow } from '@/services/payment/types'
import { CHARole } from '@/lib/weekend/types'
import * as WeekendRepository from './repository'

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
 */
function normalizeWeekend(weekend: RawWeekendRecord): Weekend {
  return {
    ...weekend,
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
    number: payload.number ?? null,
    status: payload.status ?? WeekendStatus.PLANNING,
    title: payload.title ?? null,
  }
}

/**
 * Normalizes the sidebar title by trimming whitespace.
 */
function normalizeSidebarTitle(title?: string | null): string | null {
  if (isNil(title)) {
    return null
  }
  const trimmed = title.trim()
  return isEmpty(trimmed) ? null : trimmed
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
function normalizeRosterMember(raw: RawWeekendRoster): WeekendRosterMember {
  const all_payments = raw.payments ?? []
  const total_paid = sumBy(all_payments, (p) => p.gross_amount)

  // Check if all 5 team forms have been completed
  const forms_complete =
    !isNil(raw.completed_statement_of_belief_at) &&
    !isNil(raw.completed_commitment_form_at) &&
    !isNil(raw.completed_release_of_claim_at) &&
    !isNil(raw.completed_camp_waiver_at) &&
    !isNil(raw.completed_info_sheet_at)

  return {
    id: raw.id,
    cha_role: raw.cha_role,
    status: raw.status,
    weekend_id: raw.weekend_id,
    user_id: raw.user_id,
    created_at: raw.created_at,
    rollo: raw.rollo,
    users: raw.users,
    payment_info: all_payments[0] ?? null,
    total_paid,
    all_payments,
    forms_complete,
    emergency_contact_name: raw.emergency_contact_name,
    emergency_contact_phone: raw.emergency_contact_phone,
    medical_conditions: filterMedicalConditions(raw.medical_conditions),
  }
}

function filterMedicalConditions(
  medical_conditions: string | null
): string | null {
  const NONE_SYNONYM_REGEX = /^\s*(?:no|none|n\/a|na)\s*$/i
  if (
    isNil(medical_conditions) ||
    NONE_SYNONYM_REGEX.test(medical_conditions)
  ) {
    return null
  }
  return medical_conditions
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
  if (!groupId) {
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
 * Sets a weekend group as active, marking the previous active group as finished.
 */
export async function setActiveWeekendGroup(
  groupId: string
): Promise<Result<string, WeekendGroupWithId>> {
  if (!groupId) {
    return err('group_id is required to set active weekend')
  }

  // 1. Find all currently ACTIVE weekends and update them to FINISHED
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

  // 2. Update the selected weekend group to ACTIVE
  const activateResult = await WeekendRepository.updateWeekendStatusByGroupId(
    groupId,
    WeekendStatus.ACTIVE
  )

  if (isErr(activateResult)) {
    return err(`Failed to set weekend group as active: ${activateResult.error}`)
  }

  // 3. Return the updated group
  return getWeekendGroup(groupId)
}

/**
 * Creates a new weekend group with MENS and WOMENS weekends.
 */
export async function createWeekendGroup(
  input: CreateWeekendGroupInput
): Promise<Result<string, WeekendGroupWithId>> {
  if (!input.groupId) {
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

  // Prepare and insert payloads
  const insertPayload = [
    prepareInsertPayload(input.groupId, WeekendType.MENS, input.mens),
    prepareInsertPayload(input.groupId, WeekendType.WOMENS, input.womens),
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
  if (!groupId) {
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
  const sharedTitle = normalizeSidebarTitle(payload.title)

  const mensCreate: WeekendWriteInput = {
    start_date: payload.mensStart,
    end_date: payload.mensEnd,
    title: `Mens ${sharedTitle}`,
  }

  const womensCreate: WeekendWriteInput = {
    start_date: payload.womensStart,
    end_date: payload.womensEnd,
    title: `Womens ${sharedTitle}`,
  }

  // If no groupId, create a new group
  if (isNil(payload.groupId)) {
    const groupId = randomUUID()
    return createWeekendGroup({
      groupId,
      mens: mensCreate,
      womens: womensCreate,
    })
  }

  // Otherwise, update existing group
  const mensUpdate: WeekendUpdateInput = {
    start_date: payload.mensStart,
    end_date: payload.mensEnd,
    title: sharedTitle,
  }

  const womensUpdate: WeekendUpdateInput = {
    start_date: payload.womensStart,
    end_date: payload.womensEnd,
    title: sharedTitle,
  }

  return updateWeekendGroup(payload.groupId, {
    mens: mensUpdate,
    womens: womensUpdate,
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

  return ok(result.data)
}

/**
 * Fetches the roster for a weekend with normalized data.
 * Payments are fetched from the payment_transaction table.
 */
export async function getWeekendRoster(
  weekendId: string
): Promise<Result<string, Array<WeekendRosterMember>>> {
  const result = await WeekendRepository.findWeekendRoster(weekendId)

  if (isErr(result)) {
    return result
  }

  if (isNil(result.data)) {
    return err('No roster found for weekend')
  }

  const rosterRecords = result.data

  // Fetch payments for all roster members in parallel
  const paymentPromises = rosterRecords.map(async (record) => {
    const paymentsResult = await PaymentService.getPaymentForTarget(
      'weekend_roster',
      record.id
    )
    return {
      rosterId: record.id,
      payments: isErr(paymentsResult) ? [] : paymentsResult.data,
    }
  })

  const paymentsByRoster = await Promise.all(paymentPromises)

  // Create a map of roster ID to payments
  const paymentsMap = new Map<string, PaymentRecord[]>()
  for (const { rosterId, payments } of paymentsByRoster) {
    paymentsMap.set(rosterId, payments)
  }

  // Combine roster records with their payments
  const rawRosterWithPayments: RawWeekendRoster[] = rosterRecords.map(
    (record) => ({
      ...record,
      payments: paymentsMap.get(record.id) ?? [],
    })
  )

  const normalizedRoster = rawRosterWithPayments.map(normalizeRosterMember)
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
 */
export async function addUserToWeekendRoster(
  weekendId: string,
  userId: string,
  role: string,
  rollo?: string
): Promise<Result<string, void>> {
  return WeekendRepository.insertWeekendRosterMember({
    weekend_id: weekendId,
    user_id: userId,
    status: 'awaiting_payment',
    cha_role: role,
    rollo: rollo ?? null,
  })
}

/**
 * Fetches a weekend roster record for payment flow.
 * Uses admin client to bypass RLS - required for webhook flows.
 */
export async function getWeekendRosterRecord(
  teamUserId: string | null,
  weekendId: string | null
): Promise<Result<string, Tables<'weekend_roster'>>> {
  if (!teamUserId || !weekendId) {
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
 * Records a manual (cash/check) payment for a weekend roster member.
 * Creates a record in the payment_transaction table.
 */
export async function recordManualPayment(
  weekendRosterId: string,
  paymentAmount: number,
  paymentMethod: 'cash' | 'check',
  paymentOwner: string,
  notes?: string
): Promise<Result<string, PaymentTransactionRow>> {
  // Verify the weekend roster record exists and get weekend_id
  const rosterResult =
    await WeekendRepository.findRosterRecordById(weekendRosterId)

  if (isErr(rosterResult)) {
    return err(`Failed to find roster record: ${rosterResult.error}`)
  }

  if (isNil(rosterResult.data)) {
    return err('Weekend roster record not found')
  }

  // Generate a manual payment intent ID
  const paymentIntentId = `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`

  // Record payment in the payment_transaction table
  const result = await PaymentService.recordPayment({
    type: 'fee',
    target_type: 'weekend_roster',
    target_id: weekendRosterId,
    weekend_id: null, // Could be fetched from roster record if needed
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
    `Manual payment recorded: ${paymentMethod} payment of $${paymentAmount} for roster ID ${weekendRosterId}`
  )

  return ok(result.data)
}

/**
 * Fetches weekend options for dropdowns/selectors.
 */
export async function getWeekendOptions(): Promise<
  Result<string, Array<{ id: string; label: string }>>
> {
  const groupsResult = await getWeekendGroupsByStatus()
  if (isErr(groupsResult)) return err(groupsResult.error)

  const options = groupsResult.data.map((group) => {
    const mens = group.weekends.MENS
    const womens = group.weekends.WOMENS
    const anyWeekend = mens ?? womens ?? null

    return { id: group.groupId, label: getWeekendLabel(anyWeekend) }
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
  if (!member.users || !member.cha_role) {
    return null
  }

  const fullName =
    `${member.users.first_name ?? ''} ${member.users.last_name ?? ''}`.trim() ??
    'Unknown'

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
