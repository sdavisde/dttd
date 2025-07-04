'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

/**
 * Begins a checkout session for a given price id
 * @param priceId The price id tied to a product in Stripe to buy
 * @param metadata Object containing metadata for the checkout session
 * @returns The client secret for the checkout session
 */
export async function beginCheckout(
  priceId: string,
  returnUrl: string,
  metadata: Record<string, string | undefined>
): Promise<string> {
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
      ...metadata,
      userId: user.id,
      userEmail: user.email ?? '',
    },
    return_url: returnUrl,
  })

  if (!session.client_secret) {
    throw new Error('Failed to create checkout session - no client secret defined')
  }

  return session.client_secret
}
