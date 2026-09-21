import {
  CreatePaymentSchema,
  RecordAdminPaymentSchema,
  ReassignPaymentSchema,
  UpdatePaymentDetailsSchema,
  VoidPaymentSchema,
} from './types'

const PAYMENT_ID = '11111111-1111-1111-1111-111111111111'
const TARGET_ID = '22222222-2222-2222-2222-222222222222'

describe('ReassignPaymentSchema', () => {
  it('accepts a candidate target', () => {
    const result = ReassignPaymentSchema.safeParse({
      paymentId: PAYMENT_ID,
      targetType: 'candidate',
      targetId: TARGET_ID,
    })
    expect(result.success).toBe(true)
  })

  it('accepts a team member target', () => {
    const result = ReassignPaymentSchema.safeParse({
      paymentId: PAYMENT_ID,
      targetType: 'weekend_group_member',
      targetId: TARGET_ID,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a null target — there would be nobody to reassign to', () => {
    const result = ReassignPaymentSchema.safeParse({
      paymentId: PAYMENT_ID,
      targetType: null,
      targetId: TARGET_ID,
    })
    expect(result.success).toBe(false)
  })

  it('rejects a malformed target id', () => {
    const result = ReassignPaymentSchema.safeParse({
      paymentId: PAYMENT_ID,
      targetType: 'candidate',
      targetId: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('does not accept a weekend — it is re-derived from the new target', () => {
    const result = ReassignPaymentSchema.safeParse({
      paymentId: PAYMENT_ID,
      targetType: 'candidate',
      targetId: TARGET_ID,
      weekendId: '33333333-3333-3333-3333-333333333333',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('weekendId')
    }
  })
})

describe('VoidPaymentSchema', () => {
  it('accepts a reason', () => {
    const result = VoidPaymentSchema.safeParse({
      paymentId: PAYMENT_ID,
      reason: 'Check bounced',
    })
    expect(result.success).toBe(true)
  })

  it('trims the reason', () => {
    const result = VoidPaymentSchema.safeParse({
      paymentId: PAYMENT_ID,
      reason: '  Entered twice  ',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reason).toBe('Entered twice')
    }
  })

  it('rejects a blank reason — a void must explain itself', () => {
    expect(
      VoidPaymentSchema.safeParse({ paymentId: PAYMENT_ID, reason: '' }).success
    ).toBe(false)
    expect(
      VoidPaymentSchema.safeParse({ paymentId: PAYMENT_ID, reason: '   ' })
        .success
    ).toBe(false)
  })
})

describe('UpdatePaymentDetailsSchema', () => {
  it('accepts a single changed field', () => {
    const result = UpdatePaymentDetailsSchema.safeParse({
      paymentId: PAYMENT_ID,
      grossAmount: 150,
    })
    expect(result.success).toBe(true)
  })

  it('accepts clearing a nullable field', () => {
    const result = UpdatePaymentDetailsSchema.safeParse({
      paymentId: PAYMENT_ID,
      notes: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a non-positive amount', () => {
    expect(
      UpdatePaymentDetailsSchema.safeParse({
        paymentId: PAYMENT_ID,
        grossAmount: 0,
      }).success
    ).toBe(false)
    expect(
      UpdatePaymentDetailsSchema.safeParse({
        paymentId: PAYMENT_ID,
        grossAmount: -25,
      }).success
    ).toBe(false)
  })

  it('rejects an update with nothing to change', () => {
    const result = UpdatePaymentDetailsSchema.safeParse({
      paymentId: PAYMENT_ID,
    })
    expect(result.success).toBe(false)
  })
})

describe('waived payments', () => {
  const waivedFee = {
    type: 'fee' as const,
    target_type: 'candidate' as const,
    target_id: TARGET_ID,
    gross_amount: 185,
    payment_method: 'waived' as const,
  }

  it('accepts a waived fee for a person', () => {
    expect(CreatePaymentSchema.safeParse(waivedFee).success).toBe(true)
  })

  it('rejects a waived donation — only a fee can be waived', () => {
    const result = CreatePaymentSchema.safeParse({
      ...waivedFee,
      type: 'donation',
      target_type: null,
      target_id: null,
    })
    expect(result.success).toBe(false)
  })

  it('rejects Stripe amounts on a waiver', () => {
    const result = CreatePaymentSchema.safeParse({
      ...waivedFee,
      net_amount: 180,
      stripe_fee: 5,
    })
    expect(result.success).toBe(false)
  })
})

describe('RecordAdminPaymentSchema', () => {
  const input = {
    targetType: 'weekend_group_member' as const,
    targetId: TARGET_ID,
    amount: 185,
    method: 'check' as const,
    paidBy: '  Ann Simmons ',
    notes: 'Check #1234',
  }

  it('accepts cash, check and waived, trimming the payer', () => {
    const result = RecordAdminPaymentSchema.safeParse(input)
    expect(result.success).toBe(true)
    expect(result.data?.paidBy).toBe('Ann Simmons')
    expect(
      RecordAdminPaymentSchema.safeParse({ ...input, method: 'waived' }).success
    ).toBe(true)
  })

  it('rejects stripe — card payments only arrive via the webhook', () => {
    expect(
      RecordAdminPaymentSchema.safeParse({ ...input, method: 'stripe' }).success
    ).toBe(false)
  })

  it('rejects a zero amount', () => {
    expect(
      RecordAdminPaymentSchema.safeParse({ ...input, amount: 0 }).success
    ).toBe(false)
  })
})
