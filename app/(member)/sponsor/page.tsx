import { redirect } from 'next/navigation'
import { isNil } from 'lodash'
import { CalendarX } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { PageContent } from '@/components/member/page-content'
import { MemberBreadcrumbs } from '@/components/member/breadcrumbs'
import { formatPhoneInput } from '@/lib/formatting/phone-input'
import { getLoggedInUser } from '@/services/identity/user'
import { getCachedActiveWeekends } from '@/services/weekend/cached'
import { isErr, Results } from '@/lib/results'
import type { User } from '@/lib/users/types'
import { formatWeekendTitle } from '@/lib/weekend'
import { formatCompactDateRange, resolveWeekendType } from '@/lib/weekend/hub'
import { WeekendType } from '@/lib/weekend/types'
import { SponsorForm, type SponsorFormDefaults } from './SponsorForm'
import type { WeekendOption } from './sponsor-form.helpers'

/** The sponsor's own details, filled in from their profile. */
function defaultsFromProfile(user: User): SponsorFormDefaults {
  const name = [user.firstName, user.lastName]
    .filter((part) => !isNil(part) && part !== '')
    .join(' ')
  const address = isNil(user.address)
    ? ''
    : [
        [user.address.addressLine1, user.address.addressLine2]
          .filter((part) => !isNil(part) && part !== '')
          .join(' '),
        user.address.city,
        [user.address.state, user.address.zip]
          .filter((part) => part !== '')
          .join(' '),
      ]
        .filter((part) => part !== '')
        .join(', ')

  return {
    sponsor_name: name,
    sponsor_phone: formatPhoneInput(user.phoneNumber ?? ''),
    sponsor_address: address,
    sponsor_church: user.communityInformation.churchAffiliation ?? '',
    sponsor_weekend: user.communityInformation.weekendAttended ?? '',
  }
}

export default async function SponsorPage() {
  const [userResult, weekendsResult] = await Promise.all([
    getLoggedInUser(),
    getCachedActiveWeekends(),
  ])
  if (isErr(userResult)) redirect('/login')
  const user = userResult.data
  Results.logFailures(weekendsResult)
  const activeWeekends = Results.toNullable(weekendsResult)

  const weekends: WeekendOption[] = isNil(activeWeekends)
    ? []
    : [WeekendType.MENS, WeekendType.WOMENS]
        .map((type) => activeWeekends[type])
        .filter((weekend) => !isNil(weekend))
        .map((weekend) => ({
          id: weekend.id,
          label: formatWeekendTitle(weekend, { genderStyle: 'possessive' }),
          dates: formatCompactDateRange(weekend.start_date, weekend.end_date),
        }))
  // Most people sponsor for their own weekend, so start there.
  const ownWeekend = activeWeekends?.[resolveWeekendType(null, user.gender)]

  return (
    <PageContent size="narrow">
      <MemberBreadcrumbs
        title="Sponsor a candidate"
        breadcrumbs={[{ label: 'Home', href: '/home' }]}
      />
      <PageHeader
        title="Sponsor a candidate"
        description="Tell the pre-weekend couple about the person you'd like to bring to a weekend."
      />
      {weekends.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border bg-card p-6">
          <CalendarX className="size-8 text-muted-foreground" aria-hidden />
          <h2 className="font-serif text-xl font-semibold tracking-tight">
            No weekend is open for sponsorships
          </h2>
          <p className="text-sm text-muted-foreground">
            Sponsorships open once the next weekend is set up. Check back soon,
            or ask the pre-weekend couple when it opens.
          </p>
        </div>
      ) : (
        <SponsorForm
          weekends={weekends}
          defaults={{
            ...defaultsFromProfile(user),
            weekend_id: ownWeekend?.id ?? '',
          }}
        />
      )}
    </PageContent>
  )
}
