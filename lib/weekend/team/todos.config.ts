import { hasTeamPayment } from '@/services/payment'
import { hasCompletedAllTeamForms } from '@/actions/team-forms'
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
    href: '/team-forms',
    checkCompletion: async ({ user }) => {
      const result = await hasCompletedAllTeamForms(user.teamMemberInfo.id)
      return isOk(result) && result.data
    },
  },
  {
    id: 'team-payment',
    label: 'Pay team fees',
    href: '/payment/team-fee',
    params: ({ weekend }) => `?weekend_id=${weekend.id}`,
    checkCompletion: async ({ user }) => {
      const result = await hasTeamPayment(user.teamMemberInfo.id)
      return isOk(result) && result.data
    },
  },
  {
    id: 'review-job-description',
    label: 'Review Job Description',
    href: '/files/job-descriptions',
    clientSideCompletion: true,
  },
]
