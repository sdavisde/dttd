import { Permission } from '@/lib/security'

/**
 * The single source of truth for how the Security page groups permissions.
 *
 * Every `Permission` enum value belongs to exactly one of:
 *   - a ladder rung (an area with No access / View / Manage),
 *   - the sensitive panel (individual switches, off by default),
 *   - the access switch (READ_ADMIN_PORTAL), or
 *   - the quarantined Full Access card (FULL_ACCESS).
 *
 * `permission-areas.test.ts` proves that partition holds, so adding a new
 * permission to the enum without placing it here fails the suite.
 */

export type LadderId =
  | 'candidates'
  | 'weekends'
  | 'team-rosters'
  | 'payments'
  | 'files'
  | 'people'

export type PermissionLadder = {
  id: LadderId
  label: string
  /** One plain-language line under the ladder name. */
  helper: string
  /** Permissions the View rung grants. Empty when viewing needs no permission. */
  view: readonly Permission[]
  /** Permissions Manage adds on top of View. */
  manage: readonly Permission[]
  /**
   * When true the View rung needs no permission at all (everyone can view),
   * so the ladder has only two real states: "Everyone can view" and Manage.
   */
  implicitView?: boolean
}

export const PERMISSION_LADDERS: readonly PermissionLadder[] = [
  {
    id: 'candidates',
    label: 'Candidates',
    helper:
      'Applications, sponsor details, church, shirt size, and fee status. Manage adds editing and removing candidates.',
    view: [
      Permission.READ_CANDIDATES,
      Permission.READ_CANDIDATE_CONTACT_INFO,
      Permission.READ_CANDIDATE_CHURCH,
      Permission.READ_CANDIDATE_SHIRT_SIZE,
      Permission.READ_CANDIDATE_MARITAL_STATUS,
      Permission.READ_CANDIDATE_TABLE_ASSIGNMENT_PROPERTIES,
      Permission.READ_CANDIDATE_SPONSOR_INFO,
      Permission.READ_CANDIDATE_PAYMENTS,
    ],
    manage: [Permission.WRITE_CANDIDATES, Permission.DELETE_CANDIDATES],
  },
  {
    id: 'weekends',
    label: 'Weekends & events',
    helper:
      'The weekend calendar and community events. Manage adds creating and editing them.',
    view: [Permission.READ_WEEKENDS, Permission.READ_EVENTS],
    manage: [Permission.WRITE_WEEKENDS, Permission.WRITE_EVENTS],
  },
  {
    id: 'team-rosters',
    label: 'Team rosters',
    helper:
      'The roster builder, dropped members, and team forms. Manage adds editing the roster and team fees.',
    view: [
      Permission.READ_TEAM_ROSTER_BUILDER,
      Permission.READ_DROPPED_ROSTER,
      Permission.READ_TEAM_FORM_INFO,
    ],
    manage: [Permission.WRITE_TEAM_ROSTER, Permission.READ_WRITE_TEAM_PAYMENTS],
  },
  {
    id: 'payments',
    label: 'Payments',
    helper:
      'The payment ledger. Manage adds recording, editing, and voiding payments.',
    view: [Permission.READ_PAYMENTS],
    manage: [Permission.WRITE_PAYMENTS],
  },
  {
    id: 'files',
    label: 'Files',
    helper:
      'Everyone in the community can already see files. Manage lets this role upload and delete them.',
    view: [],
    manage: [Permission.FILES_UPLOAD, Permission.FILES_DELETE],
    implicitView: true,
  },
  {
    id: 'people',
    label: 'People, community & settings',
    helper:
      'Who holds which role and their experience. Manage adds assigning roles, site settings, and the community encouragement note.',
    view: [Permission.READ_USER_ROLES, Permission.READ_USER_EXPERIENCE],
    manage: [
      Permission.WRITE_USER_ROLES,
      Permission.WRITE_SETTINGS,
      Permission.WRITE_COMMUNITY_ENCOURAGEMENT,
    ],
  },
]

export type SensitivePermission = {
  permission: Permission
  label: string
  helper: string
}

