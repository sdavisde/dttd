import 'server-only'

import { isNil } from 'lodash'
import type { Result } from '@/lib/results'
import { err, isErr, map, ok } from '@/lib/results'
import {
  groupFeesFromColumns,
  type GroupFees,
  type TrackedGroup,
} from '@/lib/payments/group-fees'
import { getLoggedInUser } from '@/services/identity/user'
import * as SettingsRepository from '@/services/settings/repository'
import * as WeekendRepository from '@/services/weekend/repository'
import * as FeesRepository from './repository'
import {
  DEFAULT_ONLINE_SURCHARGE_KEY,
  DEFAULT_WEEKEND_FEE_KEY,
  type FeeChange,
  type FeeDefaults,
} from './types'

/** Every weekend group whose fees are set, oldest first. */
export async function getTrackedGroups(): Promise<
  Result<string, TrackedGroup[]>
> {
  return map(await FeesRepository.findTrackedGroups(), (rows) =>
    rows.flatMap((row) => {
      const fees = groupFeesFromColumns(row)
      return isNil(fees)
        ? []
        : [{ groupId: row.id, groupNumber: row.number, fees }]
    })
  )
}

/** A group's fees; null when the group isn't tracked (or doesn't exist). */
export async function getGroupFees(
  groupId: string
): Promise<Result<string, GroupFees | null>> {
  return map(await FeesRepository.findGroupFeeRow(groupId), (row) =>
    isNil(row) ? null : groupFeesFromColumns(row)
  )
}

/** The fees of the group a weekend belongs to; null when it isn't tracked. */
export async function getGroupFeesForWeekend(
  weekendId: string
): Promise<Result<string, GroupFees | null>> {
  const weekendResult = await WeekendRepository.findWeekendById(weekendId)
  if (isErr(weekendResult)) return weekendResult
  const groupId = weekendResult.data?.group_id
  return isNil(groupId) ? ok(null) : getGroupFees(groupId)
}

function validateFees(fees: GroupFees): Result<string, GroupFees> {
  const amounts = [fees.teamFee, fees.candidateFee, fees.onlineSurcharge]
  if (amounts.some((a) => !Number.isFinite(a) || a < 0)) {
    return err('Fees must be zero or more')
  }
  return ok(fees)
}

/** Sets a group's fees. The change is logged by the database. */
export async function setGroupFees(
  groupId: string,
  fees: GroupFees
): Promise<Result<string, GroupFees>> {
  const valid = validateFees(fees)
  if (isErr(valid)) return valid

  const result = await FeesRepository.updateGroupFees(groupId, fees)
  if (isErr(result)) return err(`Failed to update fees: ${result.error}`)

  const saved = groupFeesFromColumns(result.data)
  return isNil(saved) ? err('Fees did not save') : ok(saved)
}

/** What new groups start at, from site settings. */
export async function getFeeDefaults(): Promise<Result<string, FeeDefaults>> {
  const result = await SettingsRepository.getSettingsByKeys([
    DEFAULT_WEEKEND_FEE_KEY,
    DEFAULT_ONLINE_SURCHARGE_KEY,
  ])
  if (isErr(result)) return err(`Failed to read fee defaults: ${result.error}`)

  const valueOf = (key: string) => {
    const raw = result.data.find((s) => s.key === key)?.value
    const value = isNil(raw) ? NaN : Number(raw)
    return Number.isFinite(value) ? value : null
  }
  const weekendFee = valueOf(DEFAULT_WEEKEND_FEE_KEY)
  const onlineSurcharge = valueOf(DEFAULT_ONLINE_SURCHARGE_KEY)
  if (isNil(weekendFee) || isNil(onlineSurcharge)) {
    return err('Fee defaults are not set')
  }
  return ok({ weekendFee, onlineSurcharge })
}

/** Changes what new groups start at. Existing groups are untouched. */
export async function updateFeeDefaults(
  defaults: FeeDefaults
): Promise<Result<string, FeeDefaults>> {
  const valid = validateFees({
    teamFee: defaults.weekendFee,
    candidateFee: defaults.weekendFee,
    onlineSurcharge: defaults.onlineSurcharge,
  })
  if (isErr(valid)) return valid

  const userResult = await getLoggedInUser()
  if (isErr(userResult)) return err('Failed to get current user')

  for (const [key, value] of [
    [DEFAULT_WEEKEND_FEE_KEY, defaults.weekendFee],
    [DEFAULT_ONLINE_SURCHARGE_KEY, defaults.onlineSurcharge],
  ] as const) {
    const result = await SettingsRepository.upsertSetting(
      key,
      String(value),
      userResult.data.id
    )
    if (isErr(result)) {
      return err(`Failed to update fee defaults: ${result.error}`)
    }
  }
  return ok(defaults)
}

/** A group's fee history, newest first. */
export async function getFeeHistory(
  groupId: string
): Promise<Result<string, FeeChange[]>> {
  return map(await FeesRepository.findFeeChanges(groupId), (rows) =>
    rows.map((row) => ({
      id: row.id,
      changedAt: row.changed_at,
      changedByName: row.changedByName,
      before: groupFeesFromColumns({
        team_fee: row.old_team_fee,
        candidate_fee: row.old_candidate_fee,
        online_surcharge: row.old_online_surcharge,
      }),
      after: groupFeesFromColumns({
        team_fee: row.new_team_fee,
        candidate_fee: row.new_candidate_fee,
        online_surcharge: row.new_online_surcharge,
      }),
    }))
  )
}
