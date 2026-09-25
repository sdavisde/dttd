import type { GroupFees } from '@/lib/payments/group-fees'

/** What new weekend groups start at. Team and candidate share one fee. */
export type FeeDefaults = {
  weekendFee: number
  onlineSurcharge: number
}

/** One change to a group's fees. `before` is null for the first time they were set. */
export type FeeChange = {
  id: number
  changedAt: string
  changedByName: string | null
  before: GroupFees | null
  after: GroupFees | null
}

export const DEFAULT_WEEKEND_FEE_KEY = 'default_weekend_fee'
export const DEFAULT_ONLINE_SURCHARGE_KEY = 'default_online_surcharge'
