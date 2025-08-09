export type TeamMemberInfo = {
  id: string
  cha_role: string | null
  status: string | null
  weekend_id: string | null
}

export type Weekend = {
  id: string
  start_date: string
  end_date: string
  number: number | null
  status: WeekendStatus | null
  title: string | null
  type: WeekendType
}

export type WeekendType = 'MENS' | 'WOMENS'

export type WeekendStatus = string // 'FINISHED' | 'ACTIVE' | 'PLANNING'

export enum CHARole {
  RECTOR = 'RECTOR',
  HEAD = 'HEAD',
  OUTSIDE_HEAD = 'ASSISTANT_HEAD',
  BACKUP_RECTOR = 'BACKUP_RECTOR',
  HEAD_TECH = 'HEAD_TECH',
  TECH = 'TECH',
  HEAD_ROLLISTA = 'HEAD_ROLLISTA',
  TABLE_LEADER = 'TABLE_LEADER',
  HEAD_SPIRITUAL_DIRECTOR = 'HEAD_SPIRITUAL_DIRECTOR',
  SPIRITUAL = 'SPIRITUAL',
  HEAD_PRAYER = 'HEAD_PRAYER',
  PRAYER = 'PRAYER',
  HEAD_CHAPEL = 'HEAD_CHAPEL',
  CHAPEL = 'CHAPEL',
  HEAD_CHAPEL_TECH = 'HEAD_CHAPEL_TECH',
  HEAD_MUSIC = 'HEAD_MUSIC',
  MUSIC = 'MUSIC',
  HEAD_PALANCA = 'HEAD_PALANCA',
  PALANCA = 'PALANCA',
  HEAD_TABLE = 'HEAD_TABLE',
  TABLE = 'TABLE',
  HEAD_DORM = 'HEAD_DORM',
  DORM = 'DORM',
  DINING = 'DINING',
  HEAD_MOBILE = 'HEAD_MOBILE',
  MOBILE = 'MOBILE',
  ESCORT = 'ESCORT',
  FLOATER = 'FLOATER',
  MEAT = 'MEAT',
  ROSTER = 'ROSTER',
  GOPHER = 'GOPHER',
  MDEDIC = 'MEDIC',
  SMOKER = 'SMOKER',
}
