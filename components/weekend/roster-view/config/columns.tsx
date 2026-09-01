'use client'

import type { ColumnDef, FilterFn, SortingFn } from '@tanstack/react-table'
import { Row } from '@tanstack/react-table'
import type { TeamFormSummary, WeekendRosterMember } from '@/services/weekend'
import { getRoleSortOrder } from '@/lib/weekend/roster-utils'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit, Stethoscope } from 'lucide-react'
import { PaymentInfo } from '../payment-info'
import '@/components/ui/data-table/types'
import { isEmpty, isNil } from 'lodash'
import { UserAvatarWithPreview } from '@/components/user-avatar'
import { formatDateOnly } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Role sorting helper
// ---------------------------------------------------------------------------

const roleSortingFn: SortingFn<WeekendRosterMember> = (rowA, rowB) => {
  const a = getRoleSortOrder(rowA.original.cha_role)
  const b = getRoleSortOrder(rowB.original.cha_role)
  return a - b
}

// ---------------------------------------------------------------------------
// Payment category helper
// ---------------------------------------------------------------------------

function getPaymentCategory(member: WeekendRosterMember): string {
  return member.paymentSummary.status
}

// ---------------------------------------------------------------------------
// Team form summary helpers
// ---------------------------------------------------------------------------

function formatSummaryAddress(
  address: TeamFormSummary['address']
): string | null {
  if (isNil(address)) return null
  const street =
    !isNil(address.addressLine2) && address.addressLine2 !== ''
      ? `${address.addressLine1}, ${address.addressLine2}`
      : address.addressLine1
  return `${street}, ${address.city}, ${address.state} ${address.zip}`
}

function formatExperienceSummary(
  experience: TeamFormSummary['experience'] | undefined
): string | null {
  if (isNil(experience) || isEmpty(experience)) return null
  const last = experience[experience.length - 1]
  const label = experience.length === 1 ? 'weekend' : 'weekends'
  return `${experience.length} ${label} · last: ${last.chaRole}`
}

function formatExperienceDetail(
  experience: TeamFormSummary['experience'] | undefined
): string | undefined {
  if (isNil(experience) || isEmpty(experience)) return undefined
  return experience
    .map(
      (entry) =>
        `${entry.weekendReference} — ${entry.chaRole}${
          !isNil(entry.rollo) ? ` (${entry.rollo})` : ''
        }`
    )
    .join('\n')
}

const dashCell = <span className="text-muted-foreground">-</span>

// ---------------------------------------------------------------------------
// Weekend Roster Columns (with callbacks)
// ---------------------------------------------------------------------------

export interface WeekendRosterColumnCallbacks {
  onEdit: (member: WeekendRosterMember) => void
  onMedical: (member: WeekendRosterMember) => void
  isEditable: boolean
}

