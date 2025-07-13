import { Database } from '@/database.types'

export type TeamMember = Database['public']['Tables']['weekend_roster']['Row'] & {
  users: Database['public']['Tables']['users']['Row']
}

export type Weekend = Database['public']['Tables']['weekends']['Row']

export enum CHARole {
  RECTOR = 'RECTOR',
  HEAD = 'HEAD',
  OUTSIDE_HEAD = 'ASSISTANT_HEAD',
  BACKUP_RECTOR = 'BACKUP_RECTOR',
  TECH_HEAD = 'TECH_HEAD',
  TECH = 'TECH',
  TABLE_LEADER = 'TABLE_LEADER',
  SPIRITUAL_HEAD = 'SPIRITUAL_HEAD',
  SPIRITUAL = 'SPIRITUAL',
  PRAYER_HEAD = 'PRAYER_HEAD',
  PRAYER = 'PRAYER',
  CHAPEL_HEAD = 'CHAPEL_HEAD',
  CHAPEL = 'CHAPEL',
  MUSIC_HEAD = 'MUSIC_HEAD',
  MUSIC = 'MUSIC',
  PALANCA_HEAD = 'PALANCA_HEAD',
  PALANCA = 'PALANCA',
  TABLE_HEAD = 'TABLE_HEAD',
  TABLE = 'TABLE',
  DORM_HEAD = 'DORM_HEAD',
  DORM = 'DORM',
  DINING = 'DINING',
  MOBILE_HEAD = 'MOBILE_HEAD',
  MOBILE = 'MOBILE',
  FLOATER = 'FLOATER',
  MEAT = 'MEAT',
  ROSTER = 'ROSTER',
  GOPHER = 'GOPHER',
  MDEDIC = 'MEDIC',
}
