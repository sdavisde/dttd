import {
  getActiveWeekends,
  getWeekendRoster,
  WeekendRosterMember,
} from '@/services/weekend'
import { isErr } from '@/lib/results'
import { WeekendRosterTable } from '@/app/admin/weekends/[weekend_id]/weekend-roster-table'
import {
  DroppedRosterSection,
  ActiveRosterHeader,
  WeekendStatusBadge,
} from '@/components/weekend'
import { ExperienceDistributionChart } from '@/components/weekend/experience-distribution-chart'
import { Typography } from '@/components/ui/typography'
import { Datetime } from '@/components/ui/datetime'
import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/services/identity/user'
import {
  getWeekendRosterExperienceDistribution,
  ExperienceDistribution,
} from '@/services/master-roster'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CHARole, Weekend, WeekendType } from '@/lib/weekend/types'
import { Permission, userHasCHARole, userHasPermission } from '@/lib/security'
import { formatDateOnly } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users } from 'lucide-react'

export default async function RosterPage() {
  const userResult = await getLoggedInUser()
  if (isErr(userResult)) {
    redirect('/login')
  }
  const user = userResult.data
  const canViewPaymentInfo =
    // userHasPermission(user, [Permission.READ_PAYMENTS]) ||
    userHasCHARole(user, [
      CHARole.RECTOR,
      CHARole.BACKUP_RECTOR,
      CHARole.HEAD,
      CHARole.ASSISTANT_HEAD,
      CHARole.ROSTER,
      CHARole.TECH,
    ])

  const canEditRoster =
    userHasPermission(user, [Permission.WRITE_TEAM_ROSTER]) ||
    userHasCHARole(user, [
      CHARole.RECTOR,
      CHARole.BACKUP_RECTOR,
      CHARole.HEAD,
      CHARole.ASSISTANT_HEAD,
      CHARole.ROSTER,
    ])

  const canViewDroppedMembers =
    userHasPermission(user, [Permission.WRITE_TEAM_ROSTER]) ||
    userHasCHARole(user, [
      CHARole.RECTOR,
      CHARole.BACKUP_RECTOR,
      CHARole.HEAD,
      CHARole.ASSISTANT_HEAD,
      CHARole.ROSTER,
    ])

  const canViewExperienceDistribution =
    userHasPermission(user, [Permission.READ_USER_EXPERIENCE]) ||
    userHasCHARole(user, [
      CHARole.RECTOR,
      CHARole.BACKUP_RECTOR,
      CHARole.HEAD,
      CHARole.ASSISTANT_HEAD,
      CHARole.ROSTER,
    ])

  // Get active weekends
  const activeWeekendsResult = await getActiveWeekends()
  if (isErr(activeWeekendsResult)) {
    throw new Error(
      `Failed to fetch active weekends: ${activeWeekendsResult.error}`
    )
  }

  const mensRosterResult = activeWeekendsResult.data.MENS
    ? await getWeekendRoster(activeWeekendsResult.data.MENS.id)
    : null
  const womensRosterResult = activeWeekendsResult.data.WOMENS
    ? await getWeekendRoster(activeWeekendsResult.data.WOMENS.id)
    : null

  // Fetch experience distribution data if user has permission
  const mensExperienceResult =
    canViewExperienceDistribution && activeWeekendsResult.data.MENS
      ? await getWeekendRosterExperienceDistribution(
          activeWeekendsResult.data.MENS.id
        )
      : null
  const womensExperienceResult =
    canViewExperienceDistribution && activeWeekendsResult.data.WOMENS
      ? await getWeekendRosterExperienceDistribution(
          activeWeekendsResult.data.WOMENS.id
        )
      : null

  // Generally it wouldn't make sense to use an array here, because we know we should have mens and womens weekends, and that's it.
  // I've added this here to make the render function cleaner by using a map - and gives type safety by handling edge case when mens or womens fail to fetch.
  const rosters: Array<{
    value: string
    weekend: Weekend
    roster: WeekendRosterMember[]
    experienceDistribution: ExperienceDistribution | null
  }> = []
  if (
    mensRosterResult &&
    !isErr(mensRosterResult) &&
    activeWeekendsResult.data.MENS
  ) {
    rosters.push({
      value: 'mens',
      weekend: activeWeekendsResult.data.MENS,
      roster: mensRosterResult.data,
      experienceDistribution:
        mensExperienceResult && !isErr(mensExperienceResult)
          ? mensExperienceResult.data
          : null,
    })
  }
  if (
    womensRosterResult &&
    !isErr(womensRosterResult) &&
    activeWeekendsResult.data.WOMENS
  ) {
    rosters.push({
      value: 'womens',
      weekend: activeWeekendsResult.data.WOMENS,
      roster: womensRosterResult.data,
      experienceDistribution:
        womensExperienceResult && !isErr(womensExperienceResult)
          ? womensExperienceResult.data
          : null,
    })
  }

  if (rosters.length === 0) {
    throw new Error(`Could not find either the mens or womens rosters`)
  }

  if (rosters.length === 1) {
    const { roster, weekend, experienceDistribution } = rosters[0]
    const startDate = formatDateOnly(weekend.start_date)
    const endDate = formatDateOnly(weekend.end_date)

    return (
      <div className="container mx-auto px-8 pt-6 pb-2 md:pt-8 md:pb-4">
        {/* Weekend Information Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left side: Weekend info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Typography variant="h5" className="text-2xl">
                  {weekend.title ??
                    `${weekend.type} Weekend #${weekend.number}`}
                </Typography>
                {weekend.status && (
                  <WeekendStatusBadge status={weekend.status} />
                )}
              </div>
              <Typography
                as="span"
                variant="muted"
                className="text-lg flex items-center gap-2"
              >
                <Datetime dateTime={startDate} />
                <span>-</span>
                <Datetime dateTime={endDate} />
              </Typography>
              {weekend.groupId && (
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link
                    href={`/candidate-list?weekend=${weekend.groupId}&weekendType=${weekend.type}`}
                  >
                    <Users className="h-4 w-4" />
                    Candidates
                  </Link>
                </Button>
              )}
            </div>

            {/* Right side: Experience chart */}
            {experienceDistribution && (
              <div className="lg:w-auto">
                <ExperienceDistributionChart
                  distribution={experienceDistribution}
                />
              </div>
            )}
          </div>
        </div>

        {/* Team Roster Section */}
        <div>
          <div className="mb-4">
            <ActiveRosterHeader roster={roster} title="Team Roster" />
          </div>

          <WeekendRosterTable
            roster={roster}
            isEditable={false}
            includePaymentInformation={false}
          />
        </div>

        {/* Dropped Team Members Section - Only shown to specific CHA roles */}
        {canViewDroppedMembers && <DroppedRosterSection roster={roster} />}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-8 pt-6 pb-2 md:pt-8 md:pb-4">
      <Tabs defaultValue={user.gender === 'male' ? 'mens' : 'womens'}>
        {rosters.map(({ roster, value, weekend, experienceDistribution }) => {
          const startDate = formatDateOnly(weekend.start_date)
          const endDate = formatDateOnly(weekend.end_date)

          return (
            <TabsContent key={value} value={value}>
              {/* Weekend Information Header */}
              <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Left side: Weekend info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Typography variant="h5" className="text-2xl">
                        {weekend.title ??
                          `${weekend.type} Weekend #${weekend.number}`}
                      </Typography>
                      {/* Gender toggle */}
                      <TabsList>
                        {rosters.map((r) => (
                          <TabsTrigger
                            key={r.value}
                            value={r.value}
                            className="capitalize font-bold"
                          >
                            {r.value}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                    <Typography
                      as="span"
                      variant="muted"
                      className="text-lg flex items-center gap-2"
                    >
                      <Datetime dateTime={startDate} />
                      <span>-</span>
                      <Datetime dateTime={endDate} />
                    </Typography>
                    {weekend.groupId && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-3"
                      >
                        <Link
                          href={`/candidate-list?weekend=${weekend.groupId}&weekendType=${weekend.type}`}
                        >
                          <Users className="h-4 w-4" />
                          Candidates
                        </Link>
                      </Button>
                    )}
                  </div>

                  {/* Right side: Experience chart */}
                  {experienceDistribution && (
                    <div className="lg:w-auto">
                      <ExperienceDistributionChart
                        distribution={experienceDistribution}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Team Roster Section */}
              <div>
                <div className="mb-4">
                  <ActiveRosterHeader roster={roster} title="Team Roster" />
                </div>

                <WeekendRosterTable
                  roster={roster}
                  isEditable={canEditRoster}
                  includePaymentInformation={canViewPaymentInfo}
                />
              </div>

              {/* Dropped Team Members Section - Only shown to specific CHA roles */}
              {canViewDroppedMembers && (
                <DroppedRosterSection roster={roster} />
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
