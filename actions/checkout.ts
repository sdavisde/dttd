'use server'

import { headers } from 'next/headers'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

/**
 * Begins a checkout session for a given price id
 * @param priceId The price id tied to a product in Stripe to buy
 * @returns The client secret for the checkout session
 */
export async function beginCheckout(priceId: string): Promise<string> {
  const origin = (await headers()).get('origin')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not found while creating checkout session')
  }

  // Create Checkout Sessions from body params.
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [
      {
        // Provide the exact Price ID (for example, price_1234) of
        // the product you want to sell
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      weekendId: '583d593e-07d4-4a36-81dd-a246e2320347',
      candidateId: '123',
      paymentOwnerId: user.id,
      paymentOwnerEmail: user.email ?? '',
    },
    return_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
  })

  if (!session.client_secret) {
    throw new Error('Failed to create checkout session - no client secret defined')
  }

  return session.client_secret
}
