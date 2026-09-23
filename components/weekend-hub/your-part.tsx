import Link from 'next/link'
import { Fragment } from 'react'
import { isNil } from 'lodash'
import type { SponsoredCandidateRow } from '@/services/candidates'
import type { RosterAssignmentRow } from '@/services/weekend'

type YourPartProps = {
  /** "Men's #12" — the weekend these facts are about. */
  weekendLabel: string
  sponsored: SponsoredCandidateRow[]
  assignment: RosterAssignmentRow | null
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
 * The hub's "Your part in this weekend" card: who the viewer is sponsoring
 * and what they are serving as, written as a sentence or two.
 */
export function YourPart({
  weekendLabel,
  sponsored,
  assignment,
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
    <section className="flex flex-col rounded-lg border bg-card px-5 py-4.5">
      <h2 className="pb-1.5 font-serif text-lg font-semibold tracking-tight">
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
            Sponsor someone
          </Link>
        </p>
      )}
    </section>
  )
}
