/**
 * Cache tags for the shared-data server cache (see `lib/cache/cached-read.ts`).
 *
 * A cached reader is tagged with every tag whose write could change its
 * result; a write calls `updateTag` for each tag it affects. Every per-record
 * tag comes with its table-wide tag (`weekends`, `events`, ...) so a write
 * that cannot cheaply name the record (or that touches several, like
 * activating a group) can clear the whole table's readers.
 */
export const TAGS = {
  /** Any row of `weekends` / `weekend_groups` (status, dates, numbers). */
  weekends: 'weekends',
  weekendGroup: (groupId: string) => `weekend-group:${groupId}`,
  /** Any row of `events`. */
  events: 'events',
  eventsForGroup: (groupId: string) => `events:group:${groupId}`,
  /** The `roles` table (permissions and the inheritance graph). */
  roles: 'roles',
  /** The `site_settings` table. */
  settings: 'settings',
  /** The fee columns of `weekend_groups`. */
  groupFees: 'group-fees',
} as const

/** Tags of a reader keyed by one weekend group. */
export function weekendGroupTags(groupId: string): string[] {
  return [TAGS.weekends, TAGS.weekendGroup(groupId)]
}

/** Tags of a reader of one group's events. */
export function eventsForGroupTags(groupId: string): string[] {
  return [TAGS.events, TAGS.eventsForGroup(groupId)]
}

/** Tags of a reader of one group's fees. */
export function groupFeesTags(groupId: string): string[] {
  return [TAGS.groupFees, TAGS.weekendGroup(groupId)]
}
