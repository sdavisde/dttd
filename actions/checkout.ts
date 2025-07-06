'use server'

import { stripe } from '@/lib/stripe'

/**
 * Begins a checkout session for a given price id
 * @param priceId The price id tied to a product in Stripe to buy
 * @param metadata Object containing metadata for the checkout session
 * @returns The client secret for the checkout session
 */
export async function beginCheckout(
  priceId: string,
  returnUrl: string,
  metadata: Record<string, string>
): Promise<string> {
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
    metadata,
    return_url: returnUrl,
  })

  if (!session.client_secret) {
    throw new Error('Failed to create checkout session - no client secret defined')
  }

  return session.client_secret
}
