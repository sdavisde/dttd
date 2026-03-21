# 09 Questions Round 1 - Payment Transaction Refactor

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Payment Type Field Values

The `type` field distinguishes the nature of the payment ('fee' vs 'donation'). Should this field be nullable for edge cases, or always required?

- [ ] (A) Always required - every payment must be either 'fee' or 'donation'
- [ ] (B) Nullable - allow null for payments that don't fit either category
- [x] (C) Add a third option like 'other' for edge cases
- [ ] (D) Other (describe)

## 2. Target Type Values

You mentioned `target_type` could be 'candidate' or 'weekend_roster'. For donations, should `target_type` be:

- [x] (A) Always null for donations (donations are general, not tied to a specific entity)
- [ ] (B) Optionally set to 'weekend' if someone donates specifically toward a weekend
- [ ] (C) Allow any target_type including for donations (maximum flexibility)
- [ ] (D) Other (describe)

## 3. Manual Payment Workflow

For the treasurer recording manual deposits (cash/check), should we build a UI for this in this spec, or defer it?

- [x] (A) As part of this spec, create another specthat would allow for this functionality. The way i was imagining this is that in some new "Weekend Payments" page, the treasurer would be able to press "+ Record Deposit" and a modal would appear that lets them enter the amount they're depositing (and general info), then type the name(s) of the person the deposit is for (candidate or team member name), and if they already have a transaction that would be used, else this flow would create that transaction record before creating the deposit. This process would be repeated for however many people are part of the deposit.
- [ ] (B) Defer deposit UI to a future spec - focus on the data model and webhook integration first
- [ ] (C) Other (describe)

## 4. Data Migration Strategy

For migrating existing `candidate_payments` and `weekend_roster_payments` data:

- [ ] (A) Migrate all historical data to the new `payment_transaction` table and drop old tables in same migration
- [x] (B) Migrate data, keep old tables temporarily (with deprecation notice), drop in future migration
- [ ] (C) Only migrate data from a certain date forward, archive older data separately
- [ ] (D) Other (describe)

## 5. Payment Service - RLS Bypass Implementation

For the `dangerouslyBypassRLS` option in the payment service, how should this be implemented?

- [x] (A) Create an admin Supabase client within the repository when the flag is true. There should be a helper function to create the client.
- [ ] (B) Accept an optional Supabase client parameter (caller provides admin client when needed)
- [ ] (C) Use service role key in repository when flag is true
- [ ] (D) Other (describe)

## 6. Deposit Status Values

For the `deposits.status` field, what statuses should be supported?

- [ ] (A) 'pending', 'in_transit', 'completed' (simple set for both Stripe and manual)
- [x] (B) Match Stripe's statuses exactly: 'pending', 'in_transit', 'paid', 'canceled', 'failed' (for Stripe deposits), plus 'completed' for manual
- [ ] (C) Have separate status sets for Stripe vs manual deposits
- [ ] (D) Other (describe)

## 7. Existing Payout Tracking Tables

The current `online_payment_payouts` and `online_payment_payout_transactions` tables track Stripe payouts. Should we:

- [x] (A) Drop both tables and consolidate into just `deposits` and `deposit_payments`
- [ ] (B) Keep `online_payment_payouts` as a Stripe-specific audit table, but use `deposits` + `deposit_payments` as the primary tracking
- [ ] (C) Rename `online_payment_payouts` to `deposits` and update `online_payment_payout_transactions` to `deposit_payments`
- [ ] (D) Other (describe)
