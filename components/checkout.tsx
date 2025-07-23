'use client'

import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { beginCheckout } from '@/actions/checkout'
import { useSession } from './auth/session-provider'
import { Loader2 } from 'lucide-react'

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing Stripe publishable key')
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

interface CheckoutProps {
  priceId: string
  metadata: Record<string, string | undefined>
  returnUrl: string
}

export default function Checkout({ priceId, metadata, returnUrl }: CheckoutProps) {
  const { user, loading: loadingUser } = useSession()

  if (loadingUser) {
    return (
      <div className='h-screen w-screen flex items-center justify-center'>
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    )
  }

  const checkoutMetadata = {
    ...metadata,
    user_id: user?.id ?? '',
    user_email: user?.email ?? '',
  }
  const fetchClientSecret = async () => beginCheckout(priceId, returnUrl, checkoutMetadata)

  return (
    <div id='checkout'>
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
