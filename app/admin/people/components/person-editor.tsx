'use client'

import { useState, type FocusEvent } from 'react'
import { isNil } from 'lodash'
import { X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { AutoSaveStatusIndicator } from '@/components/auto-save/auto-save-status'
import { Permission, userHasPermission } from '@/lib/security'
import { useSession } from '@/components/auth/session-provider'
import { UserAvatar } from '@/components/user-avatar'
import { isDevMode } from '@/lib/dev-mode'
import { cn } from '@/lib/utils'
import { parseCommunityWeekendRef } from '@/lib/weekend'
import type { MasterRosterMember } from '@/services/master-roster/types'
import { useUserEditForm } from '../hooks/use-user-edit-form'
import { useIsDesktop } from '../hooks/use-is-desktop'
import { formatServedSummary } from '../lib/served-summary'
import { EditorSectionCard } from './editor-section-card'
import { ContactInfoSection } from './contact-info-section'
import { AddressEditSection } from './address-edit-section'
import { CommunityInfoSection } from './community-info-section'
import { SkillsEditSection } from './skills-edit-section'
import { ExperienceEditSection } from './experience-edit-section'
import { RolesEditSection } from './roles-edit-section'

interface PersonEditorProps {
  member: MasterRosterMember | null
  roles: Array<{ id: string; label: string; permissions: string[] }>
  isOpen: boolean
  onClose: () => void
  canEdit: boolean
}

/**
 * The per-person editor from the People board: a 400px panel beside the table
 * on `xl+`, and the same content in a right-side sheet on narrower screens.
 * Only one of the two is ever mounted, so the form state is never duplicated.
 */
export function PersonEditor({
  member,
  roles,
  isOpen,
  onClose,
  canEdit,
}: PersonEditorProps) {
  const { user: currentUser } = useSession()
  const isDesktop = useIsDesktop()

  const showSecuritySettings =
    !isNil(currentUser) &&
    userHasPermission(currentUser, [Permission.WRITE_USER_ROLES])
  const showExperience =
    !isNil(currentUser) &&
    userHasPermission(currentUser, [Permission.READ_USER_EXPERIENCE])

  const showInlinePanel = isDesktop && isOpen && !isNil(member)

  return (
    <>
      {showInlinePanel && (
        <aside className="hidden w-[400px] shrink-0 xl:block">
          <div className="sticky top-6 flex max-h-[calc(100vh-7rem)] flex-col rounded-md border bg-card px-5 py-4">
            <PersonEditorBody
              key={member.id}
              variant="panel"
              member={member}
              canEdit={canEdit}
              showExperience={showExperience}
              showSecuritySettings={showSecuritySettings}
              onClose={onClose}
              roles={roles}
            />
          </div>
        </aside>
      )}

      <Sheet open={isOpen && !isDesktop} onOpenChange={onClose}>
        <SheetContent className="gap-0 px-5 py-4 sm:max-w-lg">
          {isNil(member) ? (
            <>
              <SheetTitle>No person selected</SheetTitle>
              <SheetDescription className="sr-only">
                Nothing to edit.
              </SheetDescription>
            </>
          ) : (
            <PersonEditorBody
              key={member.id}
              variant="sheet"
              member={member}
              canEdit={canEdit}
              showExperience={showExperience}
              showSecuritySettings={showSecuritySettings}
              onClose={onClose}
              roles={roles}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

// ---------------------------------------------------------------------------

interface PersonEditorBodyProps {
  variant: 'panel' | 'sheet'
  member: MasterRosterMember
  canEdit: boolean
  showExperience: boolean
  showSecuritySettings: boolean
  onClose: () => void
  roles: PersonEditorProps['roles']
}

type EditorSection = 'contact' | 'address' | 'community'

function PersonEditorBody({
  variant,
  member,
  canEdit,
  showExperience,
  showSecuritySettings,
  onClose,
  roles,
}: PersonEditorBodyProps) {
  // Mounted per person (`key={member.id}`), so each person gets a fresh form
  // and anything still pending saves when you move to the next one.
  const form = useUserEditForm({ member, roles, canEdit })

  // Field errors wait until focus leaves the section, so the address doesn't
  // shout "City is required" while you're still typing the street.
  const [touched, setTouched] = useState<ReadonlySet<EditorSection>>(new Set())
  const touchOnLeave =
    (section: EditorSection) => (event: FocusEvent<HTMLDivElement>) => {
      if (event.currentTarget.contains(event.relatedTarget)) return
      setTouched((prev) =>
        prev.has(section) ? prev : new Set(prev).add(section)
      )
    }
  const errorsFor = <T,>(section: EditorSection, errors: T) =>
    touched.has(section) ? errors : undefined

  // `weekend_attended` is stored as the wire format `DTTD#11`; the header wants
  // it read back as "joined DTTD #11".
  const joinedWeekendRef = parseCommunityWeekendRef(
    member.communityInformation.weekendAttended
  )
  const joinedLabel = isNil(joinedWeekendRef)
    ? null
    : `joined ${joinedWeekendRef.community} #${joinedWeekendRef.number}`

  const name = `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim()
  const heading = name !== '' ? name : canEdit ? 'Edit person' : 'View person'
  const headingClass =
    'truncate font-serif text-xl font-semibold tracking-tight'

  const servedSummary = showExperience
    ? formatServedSummary(form.visibleExperience)
    : null

  return (
    <>
      <div
        className={cn(
          'flex shrink-0 items-center gap-3 pb-2.5',
          // Clear of the sheet's own close button.
          variant === 'sheet' && 'pr-8'
        )}
      >
        <UserAvatar
          user={{
            id: member.id,
            first_name: member.firstName,
            last_name: member.lastName,
            email: member.email,
            profilePhoto: member.profilePhoto,
          }}
          size={42}
        />
        <div className="min-w-0">
          {variant === 'sheet' ? (
            <>
              <SheetTitle className={headingClass}>{heading}</SheetTitle>
              <SheetDescription className="sr-only">
                Edit this person&apos;s details, experience and roles.
              </SheetDescription>
            </>
          ) : (
            <h2 className={headingClass}>{heading}</h2>
          )}
          <p className="truncate text-[13px] text-muted-foreground">
            {member.email ?? 'No email on file'}
            {!isNil(joinedLabel) && ` · ${joinedLabel}`}
            {!canEdit && ' · view only'}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <AutoSaveStatusIndicator
            status={form.saveStatus}
            onRetry={form.retry}
          />
          {variant === 'panel' && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close editor"
              className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 xl:size-8"
            >
              <X aria-hidden className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
        <EditorSectionCard title="Contact info" defaultOpen>
          <div onBlur={touchOnLeave('contact')}>
            <ContactInfoSection
              contact={form.contact}
              onChange={form.updateContact}
              errors={errorsFor('contact', form.contactErrors)}
              disabled={!canEdit}
            />
          </div>
        </EditorSectionCard>

        <EditorSectionCard title="Address">
          <div onBlur={touchOnLeave('address')}>
            <AddressEditSection
              address={form.address}
              onChange={form.setAddress}
              errors={errorsFor('address', form.addressErrors)}
              disabled={!canEdit}
            />
          </div>
        </EditorSectionCard>

        <EditorSectionCard title="Community info">
          <div onBlur={touchOnLeave('community')}>
            <CommunityInfoSection
              community={form.community}
              onChange={form.updateCommunity}
              errors={errorsFor('community', form.communityErrors)}
              disabled={!canEdit}
            />
          </div>
        </EditorSectionCard>

        <EditorSectionCard title="Skills">
          <SkillsEditSection
            skills={form.community.skills}
            onToggle={form.toggleSkill}
            customSkill={form.customSkill}
            onCustomSkillChange={form.setCustomSkill}
            onAddCustomSkill={form.addCustomSkill}
            canEdit={canEdit}
          />
        </EditorSectionCard>

        {showExperience && (
          <EditorSectionCard title="Experience" summary={servedSummary}>
            <ExperienceEditSection
              member={member}
              totalDTTDWeekends={form.totalDTTDWeekends}
              visibleExperience={form.visibleExperience}
              newExperience={form.newExperience}
              onDeleteExisting={form.deleteExperience}
              onAddNew={form.addExperience}
              onUpdateNew={form.updateExperience}
              onRemoveNew={form.removeExperience}
              canEdit={canEdit}
            />
          </EditorSectionCard>
        )}

        {showSecuritySettings && (
          <EditorSectionCard title="Roles" defaultOpen>
            <RolesEditSection
              options={form.roleOptions}
              selectedRoleIds={form.selectedRoleIds}
              onChange={form.setSelectedRoleIds}
              disabled={!canEdit}
            />
          </EditorSectionCard>
        )}
      </div>

      {isDevMode() && canEdit && (
        <div className="mt-3 flex shrink-0 justify-end border-t border-divider pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={form.fillWithTestData}
          >
            Fill with test data
          </Button>
        </div>
      )}
    </>
  )
}
