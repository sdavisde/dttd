import type { WeekendRosterMember } from '@/services/weekend'
import { CHARole } from '@/lib/weekend/types'
import { isNil, isEmpty } from 'lodash'

type PrintableRosterProps = {
  roster: Array<WeekendRosterMember>
  weekendTitle: string
  startDate: string
  endDate: string
  /** Whether to include the payment/status column */
  includePaymentInformation?: boolean
  /** Whether to include the emergency contact column */
  includeEmergencyContact?: boolean
  /** Whether to include the special needs column */
  includeSpecialNeeds?: boolean
  /** Whether to include the team forms column */
  includeTeamFormInfo?: boolean
}

const getRoleSortOrder = (role: string | null) => {
  if (isNil(role)) return 999
  const index = Object.values(CHARole).indexOf(role as CHARole)
  return index === -1 ? 998 : index
}

const formatName = (member: WeekendRosterMember) => {
  if (!isNil(member.users?.first_name) && !isNil(member.users?.last_name)) {
    return `${member.users.first_name} ${member.users.last_name}`
  }
  return 'Unknown User'
}

const formatRole = (member: WeekendRosterMember) => {
  const role = member.cha_role ?? '-'
  return isNil(member.rollo) ? role : `${role} - ${member.rollo}`
}

/**
 * Print-only roster. Hidden on screen and revealed by the `@media print`
 * rules in globals.css. Renders every active team member (no pagination) so
 * the printed sheet always contains the full roster, and only includes the
 * columns the viewing user has permission to see (driven by the same flags
 * the on-screen table uses).
 */
export function PrintableRoster({
  roster,
  weekendTitle,
  startDate,
  endDate,
  includePaymentInformation = false,
  includeEmergencyContact = false,
  includeSpecialNeeds = false,
  includeTeamFormInfo = false,
}: PrintableRosterProps) {
  const members = roster
    .filter((member) => member.status !== 'drop')
    .sort((a, b) => getRoleSortOrder(a.cha_role) - getRoleSortOrder(b.cha_role))

  const printedOn = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div id="roster-print-area" className="hidden print:block">
      <div className="roster-print-header">
        <h1>{weekendTitle}</h1>
        <p>
          {startDate} – {endDate}
        </p>
        <p>
          Team Roster · {members.length} members · Printed {printedOn}
        </p>
      </div>

      <table className="roster-print-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Email</th>
            <th>Phone</th>
            {includeEmergencyContact && <th>Emergency Contact</th>}
            {includeSpecialNeeds && <th>Special Needs</th>}
            {includeTeamFormInfo && <th>Forms</th>}
            {includePaymentInformation && <th>Payment</th>}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{formatName(member)}</td>
              <td>{formatRole(member)}</td>
              <td>{member.users?.email ?? '-'}</td>
              <td>{member.users?.phone_number ?? '-'}</td>
              {includeEmergencyContact && (
                <td>
                  {isNil(member.medical_profile?.emergency_contact_name)
                    ? '-'
                    : `${member.medical_profile.emergency_contact_name}${
                        isNil(member.medical_profile.emergency_contact_phone)
                          ? ''
                          : ` · ${member.medical_profile.emergency_contact_phone}`
                      }`}
                </td>
              )}
              {includeSpecialNeeds && (
                <td>
                  {isNil(member.special_needs) || isEmpty(member.special_needs)
                    ? '-'
                    : member.special_needs}
                </td>
              )}
              {includeTeamFormInfo && (
                <td>{member.forms_complete ? 'Complete' : 'Incomplete'}</td>
              )}
              {includePaymentInformation && (
                <td>{member.paymentSummary.status}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
