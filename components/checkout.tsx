'use client'
import { loadStripe } from '@stripe/stripe-js'
import { beginCheckout } from '@/actions/checkout'
import { useSession } from './auth/session-provider'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Typography } from './ui/typography'
import { logger } from '@/lib/logger'

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing Stripe publishable key')
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

interface CheckoutProps {
  priceId: string
  metadata: Record<string, string | undefined>
  returnUrl: string
}

export default function Checkout({
  priceId,
  metadata,
  returnUrl,
}: CheckoutProps) {
  const { user, loading: loadingUser } = useSession()
  const checkoutRef = useRef<any>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch client secret when user is available
  useEffect(() => {
    if (loadingUser || !user) return

    let isMounted = true

    const fetchClientSecret = async () => {
      try {
        setCheckoutLoading(true)
        setError(null)

        const checkoutMetadata = {
          ...metadata,
          user_id: user.id,
          user_email: user.email,
        }

        const secret = await beginCheckout(priceId, returnUrl, checkoutMetadata)
        if (isMounted) {
          setClientSecret(secret)
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to initialize checkout'
          )
        }
      } finally {
        if (isMounted) {
          setCheckoutLoading(false)
        }
      }
    }

    fetchClientSecret()

    return () => {
      isMounted = false
    }
  }, [loadingUser, user, priceId, returnUrl, metadata])

  // Initialize and cleanup Stripe checkout
  useEffect(() => {
    async function initializeCheckout() {
      if (!clientSecret) return

      try {
        const stripe = await stripePromise
        if (!stripe) return

        // Destroy existing checkout instance if it exists
        if (checkoutRef.current) {
          checkoutRef.current.destroy()
          checkoutRef.current = null
        }

        const checkout = await stripe.initEmbeddedCheckout({
          clientSecret,
        })

        checkout.mount('#checkout-container')
        checkoutRef.current = checkout
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to initialize Stripe checkout'
        )
      }
    }

    initializeCheckout()

    // Cleanup function: destroy the embedded checkout instance
    return () => {
      if (checkoutRef.current) {
        checkoutRef.current.destroy()
        checkoutRef.current = null
      }
    }
  }, [clientSecret])

  // Show loading spinner while user is loading or checkout is initializing
  if (loadingUser || checkoutLoading || (!clientSecret && !error)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    )
  }

  // Show error state
  if (error) {
    logger.error(
      `Checkout error - userId: ${user?.id}, email: ${user?.email}, error: ${error}`
    )
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Typography variant="h5" className="text-red-600 text-center">
          Something went wrong
        </Typography>
        <p className="text-sm mt-2 text-red-600 text-center">
          Please contact sdavisde@gmail.com if you see this message
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div id="checkout-container" className="w-full h-full">
        {/* Stripe Embedded Checkout will be mounted here */}
      </div>
    </div>
  )
}
