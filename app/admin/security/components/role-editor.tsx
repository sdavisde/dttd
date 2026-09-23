'use client'

import { useMemo, useState } from 'react'
import { isNil } from 'lodash'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { isErr } from '@/lib/results'
import { toastError } from '@/lib/toast-error'
import { isDevMode } from '@/lib/dev-mode'
import type { Permission } from '@/lib/security'
import {
  ADMIN_ACCESS_PERMISSION,
  FULL_ACCESS_PERMISSION,
  PERMISSION_LADDERS,
  SENSITIVE_PERMISSIONS,
} from '@/lib/security/permission-areas'
import {
  applyRung,
  applySwitch,
  resolveLadder,
  resolveSwitch,
  type Rung,
} from '@/lib/security/role-rungs'
import type {
  FullAccessImpact,
  Role,
  RoleInput,
  RoleUsageById,
} from '@/services/identity/roles'
import { createRole, updateRole } from '@/services/identity/roles'
import {
  roleInputSchema,
  type RoleInputValues,
} from '@/services/identity/roles/validation'
import {
  inheritedPermissions,
  parentOptions,
  roleLabelById,
  toRoleInput,
} from '../lib/editor-model'
import { PermissionLadder } from './permission-ladder'
import { SensitivePanel } from './sensitive-panel'
import { FullAccessCard } from './full-access-card'

const NO_PARENT = '__none__'

const fieldLabelClass =
  'text-[12px] font-semibold uppercase tracking-wider text-muted-foreground'

interface RoleEditorProps {
  /** The saved role being edited, or null for an unsaved draft. */
  role: Role | null
  /** Draft values when creating (a copy of `copiedFrom`). */
  initial: RoleInput | null
  copiedFrom: Role | null
  roles: Role[]
  usage: RoleUsageById
  fullAccessImpact: FullAccessImpact
  canEdit: boolean
  onSaved: (role: Role) => void
  onCancel: () => void
  onDelete: (role: Role) => void
}

/**
 * The detail pane: name, description, type, "based on", then the Access grid,
 * the sensitive panel and the quarantined Full Access card. Nothing is written
 * until Save — loading a role never normalises its permissions.
 */
