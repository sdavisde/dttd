import 'server-only'

import Stripe from 'stripe'
import { isNil } from 'lodash'

if (isNil(process.env.STRIPE_SECRET_KEY)) {
  throw new Error('Missing Stripe secret key')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