export function getWeekendRosterColumns(
  callbacks: WeekendRosterColumnCallbacks
): ColumnDef<WeekendRosterMember>[] {
  return [
    {
      id: 'name',
      accessorFn: (m) => {
        if (!isNil(m.users?.first_name) && !isNil(m.users?.last_name)) {
          return `${m.users!.first_name} ${m.users!.last_name}`
        }
        return 'Unknown User'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ getValue, row }) => {
        const u = row.original.users
        return (
          <div className="flex items-center gap-2">
            {!isNil(u) && (
              <UserAvatarWithPreview
                user={{
                  id: u.id,
                  first_name: u.first_name,
                  last_name: u.last_name,
                  email: u.email,
                  profilePhoto: {
                    path: u.profile_photo_path,
                    updatedAt: u.profile_photo_updated_at,
                  },
                }}
                size={28}
              />
            )}
            <span className="font-medium">{getValue<string>()}</span>
          </div>
        )
      },
      meta: {
        showOnMobile: true,
        mobileLabel: 'Name',
        mobilePriority: 'primary',
      },
    },
    {
      id: 'email',
      accessorFn: (m) => m.users?.email ?? null,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {getValue<string | null>() ?? '-'}
        </span>
      ),
      meta: {
        showOnMobile: true,
        mobileLabel: 'Email',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'phone',
      accessorFn: (m) => m.users?.phone_number ?? null,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {getValue<string | null>() ?? '-'}
        </span>
      ),
      meta: {
        showOnMobile: true,
        mobileLabel: 'Phone',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'church',
      accessorFn: (m) => m.users?.church_affiliation ?? null,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Church" />
      ),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {getValue<string | null>() ?? '-'}
        </span>
      ),
      meta: {
        filterType: 'select',
        showOnMobile: true,
        mobileLabel: 'Church',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'role',
      accessorFn: (m) => m.cha_role,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const member = row.original
        return (
          <div>
            <span>{member.cha_role ?? '-'}</span>
            {!isNil(member.rollo) && (
              <span className="ms-1">- {member.rollo}</span>
            )}
          </div>
        )
      },
      sortingFn: roleSortingFn,
      meta: {
        filterType: 'select',
        showOnMobile: true,
        mobileLabel: 'Role',
        mobilePriority: 'secondary',
      },
    },
    {
      id: 'forms',
      accessorFn: (m) => (m.forms_complete ? 'Complete' : 'Incomplete'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Forms" />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.forms_complete}
          disabled
          aria-label={
            row.original.forms_complete
              ? 'Team forms completed'
              : 'Team forms incomplete'
          }
        />
      ),
      meta: {
        filterType: 'select',
        showOnMobile: true,
        mobileLabel: 'Forms',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'team_forms',
      header: 'Team Forms',
      meta: {
        expandableGroup: {
          label: 'Team Forms',
          summaryColumnId: 'team_form_info',
        },
      },
      columns: [
        {
          id: 'team_form_info',
          accessorFn: (m) => (m.forms_complete ? 'Complete' : 'Incomplete'),
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
          ),
          cell: ({ row }) =>
            row.original.forms_complete ? (
              <Badge
                variant="outline"
                className="border-green-600/40 bg-green-600/10 text-green-700 dark:text-green-400"
              >
                Complete
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-600/40 bg-amber-600/10 text-amber-700 dark:text-amber-400"
              >
                Incomplete
              </Badge>
            ),
          meta: {
            filterType: 'select',
            showOnMobile: true,
            mobileLabel: 'Team Forms',
            mobilePriority: 'detail',
          },
        },
        {
          id: 'tf_weekend_attended',
          accessorFn: (m) => m.team_form_summary?.weekendAttended ?? null,
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Weekend Attended" />
          ),
          cell: ({ getValue }) => getValue<string | null>() ?? dashCell,
          meta: {
            filterType: 'select',
            showOnMobile: true,
            mobileLabel: 'Weekend Attended',
            mobilePriority: 'detail',
          },
        },
        {
          id: 'tf_essentials_training',
          accessorFn: (m) =>
            m.team_form_summary?.essentialsTrainingDate ?? null,
          header: ({ column }) => (
            <DataTableColumnHeader
              column={column}
              title="Essentials Training"
            />
          ),
          cell: ({ getValue }) => {
            const date = getValue<string | null>()
            return isNil(date) ? dashCell : formatDateOnly(date)
          },
          meta: {
            showOnMobile: true,
            mobileLabel: 'Essentials',
            mobilePriority: 'detail',
          },
        },
        {
          id: 'tf_gifts_skills',
          accessorFn: (m) =>
            m.team_form_summary?.specialGiftsAndSkills?.join(', ') ?? null,
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Gifts & Skills" />
          ),
          cell: ({ row }) => {
            const skills = row.original.team_form_summary?.specialGiftsAndSkills
            if (isNil(skills) || isEmpty(skills)) {
              return dashCell
            }
            return (
              <div className="flex max-w-56 flex-wrap gap-1">
                {skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            )
          },
          enableSorting: false,
          meta: {
            showOnMobile: true,
            mobileLabel: 'Gifts & Skills',
            mobilePriority: 'detail',
          },
        },
        {
          id: 'tf_address',
          accessorFn: (m) =>
            formatSummaryAddress(m.team_form_summary?.address ?? null),
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Address" />
          ),
          cell: ({ getValue }) => {
            const address = getValue<string | null>()
            return isNil(address) ? (
              dashCell
            ) : (
              <span className="text-muted-foreground">{address}</span>
            )
          },
          enableSorting: false,
          meta: {
            showOnMobile: true,
            mobileLabel: 'Address',
            mobilePriority: 'detail',
          },
        },
        {
          id: 'tf_experience',
          accessorFn: (m) =>
            formatExperienceSummary(m.team_form_summary?.experience),
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Experience" />
          ),
          cell: ({ getValue, row }) => {
            const summary = getValue<string | null>()
            return isNil(summary) ? (
              dashCell
            ) : (
              <span
                title={formatExperienceDetail(
                  row.original.team_form_summary?.experience
                )}
              >
                {summary}
              </span>
            )
          },
          enableSorting: false,
          meta: {
            showOnMobile: true,
            mobileLabel: 'Experience',
            mobilePriority: 'detail',
          },
        },
      ],
    },
    {
      id: 'emergency',
      accessorFn: (m) => m.medical_profile?.emergency_contact_name ?? null,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Emergency Contact" />
      ),
      cell: ({ row }) => {
        const profile = row.original.medical_profile
        if (isNil(profile?.emergency_contact_name)) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <div className="text-sm">
            <div>{profile.emergency_contact_name}</div>
            <div className="text-muted-foreground">
              {profile.emergency_contact_phone ?? '-'}
            </div>
          </div>
        )
      },
      meta: {
        showOnMobile: true,
        mobileLabel: 'Emergency Contact',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'special_needs',
      accessorFn: (m) => (!isNil(m.special_needs) ? 'Yes' : 'None'),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Special Needs" />
      ),
      cell: ({ row }) => {
        const member = row.original
        if (isNil(member.special_needs) || isEmpty(member.special_needs)) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => callbacks.onMedical(member)}
              aria-label="View special needs"
            >
              <Stethoscope className="h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false,
      meta: {
        filterType: 'select',
        showOnMobile: true,
        mobileLabel: 'Special Needs',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'payment',
      accessorFn: getPaymentCategory,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment" />
      ),
      cell: ({ row }) => {
        const member = row.original
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <PaymentInfo member={member} isEditable={callbacks.isEditable} />
          </div>
        )
      },
      meta: {
        filterType: 'select',
        showOnMobile: true,
        mobileLabel: 'Payment',
        mobilePriority: 'detail',
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const member = row.original
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => callbacks.onEdit(member)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )
      },
      enableSorting: false,
      meta: {
        showOnMobile: false,
      },
    },
  ]
}