export function RoleEditor({
  role,
  initial,
  copiedFrom,
  roles,
  usage,
  fullAccessImpact,
  canEdit,
  onSaved,
  onCancel,
  onDelete,
}: RoleEditorProps) {
  const isNew = isNil(role)
  const defaults: RoleInputValues = useMemo(() => {
    if (!isNil(role)) return toRoleInput(role)
    if (!isNil(initial)) return initial
    return {
      label: '',
      description: '',
      type: 'INDIVIDUAL',
      based_on_role_id: null,
      permissions: [],
    }
  }, [role, initial])

  const form = useForm<RoleInputValues>({
    resolver: zodResolver(roleInputSchema),
    defaultValues: defaults,
  })
  const [isSaving, setIsSaving] = useState(false)

  const basedOnRoleId = useWatch({
    control: form.control,
    name: 'based_on_role_id',
  })
  const ownPermissions = useWatch({
    control: form.control,
    name: 'permissions',
  })

  const readOnly = !canEdit || isSaving
  const own = useMemo(
    () => new Set<Permission>(ownPermissions ?? []),
    [ownPermissions]
  )
  const inherited = useMemo(
    () => inheritedPermissions(basedOnRoleId ?? null, roles),
    [basedOnRoleId, roles]
  )
  const parentLabel = roleLabelById(basedOnRoleId ?? null, roles)
  const parents = useMemo(
    () => parentOptions(role?.id ?? null, roles),
    [role?.id, roles]
  )

  const setPermissions = (next: Permission[]) =>
    form.setValue('permissions', next, {
      shouldDirty: true,
      shouldValidate: true,
    })

  const ladders = PERMISSION_LADDERS.map((ladder) =>
    resolveLadder(ladder, own, inherited)
  )
  const sensitiveSwitches = new Map(
    SENSITIVE_PERMISSIONS.map((item) => [
      item.permission,
      resolveSwitch(item.permission, own, inherited),
    ])
  )
  const adminAccess = resolveSwitch(ADMIN_ACCESS_PERMISSION, own, inherited)
  const fullAccess = resolveSwitch(FULL_ACCESS_PERMISSION, own, inherited)

  const roleUsage = isNil(role) ? null : (usage[role.id] ?? null)
  const dependentLabels = (roleUsage?.dependentRoleIds ?? [])
    .map((id) => roleLabelById(id, roles))
    .filter((label): label is string => !isNil(label))
  const deleteBlockedReason = isNil(roleUsage)
    ? null
    : dependentLabels.length > 0
      ? `${dependentLabels.join(', ')} ${dependentLabels.length === 1 ? 'is' : 'are'} based on this role.`
      : roleUsage.userCount > 0
        ? `${roleUsage.userCount} ${roleUsage.userCount === 1 ? 'person holds' : 'people hold'} this role.`
        : null

  const onSubmit = async (values: RoleInputValues) => {
    setIsSaving(true)
    try {
      const result = isNil(role)
        ? await createRole(values)
        : await updateRole({ roleId: role.id, input: values })
      if (isErr(result)) {
        toastError(
          isNil(role)
            ? 'Unable to create this role. Please try again.'
            : 'Unable to save this role. Please try again.',
          { error: result.error }
        )
        return
      }
      toast.success(isNil(role) ? 'Role created' : 'Role saved')
      form.reset(toRoleInput(result.data))
      onSaved(result.data)
    } catch (error) {
      toastError('Unable to save this role. Please try again.', { error })
    } finally {
      setIsSaving(false)
    }
  }

  const fillWithTestData = () => {
    form.setValue('label', 'Hospitality Lead', { shouldDirty: true })
    form.setValue(
      'description',
      'Coordinates meals and lodging for the weekend and keeps an eye on candidate fees.',
      { shouldDirty: true }
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 rounded-md border border-border bg-card px-4 py-4 md:px-5"
      >
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-serif text-[22px] font-semibold tracking-tight">
            {isNew ? 'New role' : role.label}
          </h2>
          {isNew && !isNil(copiedFrom) && (
            <span className="text-[12.5px] text-muted-foreground">
              copied from {copiedFrom.label}
            </span>
          )}
          {canEdit && (
            <div className="ml-auto flex items-center gap-2">
              {isDevMode() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={fillWithTestData}
                >
                  Fill with test data
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                className="h-11 md:h-[34px]"
                disabled={isSaving || (!isNew && !form.formState.isDirty)}
              >
                {isSaving ? 'Saving…' : isNew ? 'Create role' : 'Save changes'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-11 md:h-[34px]"
                disabled={isSaving}
                onClick={() => {
                  form.reset(defaults)
                  onCancel()
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
          {/* Left column: identity, based on, access grid. */}
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClass}>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Treasurer"
                      disabled={readOnly}
                      className="h-11 md:h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fieldLabelClass}>
                    Description · required
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Who is this role for, and what do they need to do?"
                      disabled={readOnly}
                      className="min-h-20 text-[13.5px] leading-relaxed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={fieldLabelClass}>Kind</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={readOnly}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 w-full md:h-9">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INDIVIDUAL">
                          Position — one person
                        </SelectItem>
                        <SelectItem value="COMMITTEE">
                          Committee — several people
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="based_on_role_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={fieldLabelClass}>Based on</FormLabel>
                    <Select
                      value={field.value ?? NO_PARENT}
                      onValueChange={(value) =>
                        field.onChange(value === NO_PARENT ? null : value)
                      }
                      disabled={readOnly}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 w-full md:h-9">
                          <SelectValue placeholder="Nothing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_PARENT}>Nothing</SelectItem>
                        {parents.map((parent) => (
                          <SelectItem key={parent.id} value={parent.id}>
                            {parent.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="-mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
              Inheritance is additive — this role gets everything{' '}
              {parentLabel ?? 'the role it is based on'} can do, plus what you
              add here. There is no “minus”.
            </p>

            {/* Access */}
            <section className="flex flex-col gap-1">
              <h3 className={fieldLabelClass}>Access</h3>
              <div className="flex min-h-11 items-start gap-2.5 border-b border-divider py-2.5">
                <Switch
                  id="admin-access"
                  checked={adminAccess.on}
                  disabled={readOnly || adminAccess.locked}
                  onCheckedChange={(checked) =>
                    setPermissions(
                      applySwitch(
                        ownPermissions ?? [],
                        ADMIN_ACCESS_PERMISSION,
                        checked
                      )
                    )
                  }
                  aria-label="Can open the admin area"
                  className="mt-0.5"
                />
                <label
                  htmlFor="admin-access"
                  className="flex min-w-0 flex-col gap-0.5"
                >
                  <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-foreground">
                    Can open the admin area
                    {adminAccess.locked && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                        <Lock aria-hidden className="size-2.5" />
                        from {parentLabel ?? 'the role it is based on'}
                      </span>
                    )}
                  </span>
                  <span className="text-[12px] leading-snug text-muted-foreground">
                    Without this, none of the areas below are reachable in Admin
                    — the role only affects what people can see on the member
                    site.
                  </span>
                </label>
              </div>

              {ladders.map((resolved) => (
                <PermissionLadder
                  key={resolved.ladder.id}
                  resolved={resolved}
                  parentLabel={parentLabel}
                  disabled={readOnly}
                  onChange={(rung: Rung) =>
                    setPermissions(
                      applyRung(
                        resolved.ladder,
                        ownPermissions ?? [],
                        inherited,
                        rung
                      )
                    )
                  }
                />
              ))}
            </section>
          </div>

          {/* Right column: sensitive panel, full access, footnote, delete. */}
          <div className="flex flex-col gap-4">
            <SensitivePanel
              switches={sensitiveSwitches}
              parentLabel={parentLabel}
              disabled={readOnly}
              onChange={(permission, on) =>
                setPermissions(
                  applySwitch(ownPermissions ?? [], permission, on)
                )
              }
            />

            <FullAccessCard
              resolved={fullAccess}
              totalHolders={fullAccessImpact.totalHolders}
              holdersLostIfRemoved={
                isNil(role)
                  ? 0
                  : (fullAccessImpact.holdersLostIfRemoved[role.id] ?? 0)
              }
              grantedWhenLoaded={
                !isNil(role) &&
                role.permissions.includes(FULL_ACCESS_PERMISSION)
              }
              parentLabel={parentLabel}
              disabled={readOnly}
              onChange={(on) =>
                setPermissions(
                  applySwitch(ownPermissions ?? [], FULL_ACCESS_PERMISSION, on)
                )
              }
            />

            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              Someone with several roles gets everything any of them grants —
              the most permissive wins. Weekend leadership roles (Rector, heads)
              grant temporary access on top — that’s set on each weekend’s
              roster, not here.
            </p>

            {canEdit && !isNew && (
              <div className="flex flex-col gap-1.5 border-t border-divider pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-11 self-start text-destructive hover:text-destructive md:h-8"
                  disabled={isSaving || !isNil(deleteBlockedReason)}
                  onClick={() => onDelete(role)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete role
                </Button>
                {!isNil(deleteBlockedReason) && (
                  <p className="text-[12px] leading-snug text-muted-foreground">
                    Can’t delete yet: {deleteBlockedReason}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}
