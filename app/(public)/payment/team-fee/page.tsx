import Checkout from '@/components/checkout'
import { notFound } from 'next/navigation'
import { logger } from '@/lib/logger'
import { getUrl } from '@/lib/url'
import { getWeekendRosterRecord } from '@/actions/weekend'
import { getLoggedInUser } from '@/actions/users'
import { isErr } from '@/lib/results'
import { Stack, Typography } from '@mui/material'
import { Error } from '@mui/icons-material'

interface TeamFeesPaymentPageProps {
  searchParams: Promise<{
    weekend_id: string
  }>
}

export default async function TeamFeesPaymentPage({ searchParams }: TeamFeesPaymentPageProps) {
  const teamFeePriceId = process.env.TEAM_FEE_PRICE_ID
  if (!teamFeePriceId) {
    logger.error('Missing team fee price id')
    return notFound()
  }

  const weekend_id = (await searchParams).weekend_id

  if (!weekend_id) {
    logger.error('Missing weekend id query parameter')
    return notFound()
  }

  const userResult = await getLoggedInUser()
  const user = userResult?.data
  if (isErr(userResult) || !user) {
    logger.error('User not found')
    return notFound()
  }

  const weekendRosterRecord = await getWeekendRosterRecord(user.id, weekend_id)
  if (isErr(weekendRosterRecord)) {
    logger.error('Error fetching weekend roster record', weekendRosterRecord.error)
    return (
      <Stack className='h-[80vh] w-screen flex items-center justify-center'>
        <Error sx={{ fontSize: 75, color: '#940c0a', marginBottom: 2 }} />
        <Typography variant='h6'>It doesn&apos;t look like you&apos;re registered for the weekend yet.</Typography>
        <Typography variant='body1'>Please contact your Rector to ensure you&apos;re on the roster.</Typography>
        <Typography
          variant='body1'
          mt={2}
          display='flex'
          flexDirection='column'
          alignItems='center'
        >
          If this issue persists, please contact Sean Davis at 214-799-7708 or sdavisde@gmail.com
          <br />
          <span>for assistance in paying your team fees.</span>
        </Typography>
      </Stack>
    )
  }

  return (
    <div className='payment-page'>
      <Checkout
        priceId={teamFeePriceId}
        metadata={{ weekend_id }}
        returnUrl={getUrl('/payment/team-fee/success?session_id={CHECKOUT_SESSION_ID}')}
      />
    </div>
  )
}
