import { Tables } from '@/database.types'

/**
 * A single weekend_roster row for a team member, representing their assignment
 * to one specific weekend (MENS or WOMENS) within a group.
 * A multi-weekend volunteer will have multiple assignments within the same group.
 */
export type TeamAssignment = {
  /** weekend_roster.id — the row ID for this specific weekend assignment */
  id: string
  /** The weekend this assignment belongs to (null if data is missing) */
  weekend_id: string | null
  /** The team role assigned to this member for this weekend */
  cha_role: string | null
  /** Roster status (e.g. 'awaiting_payment', 'paid') */
  status: string | null
}

/**
 * Group-scoped team membership info for the currently active weekend group.
 * A single weekend_group_members row is shared across both MENS and WOMENS
 * weekends in the same group, so forms and payment are also shared.
 */
export type TeamMemberInfo = {
  /** weekend_group_members.id — the shared row that ties forms and payment together */
  groupMemberId: string
  /** The weekend_groups.id this membership belongs to */
  groupId: string
  /** One entry per weekend_roster row in the active group for this user.
   *  Single-weekend volunteers have one entry; cross-weekend volunteers have two. */
  assignments: TeamAssignment[]
}

export type Weekend = {
  id: string
  start_date: string
  end_date: string
  /** Weekend number, sourced from weekend_groups.number via join. Null until Task 3 join is added. */
  number: number | null
  status: WeekendStatusValue | null
  title: string | null
  type: WeekendType
  groupId: string | null
}

export const WeekendType = {
  MENS: 'MENS',
  WOMENS: 'WOMENS',
} as const

export type WeekendType = (typeof WeekendType)[keyof typeof WeekendType]

export enum WeekendStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

export type WeekendStatusValue = `${WeekendStatus}`

export type RawWeekendRecord = Tables<'weekends'> & {
  /** Joined from weekend_groups to restore the group number field. */
  weekend_groups: { number: number | null } | null
}

export type WeekendGroup = Record<WeekendType, Weekend>

export type WeekendGroupWithId = {
  groupId: string
  weekends: WeekendGroup
}

export type WeekendWriteInput = {
  start_date: string
  end_date: string
  status?: WeekendStatusValue | null
  title?: string | null
}

export type WeekendUpdateInput = Partial<WeekendWriteInput>

export type CreateWeekendGroupInput = {
  groupId: string
  mens: WeekendWriteInput
  womens: WeekendWriteInput
}

export type UpdateWeekendGroupInput = {
  mens?: WeekendUpdateInput
  womens?: WeekendUpdateInput
}

export enum CHARole {
  RECTOR = 'Rector',
  HEAD = 'Head',
  ASSISTANT_HEAD = 'Assistant Head',
  BACKUP_RECTOR = 'Backup Rector',
  HEAD_TECH = 'Head Tech',
  TECH = 'Tech',
  HEAD_ROLLISTA = 'Head Rollista',
  TABLE_LEADER = 'Table Leader',
  HEAD_SPIRITUAL_DIRECTOR = 'Head Spiritual Director',
  SPIRITUAL_DIRECTOR = 'Spiritual Director',
  SPIRITUAL_DIRECTOR_TRAINEE = 'Spiritual Director Trainee',
  HEAD_PRAYER = 'Head Prayer',
  PRAYER = 'Prayer',
  HEAD_CHAPEL = 'Head Chapel',
  CHAPEL = 'Chapel',
  HEAD_CHAPEL_TECH = 'Head Chapel Tech',
  HEAD_MUSIC = 'Head Music',
  MUSIC = 'Music',
  HEAD_PALANCA = 'Head Palanca',
  PALANCA = 'Palanca',
  HEAD_TABLE = 'Head Table',
  TABLE = 'Table',
  HEAD_DORM = 'Head Dorm',
  DORM = 'Dorm',
  HEAD_DINING = 'Head Dining',
  DINING = 'Dining',
  HEAD_MOBILE = 'Head Mobile',
  MOBILE = 'Mobile',
  ESCORT = 'Escort',
  FLOATER = 'Floater',
  MEAT = 'Meat',
  ROSTER = 'Roster',
  GOPHER = 'Gopher',
  MEDIC = 'Medic',
  SMOKER = 'Smoker',

  // todo: we might take this position out in the future
  ROVER = 'Rover',
}

export enum Rollo {
  IDEALS = 'Ideals',
  GRACE = 'Grace',
  CHURCH = 'Church',
  HOLY_SPIRIT = 'Holy Spirit',
  PIETY = 'Piety',
  STUDY = 'Study',
  SACRED_MOMENTS_OF_GRACE = 'Sacred Moments of Grace',
  ACTION = 'Action',
  OBSTACLES_TO_GRACE = 'Obstalces to Grace',
  LEADERS = 'Leaders',
  ENVIRONMENTS = 'Environments',
  LIFE_IN_GRACE = 'Life in Grace',
  CCIA = 'CCIA',
  REUNION_GROUP = 'Reunion Group',
  FOURTH_DAY = 'Fourth Day',
}
