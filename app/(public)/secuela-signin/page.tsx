import { isNil } from 'lodash'
import { CheckCircle } from 'lucide-react'
import { isErr, Results } from '@/lib/results'
import { getLoggedInUser } from '@/services/identity/user'
import { markSecuelaAttendance } from '@/services/weekend-group-member'

export default async function SecuelaSignInPage() {
  const userResult = await getLoggedInUser()

  if (isErr(userResult)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <p className="text-muted-foreground">
          Something went wrong. Please try again later.
        </p>
      </div>
    )
  }

  const user = userResult.data
  const result = await markSecuelaAttendance(user.id)

  const groupNumber = Results.unwrapOr(
    Results.map(result, (r) => r.groupNumber),
    null
  )
  const weekendLabel = !isNil(groupNumber)
    ? `DTTD #${groupNumber}`
    : 'the upcoming weekend'

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Thank you for signing up to serve on {weekendLabel}!
          </h1>
          <p className="text-muted-foreground">
            We are so grateful for your willingness to serve. You will receive
            more information as the weekend approaches.
          </p>
        </div>
      </div>
    </div>
  )
}
