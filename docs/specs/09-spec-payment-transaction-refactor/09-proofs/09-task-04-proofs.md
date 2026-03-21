# Task 4.0 Proof Artifacts - Create Payment Repository with RLS Bypass

## File Existence Verification

### Repository File

File exists at: `/services/payment/repository.ts`

**CRUD Functions Implemented:**

- `createPayment(data, options)` - Insert new payment transaction
- `getPaymentById(id, options)` - Get single payment by ID
- `getPaymentByPaymentIntentId(paymentIntentId, options)` - Lookup by Stripe payment intent
- `getPaymentsByTargetId(targetType, targetId, options)` - Get payments for specific target
- `getAllPayments(options)` - Get all payments with payer info joins
- `updatePayment(id, data, options)` - Update payment fields
- `updatePaymentByPaymentIntentId(paymentIntentId, data, options)` - Update by payment intent ID

### Types File

File exists at: `/services/payment/types.ts`

**ServiceOptions Type:**

```typescript
export type ServiceOptions = {
  /**
   * When true, uses an admin Supabase client that bypasses RLS policies.
   * Use ONLY for webhook handlers and system-level operations.
   */
  dangerouslyBypassRLS?: boolean
}
```

## Admin Client Helper Function

Located in repository at lines 18-28:

```typescript
/**
 * Returns the appropriate Supabase client based on service options.
 * When dangerouslyBypassRLS is true, returns an admin client that bypasses RLS.
 * Otherwise, returns a regular client that respects RLS policies.
 */
async function getClient(options?: ServiceOptions) {
  if (options?.dangerouslyBypassRLS) {
    return createAdminClient()
  }
  return createClient()
}
```

Uses existing `createAdminClient()` from `/lib/supabase/server.ts`.

## Code Review: Repository Pattern Compliance

### Follows `/services/CLAUDE.md` Patterns

1. **Repository Layer Responsibilities**: ✅
   - Only contains database queries
   - No business logic
   - Uses `fromSupabase()` for Result conversion

2. **Type Separation**: ✅
   - Raw types defined in `types.ts`
   - Database types imported from `database.types.ts`

3. **All Functions Accept ServiceOptions**: ✅
   - Every function signature includes `options?: ServiceOptions`

### Example Function Signature

```typescript
export async function createPayment(
  data: PaymentTransactionInsert,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow>> {
  const supabase = await getClient(options)
  // ...
}
```

## CLI Verification

### yarn build Output

```
$ yarn build
▲ Next.js 16.1.3 (Turbopack)
✓ Compiled successfully in 11.0s
✓ Generating static pages using 7 workers (42/42) in 432.5ms
Done in 32.05s.
```

**Result**: Build completed successfully with no TypeScript errors.

## Query Constants

Payment transaction query with joins:

```typescript
export const PaymentTransactionQuery = `
  id,
  type,
  target_type,
  target_id,
  weekend_id,
  payment_intent_id,
  gross_amount,
  net_amount,
  stripe_fee,
  payment_method,
  payment_owner,
  notes,
  charge_id,
  balance_transaction_id,
  created_at,
  candidates!payment_transaction_target_id_fkey(
    first_name,
    last_name,
    email
  ),
  weekend_roster!payment_transaction_target_id_fkey(
    users(
      first_name,
      last_name,
      email
    )
  )
`
```

## Legacy Compatibility

Preserved existing repository functions with deprecation notices:

- `getAllTeamPayments()` - @deprecated
- `getTeamPaymentByRosterId()` - @deprecated
- `TeamPaymentQuery` constant - @deprecated
- `RawTeamPayment` type - @deprecated
