import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isNil } from 'lodash'
import {
  ChevronRight,
  Gift,
  HandHeart,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { MemberBreadcrumbs } from '@/components/member/breadcrumbs'
import { PageContent } from '@/components/member/page-content'
import { getLoggedInUser } from '@/services/identity/user'
import { getMyTeamFeeStatus } from '@/services/payment'
import { formatFee } from '@/lib/payments/group-fees'
import { isErr, Results } from '@/lib/results'
import { cn } from '@/lib/utils'

type PaymentOption = {
  key: string
  title: string
  description: string
  icon: LucideIcon
  /** Where the option leads; omitted while it isn't available yet. */
  href?: string
  status?: string
}

/**
 * Online payment: one place to pay for anything. Only the viewer's own team
 * fee is wired up today; paying for someone else, candidate fees and
 * open-amount gifts are shown so people know they're coming.
 */
export default async function OnlinePaymentPage() {
  const userResult = await getLoggedInUser()
  if (isErr(userResult)) redirect('/login')
  const user = userResult.data

  const groupMemberId = user.teamMemberInfo?.groupMemberId ?? null
  // Paid means the full fee is covered — a partial payment, or a fee raised
  // after paying, still leaves something to pay here.
  const feeStatus = isNil(groupMemberId)
    ? null
    : Results.toNullable(await getMyTeamFeeStatus(groupMemberId))

  const teamFee: PaymentOption = isNil(groupMemberId)
    ? {
        key: 'team-fee',
        title: 'My team fee',
        description:
          "For people serving on the current weekend's team. Once you're on the roster, you can pay here.",
        icon: UserRound,
      }
    : feeStatus?.state === 'paid'
      ? {
          key: 'team-fee',
          title: 'My team fee',
          description: "You've paid your team fee for this weekend. Thank you!",
          icon: UserRound,
          status: 'Paid',
        }
      : feeStatus?.state === 'not-owed'
        ? {
            key: 'team-fee',
            title: 'My team fee',
            description: "You don't owe a team fee for this weekend.",
            icon: UserRound,
            status: 'Not owed',
          }
        : feeStatus?.state === 'fees-not-set'
          ? {
              key: 'team-fee',
              title: 'My team fee',
              description:
                "The team fee for this weekend hasn't been set yet. Check back soon.",
              icon: UserRound,
            }
          : {
              key: 'team-fee',
              title: 'My team fee',
              description:
                feeStatus?.state === 'owes' && feeStatus.coveredSoFar > 0
                  ? `${formatFee(feeStatus.amountDue)} left to pay on your ${formatFee(feeStatus.fee)} team fee.`
                  : 'Pay your team fee for the current weekend by card.',
              icon: UserRound,
              href: '/payment/team-fee',
            }

  const options: PaymentOption[] = [
    teamFee,
    {
      key: 'others-team-fee',
      title: "Someone else's team fee",
      description: 'Cover all or part of another team member’s fee.',
      icon: UsersRound,
      status: 'Coming soon',
    },
    {
      key: 'candidate-fee',
      title: "A candidate's fee",
      description: 'Help pay for a candidate — your own or anyone else’s.',
      icon: HandHeart,
      status: 'Coming soon',
    },
    {
      key: 'donation',
      title: 'Give a gift',
      description:
        'Donate any amount, for any reason, to support the weekends.',
      icon: Gift,
      status: 'Coming soon',
    },
  ]

  return (
    <PageContent size="narrow">
      <MemberBreadcrumbs
        title="Online payment"
        breadcrumbs={[{ label: 'Home', href: '/home' }]}
      />
      <PageHeader
        title="Online payment"
        description="Pay a fee or give toward the weekends."
      />
      <ul className="flex flex-col gap-3">
        {options.map((option) => (
          <li key={option.key}>
            <PaymentOptionRow option={option} />
          </li>
        ))}
      </ul>
    </PageContent>
  )
}

function PaymentOptionRow({ option }: { option: PaymentOption }) {
  const Icon = option.icon
  const available = !isNil(option.href)
  const done = option.status === 'Paid'
  // Unavailable rows (not wired up yet, or not on a team) read as inert:
  // no card surface, dashed border, and greyed icon and title.
  const inactive = !available && !done
  const body = (
    <>
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          inactive
            ? 'bg-muted text-muted-foreground'
            : 'bg-secondary text-secondary-foreground'
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'text-[15px] font-semibold',
              inactive ? 'text-muted-foreground' : 'text-foreground'
            )}
          >
            {option.title}
          </span>
          {!isNil(option.status) && (
            <Badge variant="outline" className="text-muted-foreground">
              {option.status}
            </Badge>
          )}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
          {option.description}
        </span>
      </span>
      {available && (
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      )}
    </>
  )

  const className =
    'flex min-h-11 items-center gap-4 rounded-lg border px-4 py-4'
  if (isNil(option.href)) {
    return (
      <div
        className={cn(
          className,
          inactive ? 'cursor-not-allowed border-dashed bg-muted/40' : 'bg-card'
        )}
        aria-disabled={inactive || undefined}
      >
        {body}
      </div>
    )
  }
  return (
    <Link
      href={option.href}
      className={cn(
        className,
        'group bg-card shadow-sm transition-colors hover:border-primary/40 hover:bg-muted'
      )}
    >
      {body}
    </Link>
  )
}
