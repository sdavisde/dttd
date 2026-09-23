'use client'

import { useState } from 'react'
import { isNil } from 'lodash'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { useIsMobile } from '@/hooks/use-mobile'
import { isErr } from '@/lib/results'
import { toastError } from '@/lib/toast-error'
import type {
  FullAccessImpact,
  Role,
  RoleInput,
  RoleUsageById,
} from '@/services/identity/roles'
import { deleteRole } from '@/services/identity/roles'
import { draftFromRole } from '../lib/editor-model'
import { RoleList } from './role-list'
import { RoleEditor } from './role-editor'
import { NewRoleDialog } from './new-role-dialog'

interface SecurityWorkspaceProps {
  roles: Role[]
  usage: RoleUsageById
  fullAccessImpact: FullAccessImpact
  canEdit: boolean
}

/**
 * Either an existing role (by id) or an unsaved draft copied from another
 * role. Drafts live only in memory until the editor saves them.
 */
type Selection =
  | { kind: 'role'; roleId: string }
  | { kind: 'draft'; source: Role; initial: RoleInput }
  | null

/**
 * The Security page: a master/detail workspace. On `md+` the role list sits
 * beside an inline editor; below that the list is the page and picking a role
 * opens the editor in a full-height sheet.
 */
export function SecurityWorkspace({
  roles,
  usage,
  fullAccessImpact,
  canEdit,
}: SecurityWorkspaceProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [selection, setSelection] = useState<Selection>(() =>
    isNil(roles[0]) ? null : { kind: 'role', roleId: roles[0].id }
  )
  const [newRoleOpen, setNewRoleOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  // The sheet is only "open" on mobile once the person has picked something;
  // the desktop pane is always showing the selection.
  const [sheetOpen, setSheetOpen] = useState(false)
  // The last role the editor saved, so the list and pane reflect it while
  // `router.refresh()` is still bringing back the server's copy.
  const [justSaved, setJustSaved] = useState<Role | null>(null)

  const displayRoles = (() => {
    if (isNil(justSaved)) return roles
    const merged = roles.map((role) =>
      role.id === justSaved.id ? justSaved : role
    )
    return merged.some((role) => role.id === justSaved.id)
      ? merged
      : [...merged, justSaved].sort((a, b) => a.label.localeCompare(b.label))
  })()

  const selectedRole =
    selection?.kind === 'role'
      ? (displayRoles.find((role) => role.id === selection.roleId) ?? null)
      : null

  const selectRole = (role: Role) => {
    setSelection({ kind: 'role', roleId: role.id })
    setSheetOpen(true)
  }

  const startDraft = (source: Role) => {
    setSelection({ kind: 'draft', source, initial: draftFromRole(source) })
    setSheetOpen(true)
  }

  const handleSaved = (saved: Role) => {
    setJustSaved(saved)
    setSelection({ kind: 'role', roleId: saved.id })
    router.refresh()
  }

  const handleCancel = () => {
    if (selection?.kind === 'draft') {
      setSelection(
        isNil(roles[0]) ? null : { kind: 'role', roleId: roles[0].id }
      )
    }
    setSheetOpen(false)
  }

  const confirmDelete = async () => {
    if (isNil(roleToDelete)) return
    setIsDeleting(true)
    try {
      const result = await deleteRole(roleToDelete.id)
      if (isErr(result)) {
        toastError(
          'Unable to delete this role. Move people off it and re-base any roles built on it first.',
          { error: result.error }
        )
        return
      }
      toast.success(`Deleted “${roleToDelete.label}”`)
      setRoleToDelete(null)
      setSheetOpen(false)
      setSelection(
        isNil(roles[0]) || roles[0].id === roleToDelete.id
          ? null
          : { kind: 'role', roleId: roles[0].id }
      )
      router.refresh()
    } catch (error) {
      toastError('Unable to delete this role. Please try again.', { error })
    } finally {
      setIsDeleting(false)
    }
  }

  // One editor instance is mounted at a time so form state is never duplicated.
  const editor =
    selection === null ? null : (
      <RoleEditor
        key={
          selection.kind === 'role'
            ? selection.roleId
            : `draft-${selection.source.id}`
        }
        role={selectedRole}
        initial={selection.kind === 'draft' ? selection.initial : null}
        copiedFrom={selection.kind === 'draft' ? selection.source : null}
        roles={displayRoles}
        usage={usage}
        fullAccessImpact={fullAccessImpact}
        canEdit={canEdit}
        onSaved={handleSaved}
        onCancel={handleCancel}
        onDelete={(role) => setRoleToDelete(role)}
      />
    )

  return (
    <div>
      <PageHeader
        title="Security"
        description="Define what each role can do — roles are assigned to people on the People page."
      >
        <Button
          onClick={() => setNewRoleOpen(true)}
          disabled={!canEdit || roles.length === 0}
          className="h-11 md:h-9"
        >
          <Plus className="h-4 w-4" />
          New role
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-4 md:grid md:grid-cols-[388px_minmax(0,1fr)] md:items-start">
        <div className="flex flex-col gap-2.5">
          <RoleList
            roles={displayRoles}
            selectedRoleId={selectedRole?.id ?? null}
            canEdit={canEdit}
            onSelect={selectRole}
            onDuplicate={startDraft}
          />
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {displayRoles.length} {displayRoles.length === 1 ? 'role' : 'roles'}{' '}
            · new roles start as a copy of an existing one · board positions and
            committees are roles too
          </p>
        </div>

        {/* Desktop: inline detail pane. */}
        <div className="hidden md:block">
          {isNil(editor) ? (
            <div className="rounded-md border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Pick a role on the left to see what it can do.
            </div>
          ) : (
            !isMobile && editor
          )}
        </div>
      </div>

      {/* Mobile: the editor lives in a full-height sheet. */}
      {isMobile && (
        <Sheet
          open={sheetOpen && !isNil(editor)}
          onOpenChange={(open) => {
            if (!open) handleCancel()
          }}
        >
          <SheetContent
            side="right"
            className="w-full gap-0 overflow-y-auto p-0 sm:max-w-full"
          >
            <SheetTitle className="sr-only">
              {selectedRole?.label ?? 'New role'}
            </SheetTitle>
            <div className="p-4 pt-12">{editor}</div>
          </SheetContent>
        </Sheet>
      )}

      <NewRoleDialog
        open={newRoleOpen}
        roles={displayRoles}
        onOpenChange={setNewRoleOpen}
        onConfirm={(source) => {
          setNewRoleOpen(false)
          startDraft(source)
        }}
      />

      <DeleteConfirmationDialog
        isOpen={!isNil(roleToDelete)}
        title="Delete role"
        description="This removes the role for good. People who hold it must be moved off it first, and roles based on it must be re-based."
        itemName={roleToDelete?.label}
        isDeleting={isDeleting}
        onCancel={() => setRoleToDelete(null)}
        onConfirm={confirmDelete}
        confirmText="Delete role"
      />
    </div>
  )
}
