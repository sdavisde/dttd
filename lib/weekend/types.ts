import { Tables } from '@/database.types'

/**
 * A volunteer's assignment to one specific weekend within the group.
 * Represents one active (non-dropped) weekend_roster row.
 * Drop status rows are excluded — they are only visible in the admin roster view.
 *
 * Weekend-specific data lives here (role, rollo).
 * Group-level data (forms, payment) lives on TeamMemberInfo.
 */
export type WeekendAssignment = {
  /** weekend_roster.id */
  rosterId: string
  /** The weekend_id this assignment belongs to */
  weekendId: string | null
  /** MENS or WOMENS */
  weekendType: string | null
  /** The CHA role assigned for this weekend */
  chaRole: string | null
  /** The rollo talk assigned for this weekend (if applicable) */
  rollo: string | null
  /** Additional CHA role (if any) */
  additionalChaRole: string | null
}

/**
 * Group-scoped team membership for the currently active weekend group.
 *
 * Key principle: forms and team fee payment belong to the GROUP MEMBER (once per
 * group), while role/rollo assignments are per-weekend and live on WeekendAssignment.
 *
 * A single-weekend volunteer has one WeekendAssignment; a volunteer serving on
 * both Men's and Women's weekends in the same group has two.
 * If all of a user's roster rows are dropped, teamMemberInfo will be null.
 */
export type TeamMemberInfo = {
  /** weekend_group_members.id — the hub for team forms and team fee payment */
  groupMemberId: string
  /** The weekend_groups.id this membership belongs to */
  groupId: string
  /** The weekend group number (e.g. 11 for "DTTD #11") */
  groupNumber: number | null
  /** Active (non-dropped) roster assignments for this volunteer in the group. */
  weekendAssignments: WeekendAssignment[]
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
