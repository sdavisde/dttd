'use client'

import Checkout from '@/components/checkout'

// todo:
// - Need to think about how customers will get here, which is either via email link or by button on site for them to pay
//   - either way, the link should provide who the payment is for on the weekend
//   - Should be a query parameter with the price id that would be purchased.
//   - Should be a query parameter with the weekend id that the payment is for.
//   - I'm thinking it would be good to have just enough info in the link such that this page is responsible for:
//     - Creating the product / price in stripe to buy
//     - Rendering the checkout form
export default function PaymentPage() {
  return (
    <div className='payment-page'>
      <Checkout />
    </div>
  )
}
