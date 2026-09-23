'use client'

import { isNil } from 'lodash'
import { X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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

  const form = useUserEditForm({ member, roles, isOpen, onClose })

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
              form={form}
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
              form={form}
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
  form: ReturnType<typeof useUserEditForm>
}

function PersonEditorBody({
  variant,
  member,
  canEdit,
  showExperience,
  showSecuritySettings,
  onClose,
  form,
}: PersonEditorBodyProps) {
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
        {variant === 'panel' && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="-mr-2 ml-auto inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 xl:size-8"
          >
            <X aria-hidden className="size-4" />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
        <EditorSectionCard title="Contact info" defaultOpen>
          <ContactInfoSection
            contact={form.contact}
            onChange={form.setContact}
            disabled={!canEdit}
          />
        </EditorSectionCard>

        <EditorSectionCard title="Address">
          <AddressEditSection
            address={form.address}
            onChange={form.setAddress}
            disabled={!canEdit}
          />
        </EditorSectionCard>

        <EditorSectionCard title="Community info">
          <CommunityInfoSection
            community={form.community}
            onChange={form.setCommunity}
            disabled={!canEdit}
          />
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
              onDeleteExisting={(id) =>
                form.setDeletedExperienceIds((prev) => [...prev, id])
              }
              onAddNew={(entry) =>
                form.setNewExperience((prev) => [...prev, entry])
              }
              onUpdateNew={(idx, entry) =>
                form.setNewExperience((prev) =>
                  prev.map((e, i) => (i === idx ? entry : e))
                )
              }
              onRemoveNew={(idx) =>
                form.setNewExperience((prev) =>
                  prev.filter((_, i) => i !== idx)
                )
              }
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
              disabled={form.isLoading || !canEdit}
            />
          </EditorSectionCard>
        )}

        {!isNil(form.error) && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{form.error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="mt-3 flex shrink-0 items-center gap-2 border-t border-divider pt-3">
        {canEdit && (
          <Button onClick={form.handleSave} disabled={form.isLoading}>
            {form.isLoading ? 'Saving…' : 'Save changes'}
          </Button>
        )}
        <Button variant="ghost" onClick={onClose} disabled={form.isLoading}>
          {canEdit ? 'Cancel' : 'Close'}
        </Button>
        {isDevMode() && canEdit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={form.fillWithTestData}
          >
            Fill with test data
          </Button>
        )}
      </div>
    </>
  )
}
