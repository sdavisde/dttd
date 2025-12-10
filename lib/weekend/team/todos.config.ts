import { hasTeamPayment } from '@/actions/payments'
import { isOk } from '@/lib/results'
import { TodoItemConfig } from './todos.types'

/**
 * Configuration for team preparation TODO items.
 * These are displayed on the homepage for team members on active weekends.
 */
export const teamTodoItems: TodoItemConfig[] = [
  {
    id: 'team-info',
    label: 'Complete team forms',
    href: null,
    tooltip: 'Coming soon',
    // checkCompletion will be added when team info form is implemented (spec 0002)
  },
  {
    id: 'team-payment',
    label: 'Pay team fees',
    href: '/payment/team-fee',
    params: ({ weekend }) => `?weekend_id=${weekend.id}`,
    checkCompletion: async ({ user }) => {
      const result = await hasTeamPayment(user.team_member_info.id)
      return isOk(result) && result.data
    },
  },
  {
    id: 'review-job-description',
    label: 'Review Job Description',
    href: '/files/job-descriptions',
    // No completion check - this is informational only
  },
]
