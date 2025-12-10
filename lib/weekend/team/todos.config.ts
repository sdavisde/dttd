import { TodoItemConfig } from './todos.types'

/**
 * Configuration for team preparation TODO items.
 * These are displayed on the homepage for team members on active weekends.
 */
export const teamTodoItems: TodoItemConfig[] = [
  {
    id: 'team-info',
    label: 'Complete team information sheet',
    href: null,
    tooltip: 'Coming soon',
    // checkCompletion will be added when team info form is implemented (spec 0002)
  },
  {
    id: 'team-payment',
    label: 'Complete team payment',
    href: '/payment/team-fee',
    params: ({ weekend }) => `?weekend_id=${weekend.id}`,
    // checkCompletion will be added when payment status tracking is implemented
  },
  {
    id: 'review-job-description',
    label: 'Review Job Description',
    href: '/files',
    // No completion check - this is informational only
  },
]
