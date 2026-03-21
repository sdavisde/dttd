# Task 5.0 Proof Artifacts - Create Payment Service Layer

## File Existence Verification

### Service File

File exists at: `/services/payment/payment-service.ts`

**Service Functions Implemented:**

- `recordPayment(data, options)` - Validate and create payment
- `getPaymentForTarget(targetType, targetId, options)` - Get payments for target
- `hasPaymentForTarget(targetType, targetId, options)` - Check if payment exists
- `getAllPayments(options)` - Get all payments with normalized DTOs (new payment_transaction table)
- `getAllPaymentsDeprecated()` - Legacy function for old tables
- `backfillStripeData(paymentIntentId, stripeData, options)` - Update with Stripe fee data

## Zod Validation Schemas

Located in `/services/payment/types.ts`:

### PaymentTypeSchema

```typescript
export const PaymentTypeSchema = z.enum(['fee', 'donation', 'other'])
```

### TargetTypeSchema

```typescript
export const TargetTypeSchema = z
  .enum(['candidate', 'weekend_roster'])
  .nullable()
```

### PaymentMethodSchema

```typescript
export const PaymentMethodSchema = z.enum(['stripe', 'cash', 'check'])
```

### CreatePaymentSchema

```typescript
export const CreatePaymentSchema = z
  .object({
    type: PaymentTypeSchema,
    target_type: TargetTypeSchema,
    target_id: z.string().uuid().nullable(),
    weekend_id: z.string().uuid().nullable(),
    payment_intent_id: z.string().nullable().optional(),
    gross_amount: z.number().positive('Gross amount must be positive'),
    net_amount: z.number().nullable().optional(),
    stripe_fee: z.number().nullable().optional(),
    payment_method: PaymentMethodSchema,
    payment_owner: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    charge_id: z.string().nullable().optional(),
    balance_transaction_id: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // Donations should not have a target
      if (data.type === 'donation') {
        return data.target_type === null && data.target_id === null
      }
      // Fees should have a target
      if (data.type === 'fee') {
        return data.target_type !== null && data.target_id !== null
      }
      // Other types are flexible
      return true
    },
    {
      message:
        'Fees must have target_type and target_id. Donations must not have target_type or target_id.',
    }
  )
```

### BackfillStripeDataSchema

```typescript
export const BackfillStripeDataSchema = z.object({
  net_amount: z.number().nullable().optional(),
  stripe_fee: z.number().nullable().optional(),
  charge_id: z.string().nullable().optional(),
  balance_transaction_id: z.string().nullable().optional(),
})
```

## PaymentTransactionDTO Type

```typescript
export type PaymentTransactionDTO = {
  id: string
  type: PaymentType
  target_type: TargetType
  target_id: string | null
  weekend_id: string | null
  payment_intent_id: string | null
  gross_amount: number
  net_amount: number | null
  stripe_fee: number | null
  payment_method: PaymentMethod
  payment_owner: string | null
  notes: string | null
  charge_id: string | null
  balance_transaction_id: string | null
  created_at: string
  // Derived payer info
  payer_name: string | null
  payer_email: string | null
}
```

## Code Review: Validation in Service Layer

### recordPayment Function

```typescript
export async function recordPayment(
  data: CreatePaymentInput,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow>> {
  // Validate input using Zod schema
  const parseResult = CreatePaymentSchema.safeParse(data)
  if (!parseResult.success) {
    return err(parseResult.error.message)
  }

  const validatedData = parseResult.data
  // ... creates payment via repository
}
```

### backfillStripeData Function

```typescript
export async function backfillStripeData(
  paymentIntentId: string,
  stripeData: BackfillStripeDataInput,
  options?: ServiceOptions
): Promise<Result<string, PaymentTransactionRow>> {
  // Validate input
  const parseResult = BackfillStripeDataSchema.safeParse(stripeData)
  if (!parseResult.success) {
    return err(parseResult.error.message)
  }
  // ... updates payment via repository
}
```

**Validation is in service layer, NOT repository**: ✅

## Code Review: Result Pattern Usage

### Uses ok() and err()

```typescript
import { err, isErr, ok, Result, Results } from '@/lib/results'

// Error case
if (!parseResult.success) {
  return err(parseResult.error.message)
}

// Success case
return ok(normalizedPayments)
```

### Uses isErr() for checking

```typescript
if (isErr(result)) {
  return result
}
return ok(result.data.length > 0)
```

**Result pattern used consistently**: ✅

## Code Review: dangerouslyBypassRLS Exposed

All service functions accept and pass `options` to repository:

```typescript
export async function recordPayment(
  data: CreatePaymentInput,
  options?: ServiceOptions // ← accepts options
): Promise<Result<string, PaymentTransactionRow>> {
  // ...
  return PaymentRepository.createPayment(
    {
      /* data */
    },
    options // ← passes to repository
  )
}
```

**dangerouslyBypassRLS option exposed from repository**: ✅

## index.ts Re-exports

```typescript
// New types for payment_transaction table
export type {
  ServiceOptions,
  PriceInfo,
  PaymentTransactionDTO,
  PaymentTransactionRow,
  PaymentTransactionInsert,
  PaymentTransactionUpdate,
  CreatePaymentInput,
  BackfillStripeDataInput,
  PaymentMethod,
  TargetType,
} from './types'

export {
  PaymentTypeSchema,
  TargetTypeSchema,
  PaymentMethodSchema,
  CreatePaymentSchema,
  BackfillStripeDataSchema,
} from './types'

// Service functions for payment_transaction table (used by webhooks with dangerouslyBypassRLS)
export {
  recordPayment,
  getPaymentForTarget,
  hasPaymentForTarget,
  backfillStripeData,
} from './payment-service'

// Re-export getAllPayments from service with alias to avoid conflict with action
// The action getAllPayments uses legacy tables; this uses the new payment_transaction table
export { getAllPayments as getPaymentTransactions } from './payment-service'
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

## Legacy Compatibility

Preserved existing service functions with deprecation notices:

- `hasTeamPayment(weekendRosterId)` - @deprecated
- `getAllPaymentsDeprecated()` - @deprecated (renamed from `getAllPayments`, use `getAllPayments()` from new table)
- `normalizeTeamPayment()` - @deprecated (internal)

The action `getAllPayments` in `actions.ts` calls `getAllPaymentsDeprecated()` internally and will be updated in a later task.

This ensures existing code continues to work during the migration period.

## Payer Info Normalization Logic

The `normalizePaymentTransaction` function handles payer info with the following logic:

1. **Check if `payment_owner` contains an actual name** (not a category like 'candidate', 'sponsor', 'unknown')
2. **If actual name found**: Use it as `payer_name` (email not available in this case)
3. **Otherwise, fall back to target info**:
   - For candidates: derive name/email from joined candidate record
   - For weekend roster: derive name/email from joined user record

**Note**: Currently `payment_owner` stores category values ('candidate' or 'sponsor'), not actual names. The normalization correctly handles both cases and will use actual names if stored in the future.
