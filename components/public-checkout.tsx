'use client'
import { loadStripe } from '@stripe/stripe-js'
import { beginCheckout } from '@/actions/checkout'
import { isErr } from '@/lib/results'
import type { CheckoutTarget } from '@/lib/payments/checkout-price'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Typography } from './ui/typography'
import { logger } from '@/lib/logger'
import { isNil } from 'lodash'

if (isNil(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)) {
  throw new Error('Missing Stripe publishable key')
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

interface PublicCheckoutProps {
  /** Who the payment is for. The server works out the amount. */
  target: CheckoutTarget
  returnUrl: string
}

/**
 * A checkout component for public pages that don't require authentication.
 * Unlike the regular Checkout component, this doesn't wait for a user session.
 */
export default function PublicCheckout({
  target,
  returnUrl,
}: PublicCheckoutProps) {
  const checkoutRef = useRef<any>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const targetId =
    target.kind === 'team' ? target.groupMemberId : target.candidateId

  // Fetch client secret immediately (no auth required)
  useEffect(() => {
    let isMounted = true

    const fetchClientSecret = async () => {
      try {
        setCheckoutLoading(true)
        setError(null)

        const result = await beginCheckout(target, returnUrl)
        if (!isMounted) return
        if (isErr(result)) {
          setError(result.error)
        } else {
          setClientSecret(result.data)
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
    // `target` is rebuilt from props each render; key the effect on its id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.kind, targetId, returnUrl])

  // Initialize and cleanup Stripe checkout
  useEffect(() => {
    async function initializeCheckout() {
      if (isNil(clientSecret)) return

      try {
        const stripe = await stripePromise
        if (isNil(stripe)) return

        // Destroy existing checkout instance if it exists
        if (!isNil(checkoutRef.current)) {
          checkoutRef.current.destroy()
          checkoutRef.current = null
        }

        const checkout = await stripe.createEmbeddedCheckoutPage({
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
      if (!isNil(checkoutRef.current)) {
        checkoutRef.current.destroy()
        checkoutRef.current = null
      }
    }
  }, [clientSecret])

  // Show loading spinner while checkout is initializing
  if (checkoutLoading || (isNil(clientSecret) && isNil(error))) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    )
  }

  // Show error state
  if (!isNil(error)) {
    logger.error(`PublicCheckout error: ${error}`)
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center">
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
