import { Typography } from '@/components/ui/typography'

/**
 * The Tanglewood Christian Camp "Waiver of Claim" legal text. Shared between the
 * team-member camp waiver step and the candidate intake form so the wording stays
 * identical in both places.
 */
export function CampWaiverText() {
  return (
    <div className="bg-muted/30 p-6 rounded-lg border space-y-4 text-sm">
      <Typography variant="p">
        This Waiver of Claim (the “Waiver”) is given for the following purposes:
      </Typography>
      <ol className="list-decimal pl-5 space-y-2">
        <li>
          <Typography variant="p">
            I hereby desire to participate in various activities while on or
            about the premises of Tanglewood Christian Camp in Tanglewood, TX
            without any supervision supplied by Tanglewood Christian Camp.
          </Typography>
        </li>
        <li>
          <Typography variant="p">
            I recognize that although the odds of serious injury or death is
            low, nevertheless, a body that slips or falls may have a reaction to
            the immediate injury or the treatment for such injury that results
            in a medical condition that could lead to serious injury or death.
          </Typography>
        </li>
        <li>
          <Typography variant="p">
            I agree that in exchange for Tanglewood Christian Camp allowing me
            to participate in the activities on the premises that I in my
            individual capacities will not assert or pursue a claim for personal
            injury against Tanglewood Christian Camp or any person or entity or
            fellow participant that conducts or participates in any activity on
            the premises. More specifically, I hereby WAIVE and RENOUNCE and
            RELEASE any claim for personal injury suffered by me during
            activities regardless of the cause of the injury, that is,
            regardless of whether the injury is caused by participating in the/a
            planned activity or injury caused by movement on the premises or the
            mere going to and from the site where the activity takes place and
            regardless of whether the injury is caused by the negligence of any
            person or entity involved in the activity or the condition of the
            premises where the activity takes place SAVE and EXCEPT injury
            caused by gross negligence of Tanglewood Christian Camp acting
            through its agents, servants, employees, officers, directors or
            owners.
          </Typography>
        </li>
        <li>
          <Typography variant="p">
            I agree that if any claim is brought by any participant against
            Tanglewood Christian Camp or any employee, agent, owner, director or
            officer of Tanglewood Christian Camp because of my actions or
            omissions while participating in activities on the premises of
            Tanglewood Christian Camp, I shall INDEMNIFY and HOLD HARMLESS
            Tanglewood Christian Camp, its employees, agents, owners, officers
            and directors from and against any such claim including the duty to
            investigate, defend and pay on the part of Tanglewood Christian
            Camp.
          </Typography>
        </li>
        <li>
          <Typography variant="p">
            Texas law governs the interpretation and enforcement of this Waiver.
            Venue of any dispute will be in the county where Tanglewood
            Christian Camp is located. Any claim shall be first discussed among
            the claimant(s) and Tanglewood Christian Camp before any suit if
            filed by way of face-to-face meeting on the premises, and
            thereafter, by way of non-binding mediation BEFORE suit to interpret
            or enforce is filed.
          </Typography>
        </li>
      </ol>
    </div>
  )
}
