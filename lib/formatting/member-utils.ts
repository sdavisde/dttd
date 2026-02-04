/**
 * Formats a member's name from first and last name parts.
 * Returns "Unknown User" if both names are empty/null.
 */
export function formatMemberName(member: {
  firstName?: string | null
  lastName?: string | null
}): string {
  return (
    `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() ||
    'Unknown User'
  )
}
