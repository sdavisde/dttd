# Task 6.0 Proof Artifacts - Create Deposit Repository and Service

## Files Created

### 1. `/services/deposit/types.ts`

Contains all type definitions, Zod schemas, and DTOs:

```
- ServiceOptions type with dangerouslyBypassRLS option
- Database types: DepositRow, DepositInsert, DepositUpdate, DepositPaymentRow, DepositPaymentInsert, DepositPaymentUpdate
- Zod schemas: DepositTypeSchema, DepositStatusSchema, CreateDepositSchema, UpdateDepositSchema, LinkPaymentSchema, RecordStripePayoutSchema
- Inferred types: DepositType, DepositStatus, CreateDepositInput, UpdateDepositInput, LinkPaymentInput, RecordStripePayoutInput
- Raw types: RawDepositWithPayments, RawDepositPaymentWithTransaction
- DTOs: DepositDTO (with computed payment_count and total_gross_amount), DepositPaymentDTO
```

### 2. `/services/deposit/repository.ts`

Contains all database CRUD operations:

```
Deposit functions:
- getClient(options) - Helper for RLS bypass
- createDeposit(data, options) - Insert deposit
- getDepositById(id, options) - Fetch with linked payments
- getDepositByPayoutId(payoutId, options) - Fetch by Stripe payout ID
- getAllDeposits(options) - Fetch all with payment counts
- updateDeposit(id, data, options) - Update by ID
- updateDepositByPayoutId(payoutId, data, options) - Update by payout ID

Deposit Payments functions:
- linkPaymentToDeposit(depositId, paymentTransactionId, options)
- unlinkPaymentFromDeposit(depositId, paymentTransactionId, options)
- getPaymentsForDeposit(depositId, options)
- getDepositForPayment(paymentTransactionId, options)
```

### 3. `/services/deposit/deposit-service.ts`

Contains all business logic and validation:

```
- normalizeDeposit(raw) - Convert raw deposit to DTO
- normalizeDepositRow(raw) - Convert deposit row (without payments) to DTO
- normalizeDepositPayment(raw) - Convert deposit payment to DTO
- recordDeposit(data, options) - Create with Zod validation
- recordStripePayoutDeposit(payoutData, options) - Create Stripe payout and link payments
- getDepositById(id, options) - Get normalized DTO
- getAllDeposits(options) - Get all normalized, sorted by date
- updateDeposit(id, data, options) - Update with validation
- updateDepositByPayoutId(payoutId, data, options) - Update by payout ID with validation
- linkPaymentToDeposit(depositId, paymentTransactionId, options)
- getPaymentsForDeposit(depositId, options)
```

### 4. `/services/deposit/actions.ts`

Contains authorized server actions:

```
- getAllDeposits() - Requires READ_PAYMENTS permission
- getDepositById(id) - Requires READ_PAYMENTS permission
```

### 5. `/services/deposit/index.ts`

Public API exports:

```
- Re-exports all actions
- Exports all database types
- Exports all input types
- Exports enum types (DepositType, DepositStatus)
- Exports DTOs
- Exports Zod schemas
- Exports service functions for webhook usage
```

## Code Review: Validation in Service Layer

All input validation occurs in the service layer using Zod schemas:

```typescript
// From deposit-service.ts - recordDeposit function
export async function recordDeposit(
  data: CreateDepositInput,
  options?: ServiceOptions
): Promise<Result<string, DepositRow>> {
  // Validate input using Zod schema
  const parseResult = CreateDepositSchema.safeParse(data)
  if (!parseResult.success) {
    return err(parseResult.error.message)
  }
  // ... continues to repository call
}
```

## Code Review: Result Pattern Usage

Service uses Result pattern consistently:

```typescript
// From deposit-service.ts
import { err, isErr, ok, Result } from '@/lib/results'

// Example usage in getAllDeposits
export async function getAllDeposits(
  options?: ServiceOptions
): Promise<Result<string, DepositDTO[]>> {
  const result = await DepositRepository.getAllDeposits(options)
  if (isErr(result)) {
    return result
  }
  const normalizedDeposits = result.data.map(normalizeDeposit)
  return ok(normalizedDeposits)
}
```

## Code Review: dangerouslyBypassRLS Support

Both repository and service support the RLS bypass option:

```typescript
// From repository.ts
async function getClient(options?: ServiceOptions) {
  if (options?.dangerouslyBypassRLS) {
    return createAdminClient()
  }
  return createClient()
}

// All repository functions accept options parameter
export async function createDeposit(
  data: DepositInsert,
  options?: ServiceOptions
): Promise<Result<string, DepositRow>> {
  const supabase = await getClient(options)
  // ...
}

// Service functions pass options through
export async function recordDeposit(
  data: CreateDepositInput,
  options?: ServiceOptions
): Promise<Result<string, DepositRow>> {
  // ...
  return DepositRepository.createDeposit({ ... }, options)
}
```

## CLI Output: yarn build

```
$ yarn build
▲ Next.js 16.1.3 (Turbopack)
- Environments: .env.local
- Experiments (use with caution):
  · clientTraceMetadata

  Creating an optimized production build ...
✓ Compiled successfully in 9.2s
  Running next.config.js provided runAfterProductionCompile ...
✓ Completed runAfterProductionCompile in 4932ms
  Running TypeScript ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (42/42) in 416.3ms
  Finalizing page optimization ...

Done in 23.19s.
```

## Verification Summary

| Requirement                                                       | Status | Evidence                                                        |
| ----------------------------------------------------------------- | ------ | --------------------------------------------------------------- |
| `/services/deposit/repository.ts` exists                          | ✅     | File created with all CRUD functions                            |
| `/services/deposit/deposit-service.ts` exists                     | ✅     | File created with business logic                                |
| `/services/deposit/types.ts` exists with DTOs and Zod schemas     | ✅     | File created with complete type system                          |
| `/services/deposit/index.ts` exists with proper re-exports        | ✅     | File created with all exports                                   |
| Service validates inputs and uses Result pattern                  | ✅     | All service functions validate with Zod and return Result types |
| Both repository and service support `dangerouslyBypassRLS` option | ✅     | All functions accept ServiceOptions parameter                   |
| `yarn build` compiles without TypeScript errors                   | ✅     | Build completed successfully                                    |
