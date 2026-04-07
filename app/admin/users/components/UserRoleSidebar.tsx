'use client'

import { isNil } from 'lodash'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Permission, userHasPermission } from '@/lib/security'
import { useSession } from '@/components/auth/session-provider'
import type { MasterRosterMember } from '@/services/master-roster/types'
import { useUserEditForm } from '../hooks/use-user-edit-form'
import { ContactInfoSection } from './contact-info-section'
import { AddressEditSection } from './address-edit-section'
import { CommunityInfoSection } from './community-info-section'
import { SkillsEditSection } from './skills-edit-section'
import { ExperienceEditSection } from './experience-edit-section'
import { RolesEditSection } from './roles-edit-section'

interface UserRoleSidebarProps {
  member: MasterRosterMember | null
  roles: Array<{ id: string; label: string; permissions: string[] }>
  isOpen: boolean
  onClose: () => void
  canEdit: boolean
}

export function UserRoleSidebar({
  member,
  roles,
  isOpen,
  onClose,
  canEdit,
}: UserRoleSidebarProps) {
  const { user: currentUser } = useSession()

  const showSecuritySettings =
    !isNil(currentUser) &&
    userHasPermission(currentUser, [Permission.WRITE_USER_ROLES])
  const showExperience =
    !isNil(currentUser) &&
    userHasPermission(currentUser, [Permission.READ_USER_EXPERIENCE])

  const {
    contact,
    setContact,
    address,
    setAddress,
    community,
    setCommunity,
    selectedRoleIds,
    setSelectedRoleIds,
    newExperience,
    setNewExperience,
    deletedExperienceIds,
    setDeletedExperienceIds,
    customSkill,
    setCustomSkill,
    isLoading,
    error,
    totalDTTDWeekends,
    visibleExperience,
    roleOptions,
    toggleSkill,
    addCustomSkill,
    handleSave,
  } = useUserEditForm({ member, roles, isOpen, onClose })

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {canEdit ? 'Edit User' : 'View User'}
            {!isNil(member?.firstName) && member.firstName !== '' && (
              <span className="text-muted-foreground font-normal">
                {' '}
                &mdash; {member.firstName} {member.lastName}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-4">
          <ContactInfoSection
            contact={contact}
            onChange={setContact}
            disabled={!canEdit}
          />

          <AddressEditSection
            address={address}
            onChange={setAddress}
            disabled={!canEdit}
          />

          <CommunityInfoSection
            community={community}
            onChange={setCommunity}
            disabled={!canEdit}
          />

          <SkillsEditSection
            skills={community.skills}
            onToggle={toggleSkill}
            customSkill={customSkill}
            onCustomSkillChange={setCustomSkill}
            onAddCustomSkill={addCustomSkill}
            canEdit={canEdit}
          />

          {showExperience && !isNil(member) && (
            <ExperienceEditSection
              member={member}
              totalDTTDWeekends={totalDTTDWeekends}
              visibleExperience={visibleExperience}
              newExperience={newExperience}
              onDeleteExisting={(id) =>
                setDeletedExperienceIds((prev) => [...prev, id])
              }
              onAddNew={(entry) => setNewExperience((prev) => [...prev, entry])}
              onUpdateNew={(idx, entry) =>
                setNewExperience((prev) =>
                  prev.map((e, i) => (i === idx ? entry : e))
                )
              }
              onRemoveNew={(idx) =>
                setNewExperience((prev) => prev.filter((_, i) => i !== idx))
              }
              canEdit={canEdit}
            />
          )}

          {showSecuritySettings && (
            <RolesEditSection
              options={roleOptions}
              selectedRoleIds={selectedRoleIds}
              onChange={setSelectedRoleIds}
              disabled={isLoading || !canEdit}
            />
          )}

          {!isNil(error) && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <SheetFooter className="mt-6 mb-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {canEdit ? 'Cancel' : 'Close'}
          </Button>
          {canEdit && (
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