// ---------------------------------------------------------------------------
// Dropped Roster Columns (static)
// ---------------------------------------------------------------------------

export const droppedRosterColumns: ColumnDef<WeekendRosterMember>[] = [
  {
    id: 'name',
    accessorFn: (m) => {
      if (!isNil(m.users?.first_name) && !isNil(m.users?.last_name)) {
        return `${m.users!.first_name} ${m.users!.last_name}`
      }
      return 'Unknown User'
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ getValue, row }) => {
      const u = row.original.users
      return (
        <div className="flex items-center gap-2">
          {!isNil(u) && (
            <UserAvatarWithPreview
              user={{
                id: u.id,
                first_name: u.first_name,
                last_name: u.last_name,
                email: u.email,
                profilePhoto: {
                  path: u.profile_photo_path,
                  updatedAt: u.profile_photo_updated_at,
                },
              }}
              size={28}
            />
          )}
          <span className="font-medium">{getValue<string>()}</span>
        </div>
      )
    },
    meta: {
      showOnMobile: true,
      mobileLabel: 'Name',
      mobilePriority: 'primary',
    },
  },
  {
    id: 'email',
    accessorFn: (m) => m.users?.email ?? null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {getValue<string | null>() ?? '-'}
      </span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Email',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'phone',
    accessorFn: (m) => m.users?.phone_number ?? null,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {getValue<string | null>() ?? '-'}
      </span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Phone',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'role',
    accessorFn: (m) => m.cha_role,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string | null>() ?? '-'}</span>
    ),
    sortingFn: roleSortingFn,
    meta: {
      showOnMobile: true,
      mobileLabel: 'Role',
      mobilePriority: 'secondary',
    },
  },
  {
    id: 'rollo',
    accessorFn: (m) => m.rollo,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rollo" />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {getValue<string | null>() ?? '-'}
      </span>
    ),
    meta: {
      showOnMobile: true,
      mobileLabel: 'Rollo',
      mobilePriority: 'detail',
    },
  },
  {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: () => <Badge variant="destructive">Dropped</Badge>,
    enableSorting: false,
    meta: {
      showOnMobile: true,
      mobileLabel: 'Status',
      mobilePriority: 'secondary',
    },
  },
]

// ---------------------------------------------------------------------------
// Global filter function (shared by both tables)
// ---------------------------------------------------------------------------

export const rosterGlobalFilterFn: FilterFn<WeekendRosterMember> = (
  row,
  _columnId,
  filterValue
) => {
  const query = (filterValue as string).toLowerCase().trim()
  if (query === '') return true

  const member = row.original
  const name =
    `${member.users?.first_name ?? ''} ${member.users?.last_name ?? ''}`.toLowerCase()
  const email = (member.users?.email ?? '').toLowerCase()
  const phone = (member.users?.phone_number ?? '').toLowerCase()
  const role = (member.cha_role ?? '').toLowerCase()
  const status = (member.status ?? '').toLowerCase()
  const rollo = (member.rollo ?? '').toLowerCase()
  const church = (member.users?.church_affiliation ?? '').toLowerCase()

  // Team form summary fields (present only for permitted viewers)
  const summary = member.team_form_summary
  const weekendAttended = (summary?.weekendAttended ?? '').toLowerCase()
  const skills = (summary?.specialGiftsAndSkills ?? []).join(' ').toLowerCase()
  const address = (
    formatSummaryAddress(summary?.address ?? null) ?? ''
  ).toLowerCase()
  const experience = (summary?.experience ?? [])
    .map((entry) => `${entry.chaRole} ${entry.weekendReference}`)
    .join(' ')
    .toLowerCase()

  return (
    name.includes(query) ||
    email.includes(query) ||
    phone.includes(query) ||
    role.includes(query) ||
    status.includes(query) ||
    rollo.includes(query) ||
    church.includes(query) ||
    weekendAttended.includes(query) ||
    skills.includes(query) ||
    address.includes(query) ||
    experience.includes(query)
  )
}
