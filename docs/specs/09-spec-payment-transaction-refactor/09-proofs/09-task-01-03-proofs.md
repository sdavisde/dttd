# Proof Artifacts for Tasks 1.0, 2.0, and 3.0

## Task 1.0: Create Payment Transaction Table Schema

### Migration File Created

**File:** `supabase/migrations/20260207200000_create_payment_transaction.sql`

```sql
-- Migration: Create payment_transaction table
CREATE TABLE IF NOT EXISTS payment_transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('fee', 'donation', 'other')),
    target_type TEXT CHECK (target_type IN ('candidate', 'weekend_roster') OR target_type IS NULL),
    target_id UUID,
    weekend_id UUID REFERENCES weekends(id),
    payment_intent_id TEXT,
    gross_amount NUMERIC NOT NULL CHECK (gross_amount > 0),
    net_amount NUMERIC,
    stripe_fee NUMERIC,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'cash', 'check')),
    payment_owner TEXT,
    notes TEXT,
    charge_id TEXT,
    balance_transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes created:
-- idx_payment_transaction_target_type
-- idx_payment_transaction_target_id
-- idx_payment_transaction_weekend_id
-- idx_payment_transaction_payment_intent_id
-- idx_payment_transaction_created_at
-- idx_payment_transaction_charge_id

-- RLS enabled with full CRUD for authenticated users
ALTER TABLE payment_transaction ENABLE ROW LEVEL SECURITY;
-- Policies: SELECT, INSERT, UPDATE, DELETE for authenticated role
```

### CLI Output: yarn db:reset

```
Applying migration 20260207200000_create_payment_transaction.sql...
```

### CLI Output: yarn db:generate

```
$ supabase gen types typescript --local > database.types.ts
Connecting to db 5432
Done in 1.10s.
```

### TypeScript Types Generated

From `database.types.ts` (lines 578-639):

```typescript
payment_transaction: {
  Row: {
    balance_transaction_id: string | null
    charge_id: string | null
    created_at: string | null
    gross_amount: number
    id: string
    net_amount: number | null
    notes: string | null
    payment_intent_id: string | null
    payment_method: string
    payment_owner: string | null
    stripe_fee: number | null
    target_id: string | null
    target_type: string | null
    type: string
    weekend_id: string | null
  }
  // Insert and Update types also generated
  Relationships: [
    {
      foreignKeyName: "payment_transaction_weekend_id_fkey"
      columns: ["weekend_id"]
      referencedRelation: "weekends"
      referencedColumns: ["id"]
    }
  ]
}
```

---

## Task 2.0: Create Deposits Tables Schema

### Migration File Created

**File:** `supabase/migrations/20260207200001_create_deposits_tables.sql`

```sql
-- Create deposits table
CREATE TABLE IF NOT EXISTS deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposit_type TEXT NOT NULL CHECK (deposit_type IN ('stripe_payout', 'manual')),
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_transit', 'paid', 'canceled', 'failed', 'completed')),
    arrival_date TIMESTAMPTZ,
    transaction_count INTEGER NOT NULL DEFAULT 0,
    payout_id TEXT UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create deposit_payments join table
CREATE TABLE IF NOT EXISTS deposit_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposit_id UUID NOT NULL REFERENCES deposits(id) ON DELETE CASCADE,
    payment_transaction_id UUID NOT NULL REFERENCES payment_transaction(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(deposit_id, payment_transaction_id)
);

-- RLS enabled with full CRUD for authenticated users on both tables
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_payments ENABLE ROW LEVEL SECURITY;
-- Policies: SELECT, INSERT, UPDATE, DELETE for authenticated role on both tables
```

### CLI Output: yarn db:reset

```
Applying migration 20260207200001_create_deposits_tables.sql...
```

### TypeScript Types Generated

From `database.types.ts`:

**deposits (lines 401-436):**

```typescript
deposits: {
  Row: {
    amount: number
    arrival_date: string | null
    created_at: string | null
    deposit_type: string
    id: string
    notes: string | null
    payout_id: string | null
    status: string
    transaction_count: number
  }
  // Insert and Update types also generated
}
```

**deposit_payments (lines 365-400):**

```typescript
deposit_payments: {
  Row: {
    created_at: string | null
    deposit_id: string
    id: string
    payment_transaction_id: string
  }
  Relationships: [
    {
      foreignKeyName: "deposit_payments_deposit_id_fkey"
      columns: ["deposit_id"]
      referencedRelation: "deposits"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "deposit_payments_payment_transaction_id_fkey"
      columns: ["payment_transaction_id"]
      referencedRelation: "payment_transaction"
      referencedColumns: ["id"]
    }
  ]
}
```

---

## Task 3.0: Migrate Existing Payment Data

### Migration File Created

**File:** `supabase/migrations/20260207200002_migrate_payment_data.sql`

Contains:

1. Migration of `candidate_payments` → `payment_transaction`
2. Migration of `weekend_roster_payments` → `payment_transaction`
3. Migration of `online_payment_payouts` → `deposits`
4. Migration of `online_payment_payout_transactions` → `deposit_payments`
5. Deprecation comments on old tables

### CLI Output: yarn db:reset

```
Applying migration 20260207200002_migrate_payment_data.sql...
Seeding data from supabase/seed.sql...
```

### Deprecation Comments Added

```sql
COMMENT ON TABLE candidate_payments IS
    'DEPRECATED: Use payment_transaction table instead. This table is preserved for historical reference only.';

COMMENT ON TABLE weekend_roster_payments IS
    'DEPRECATED: Use payment_transaction table instead. This table is preserved for historical reference only.';

COMMENT ON TABLE online_payment_payouts IS
    'DEPRECATED: Use deposits table instead. This table is preserved for historical reference only.';

COMMENT ON TABLE online_payment_payout_transactions IS
    'DEPRECATED: Use deposit_payments table instead. This table is preserved for historical reference only.';
```

---

## Build Verification

### CLI Output: yarn build

```
$ next build
▲ Next.js 16.1.3 (Turbopack)
✓ Compiled successfully in 9.4s
✓ Generating static pages using 7 workers (42/42) in 399.4ms
Done in 30.66s.
```

**Result:** Build succeeded with no TypeScript errors.

---

## Summary

| Task | Migration File                                   | Types Generated               | Build Passes |
| ---- | ------------------------------------------------ | ----------------------------- | ------------ |
| 1.0  | ✅ 20260207200000_create_payment_transaction.sql | ✅ payment_transaction        | ✅           |
| 2.0  | ✅ 20260207200001_create_deposits_tables.sql     | ✅ deposits, deposit_payments | ✅           |
| 3.0  | ✅ 20260207200002_migrate_payment_data.sql       | N/A (data only)               | ✅           |

All three schema tasks completed successfully.
