import Link from 'next/link'
import { Fragment } from 'react'
import { Check, ChevronRight, type LucideIcon } from 'lucide-react'
import { isNil } from 'lodash'
import { RoleAccessMark } from '@/components/member/role-access-mark'
import { cn } from '@/lib/utils'
import type { SponsoredCandidateRow } from '@/services/candidates'
import type { RosterAssignmentRow } from '@/services/weekend'

export type YourPartAction = {
  key: string
  title: string
  description: string
  href: string
  icon: LucideIcon
  /** Only people with a particular role see this; marks it with a key. */
  restricted?: boolean
  /** A personal to-do that's finished (forms signed, fee paid). */
  done?: boolean
}

type YourPartProps = {
  /** "Men's #12" — the weekend these facts are about. */
  weekendLabel: string
  sponsored: SponsoredCandidateRow[]
  assignment: RosterAssignmentRow | null
  /** Personal to-dos first, then role-only tools, in display order. */
  actions: YourPartAction[]
}

function joinNames(names: string[]): React.ReactNode {
  return names.map((name, index) => (
    <Fragment key={`${name}-${index}`}>
      {index > 0 && (index === names.length - 1 ? ' and ' : ', ')}
      <span className="font-semibold text-foreground">{name}</span>
    </Fragment>
  ))
}

/**
 * The hub's "Your part in this weekend" section: who the viewer is
 * sponsoring and what they are serving as, then the things only they have
 * to do here — their own forms and fee, plus the tools their role opens up.
 */
export function YourPart({
  weekendLabel,
  sponsored,
  assignment,
  actions,
}: YourPartProps) {
  const names = sponsored.map((c) => c.candidateName ?? 'a candidate')
  const roleParts = isNil(assignment)
    ? []
    : [assignment.cha_role, assignment.additional_cha_role].filter(
        (part): part is string => !isNil(part) && part !== ''
      )
  const role = isNil(assignment)
    ? null
    : roleParts.length > 0
      ? roleParts.join(' and ')
      : 'Team member'

  const hasPart = names.length > 0 || !isNil(role)

  return (
    <section className="flex flex-col gap-4 rounded-lg border bg-card px-5 py-4.5">
      <div className="space-y-1.5">
        <h2 className="font-serif text-lg font-semibold tracking-tight">
          Your part in this weekend
        </h2>
        {hasPart ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {names.length > 0 && (
              <>
                You&rsquo;re sponsoring {joinNames(names)}
                {!isNil(role) ? ' and serving as ' : ` on ${weekendLabel}.`}
              </>
            )}
            {!isNil(role) && (
              <>
                {names.length === 0 && "You're serving as "}
                <span className="font-semibold text-foreground">
                  {role}
                </span> on {weekendLabel}.
              </>
            )}
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            You&rsquo;re not sponsoring anyone or serving on this weekend yet.{' '}
            <Link
              href="/sponsor"
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Sponsor a candidate
            </Link>
          </p>
        )}
      </div>

      {actions.length > 0 && (
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {actions.map((action) => (
            <li key={action.key}>
              <ActionRow action={action} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ActionRow({ action }: { action: YourPartAction }) {
  const done = action.done === true
  // A finished to-do swaps its icon for a check and goes green, so what's
  // left to do stands out; it still links through for a second look.
  const Icon = done ? Check : action.icon
  return (
    <Link
      href={action.href}
      className={cn(
        'group flex min-h-11 items-center gap-3 rounded-md border px-3.5 py-3 transition-colors',
        done
          ? 'border-success/30 bg-success/5 hover:bg-success/10'
          : 'hover:bg-muted'
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full',
          done ? 'bg-success/15' : 'bg-secondary'
        )}
      >
        <Icon
          className={cn(
            'size-4',
            done ? 'text-success' : 'text-secondary-foreground'
          )}
          strokeWidth={done ? 2.5 : 2}
          aria-hidden
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {action.title}
          {action.restricted === true && <RoleAccessMark />}
        </span>
        <span className="block text-[13px] leading-snug text-muted-foreground">
          {action.description}
        </span>
      </span>
      {done ? (
        <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
          Done
        </span>
      ) : (
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      )}
    </Link>
  )
}
