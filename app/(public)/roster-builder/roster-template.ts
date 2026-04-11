import { CHARole, Rollo } from '@/lib/weekend/types'

/**
 * A single slot in the default roster template.
 * These are ephemeral — not stored in the database.
 */
export type TemplateSlot = {
  role: CHARole
  rollo?: Rollo | null
  required: boolean
}

/**
 * A category in the roster template.
 */
export type TemplateCategory = {
  name: string
  slots: TemplateSlot[]
}

/**
 * Default roster template for a weekend.
 * The rector can customize by adding/removing slots at runtime.
 */
export const DEFAULT_ROSTER_TEMPLATE: TemplateCategory[] = [
  {
    name: 'Leadership',
    slots: [
      { role: CHARole.RECTOR, required: true },
      { role: CHARole.BACKUP_RECTOR, required: true },
      { role: CHARole.HEAD, required: true },
      { role: CHARole.ASSISTANT_HEAD, required: true },
      { role: CHARole.ROVER, required: false },
    ],
  },
  {
    name: 'Table Leaders',
    slots: [
      { role: CHARole.HEAD_ROLLISTA, required: true },
      { role: CHARole.TABLE_LEADER, rollo: Rollo.IDEALS, required: true },
      { role: CHARole.TABLE_LEADER, rollo: Rollo.CHURCH, required: true },
      { role: CHARole.TABLE_LEADER, rollo: Rollo.PIETY, required: true },
      { role: CHARole.TABLE_LEADER, rollo: Rollo.STUDY, required: true },
      { role: CHARole.TABLE_LEADER, rollo: Rollo.ACTION, required: true },
      { role: CHARole.TABLE_LEADER, rollo: Rollo.LEADERS, required: true },
      {
        role: CHARole.TABLE_LEADER,
        rollo: Rollo.ENVIRONMENTS,
        required: true,
      },
      { role: CHARole.TABLE_LEADER, rollo: Rollo.CCIA, required: true },
      {
        role: CHARole.TABLE_LEADER,
        rollo: Rollo.REUNION_GROUP,
        required: true,
      },
      { role: CHARole.TABLE_LEADER, required: true },
      { role: CHARole.TABLE_LEADER, required: true },
      { role: CHARole.TABLE_LEADER, required: true },
    ],
  },
  {
    name: 'Spiritual',
    slots: [
      { role: CHARole.HEAD_SPIRITUAL_DIRECTOR, required: true },
      { role: CHARole.SPIRITUAL_DIRECTOR, required: true },
      { role: CHARole.SPIRITUAL_DIRECTOR, required: true },
      { role: CHARole.SPIRITUAL_DIRECTOR_TRAINEE, required: false },
    ],
  },
  {
    name: 'Prayer',
    slots: [
      { role: CHARole.HEAD_PRAYER, required: true },
      { role: CHARole.PRAYER, required: true },
      { role: CHARole.PRAYER, required: true },
    ],
  },
  {
    name: 'Chapel',
    slots: [
      { role: CHARole.HEAD_CHAPEL, required: true },
      { role: CHARole.CHAPEL, required: true },
      { role: CHARole.CHAPEL, required: true },
      { role: CHARole.HEAD_CHAPEL_TECH, required: true },
    ],
  },
  {
    name: 'Music',
    slots: [
      { role: CHARole.HEAD_MUSIC, required: true },
      { role: CHARole.MUSIC, required: true },
      { role: CHARole.MUSIC, required: true },
    ],
  },
  {
    name: 'Tech',
    slots: [
      { role: CHARole.HEAD_TECH, required: true },
      { role: CHARole.TECH, required: true },
      { role: CHARole.TECH, required: false },
    ],
  },
  {
    name: 'Palanca',
    slots: [
      { role: CHARole.HEAD_PALANCA, required: true },
      { role: CHARole.PALANCA, required: true },
      { role: CHARole.PALANCA, required: true },
    ],
  },
  {
    name: 'Table',
    slots: [
      { role: CHARole.HEAD_TABLE, required: true },
      { role: CHARole.TABLE, required: true },
    ],
  },
  {
    name: 'Dorm',
    slots: [
      { role: CHARole.HEAD_DORM, required: true },
      { role: CHARole.DORM, required: true },
      { role: CHARole.DORM, required: false },
    ],
  },
  {
    name: 'Dining & Food',
    slots: [
      { role: CHARole.HEAD_DINING, required: true },
      { role: CHARole.DINING, required: true },
      { role: CHARole.DINING, required: true },
      { role: CHARole.MEAT, required: true },
    ],
  },
  {
    name: 'Mobile',
    slots: [
      { role: CHARole.HEAD_MOBILE, required: true },
      { role: CHARole.MOBILE, required: true },
      { role: CHARole.ESCORT, required: true },
      { role: CHARole.FLOATER, required: true },
      { role: CHARole.ROSTER, required: true },
      { role: CHARole.GOPHER, required: true },
      { role: CHARole.MEDIC, required: true },
      { role: CHARole.SMOKER, required: true },
    ],
  },
]

/**
 * Returns the list of CHA roles that belong to a given category.
 * Useful for the "Add Position" dropdown.
 */
export function getRolesForCategory(categoryName: string): CHARole[] {
  const category = DEFAULT_ROSTER_TEMPLATE.find((c) => c.name === categoryName)
  if (category == null) return []

  // Collect unique roles from the template slots for this category
  const roles = new Set<CHARole>()
  for (const slot of category.slots) {
    roles.add(slot.role)
  }
  return Array.from(roles)
}
