import { Database } from '@/database.types'

export type TeamMember = Database['public']['Tables']['weekend_roster']['Row']

export type Weekend = Database['public']['Tables']['weekends']['Row']