/** Candidate personal details — individual switches, off unless deliberately granted. */
export const SENSITIVE_PERMISSIONS: readonly SensitivePermission[] = [
  {
    permission: Permission.READ_CANDIDATE_MEDICAL_INFO,
    label: 'Medical information & allergies',
    helper:
      'Needed by the Medic and weekend leadership — conditions, medications, dietary needs.',
  },
  {
    permission: Permission.READ_CANDIDATE_EMERGENCY_CONTACT,
    label: 'Emergency contacts',
    helper: 'Who to call during the weekend.',
  },
  {
    permission: Permission.READ_CANDIDATE_ADDRESS,
    label: 'Home address',
    helper: 'Needed for mailing palanca and welcome letters.',
  },
]

/** The switch at the top of the editor: without it none of the areas are reachable in Admin. */
export const ADMIN_ACCESS_PERMISSION = Permission.READ_ADMIN_PORTAL

/** Quarantined in its own card with the "never fewer than two" guidance. */
export const FULL_ACCESS_PERMISSION = Permission.FULL_ACCESS

/**
 * Plain-language names for individual permissions. Only surfaced when a role
 * holds a set that does not land on a rung ("Custom"), so the admin can see
 * exactly what is extra or missing without reading enum names.
 */
export const PERMISSION_LABELS: Readonly<Record<Permission, string>> = {
  [Permission.FILES_UPLOAD]: 'Upload files',
  [Permission.FILES_DELETE]: 'Delete files',
  [Permission.READ_USER_EXPERIENCE]: 'See experience levels',
  [Permission.READ_CANDIDATES]: 'See candidates',
  [Permission.WRITE_CANDIDATES]: 'Edit candidates',
  [Permission.DELETE_CANDIDATES]: 'Remove candidates',
  [Permission.READ_DROPPED_ROSTER]: 'See dropped team members',
  [Permission.WRITE_TEAM_ROSTER]: 'Edit the team roster',
  [Permission.READ_TEAM_ROSTER_BUILDER]: 'Open the roster builder',
  [Permission.READ_WRITE_TEAM_PAYMENTS]: 'Manage team fees',
  [Permission.READ_WEEKENDS]: 'See weekends',
  [Permission.WRITE_WEEKENDS]: 'Edit weekends',
  [Permission.READ_EVENTS]: 'See events',
  [Permission.WRITE_EVENTS]: 'Edit events',
  [Permission.READ_PAYMENTS]: 'See payments',
  [Permission.WRITE_PAYMENTS]: 'Record and edit payments',
  [Permission.WRITE_USER_ROLES]: 'Assign roles and edit what roles can do',
  [Permission.READ_USER_ROLES]: 'See who holds which role',
  [Permission.FULL_ACCESS]: 'Full access',
  [Permission.READ_ADMIN_PORTAL]: 'Open the admin area',
  [Permission.WRITE_COMMUNITY_ENCOURAGEMENT]:
    'Edit the community encouragement',
  [Permission.WRITE_SETTINGS]: 'Change site settings',
  [Permission.READ_CANDIDATE_CONTACT_INFO]: 'See candidate contact details',
  [Permission.READ_CANDIDATE_ADDRESS]: 'See candidate home address',
  [Permission.READ_CANDIDATE_SHIRT_SIZE]: 'See candidate shirt size',
  [Permission.READ_CANDIDATE_MEDICAL_INFO]: 'See candidate medical information',
  [Permission.READ_CANDIDATE_EMERGENCY_CONTACT]:
    'See candidate emergency contacts',
  [Permission.READ_CANDIDATE_MARITAL_STATUS]: 'See candidate marital status',
  [Permission.READ_CANDIDATE_TABLE_ASSIGNMENT_PROPERTIES]:
    'See candidate table-assignment details',
  [Permission.READ_CANDIDATE_SPONSOR_INFO]: 'See candidate sponsor details',
  [Permission.READ_CANDIDATE_CHURCH]: 'See candidate church',
  [Permission.READ_CANDIDATE_PAYMENTS]: 'See candidate fee status',
  [Permission.READ_TEAM_FORM_INFO]: 'See team form submissions',
}

/** Everything a ladder can grant (View ∪ Manage). */
export function ladderPermissions(ladder: PermissionLadder): Permission[] {
  return [...ladder.view, ...ladder.manage]
}

/** Every permission the grouping accounts for, in display order. */
export function allGroupedPermissions(): Permission[] {
  return [
    ADMIN_ACCESS_PERMISSION,
    ...PERMISSION_LADDERS.flatMap(ladderPermissions),
    ...SENSITIVE_PERMISSIONS.map((s) => s.permission),
    FULL_ACCESS_PERMISSION,
  ]
}
