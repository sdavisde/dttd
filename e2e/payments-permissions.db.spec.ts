import { test, expect } from '@playwright/test'
import { adminClient, anonClient, signInAs } from './fixtures/supabase'

/**
 * Direct checks on the payment_transaction UPDATE policy added in
 * 20260821000000_payment_transaction_corrections.sql.
 *
 * These bypass the browser because the policy is the last line of defence: the
 * action layer already checks WRITE_PAYMENTS, so a UI test would pass even if
 * the policy were wrong. Here the anon client is subject to RLS exactly as a
 * hand-rolled request would be.
 */

const READ_ONLY_EMAIL = 'e2e-read-only@example.test'
const READ_ONLY_PASSWORD = 'e2e-password-1234'
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'sdavisde@gmail.com'

let readOnlyUserId: string
let readOnlyRoleId: string
let paymentId: string

test.beforeAll(async () => {
  const supabase = adminClient()

  // A role with READ_PAYMENTS but deliberately without WRITE_PAYMENTS.
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .insert({
      label: 'E2E Read Only Payments',
      permissions: ['READ_ADMIN_PORTAL', 'READ_PAYMENTS'],
      type: 'COMMITTEE',
    })
    .select()
    .single()
  if (roleError !== null) {
    throw new Error(`Failed to create test role: ${roleError.message}`)
  }
  readOnlyRoleId = role.id

  const { data: created, error: userError } =
    await supabase.auth.admin.createUser({
      email: READ_ONLY_EMAIL,
      password: READ_ONLY_PASSWORD,
      email_confirm: true,
    })
  if (userError !== null || created.user === null) {
    throw new Error(`Failed to create test user: ${userError?.message}`)
  }
  readOnlyUserId = created.user.id

  const { error: linkError } = await supabase
    .from('user_roles')
    .insert({ user_id: readOnlyUserId, role_id: readOnlyRoleId })
  if (linkError !== null) {
    throw new Error(`Failed to assign test role: ${linkError.message}`)
  }

  const { data: candidate } = await supabase
    .from('candidates')
    .select('id, weekend_id')
    .not('weekend_id', 'is', null)
    .limit(1)
    .single()

  const { data: payment, error: paymentError } = await supabase
    .from('payment_transaction')
    .insert({
      type: 'fee',
      target_type: 'candidate',
      target_id: candidate?.id ?? null,
      weekend_id: candidate?.weekend_id ?? null,
      payment_intent_id: `manual_e2e-rls-${crypto.randomUUID()}`,
      gross_amount: 99.99,
      payment_method: 'check',
      payment_owner: 'E2E RLS Fixture',
    })
    .select()
    .single()
  if (paymentError !== null) {
    throw new Error(`Failed to create test payment: ${paymentError.message}`)
  }
  paymentId = payment.id
})

test.afterAll(async () => {
  const supabase = adminClient()
  await supabase.from('payment_transaction').delete().eq('id', paymentId)
  await supabase.from('user_roles').delete().eq('user_id', readOnlyUserId)
  await supabase.auth.admin.deleteUser(readOnlyUserId)
  await supabase.from('roles').delete().eq('id', readOnlyRoleId)
})

test.describe('payment_transaction write policies', () => {
  test('a user without WRITE_PAYMENTS cannot update a payment', async () => {
    const client = anonClient()
    await signInAs(client, READ_ONLY_EMAIL, READ_ONLY_PASSWORD)

    const { data, error } = await client
      .from('payment_transaction')
      .update({ gross_amount: 1 })
      .eq('id', paymentId)
      .select()

    // RLS filters the row out rather than erroring, so the tell is that
    // nothing was updated. Confirm the stored amount really did not move.
    expect(error).toBeNull()
    expect(data).toHaveLength(0)

    const { data: after } = await adminClient()
      .from('payment_transaction')
      .select('gross_amount')
      .eq('id', paymentId)
      .single()
    expect(Number(after?.gross_amount)).toBe(99.99)
  })

  test('a user without WRITE_PAYMENTS cannot delete a payment', async () => {
    const client = anonClient()
    await signInAs(client, READ_ONLY_EMAIL, READ_ONLY_PASSWORD)

    await client.from('payment_transaction').delete().eq('id', paymentId)

    const { data: after } = await adminClient()
      .from('payment_transaction')
      .select('id')
      .eq('id', paymentId)
      .maybeSingle()
    expect(after?.id).toBe(paymentId)
  })

  test('a user without WRITE_PAYMENTS can still read payments', async () => {
    const client = anonClient()
    await signInAs(client, READ_ONLY_EMAIL, READ_ONLY_PASSWORD)

    const { data, error } = await client
      .from('payment_transaction')
      .select('id')
      .eq('id', paymentId)

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })

  test('a FULL_ACCESS user can update a payment', async () => {
    const client = anonClient()
    await signInAs(client, ADMIN_EMAIL)

    const { data, error } = await client
      .from('payment_transaction')
      .update({ notes: 'updated by full access' })
      .eq('id', paymentId)
      .select()

    // FULL_ACCESS satisfies any permission check — auth_user_has_permission()
    // mirrors userHasPermission() in lib/security.ts on that point.
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })
})
