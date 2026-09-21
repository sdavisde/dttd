import { Card, CardContent } from '@/components/ui/card'
import { Results } from '@/lib/results'
import { getCandidateFee, getTeamFee } from '@/services/payment/payment-service'
import type { PriceInfo } from '@/services/payment/types'
import { SettingRow } from './setting-row'

/**
 * Read-only by design: the amounts still live in Stripe, so this card shows
 * what Stripe currently says and points at where to change it. Fetched
 * independently of the rest of the page so a slow or unreachable Stripe only
 * costs this one card.
 */
export async function FeesCard() {
  const [candidateFeeResult, teamFeeResult] = await Promise.all([
    getCandidateFee(),
    getTeamFee(),
  ])

  return (
    <Card className="gap-0 py-0">
      <CardContent className="px-5 py-4">
        <h2 className="pb-1 font-serif text-lg font-semibold tracking-tight">
          Fees
        </h2>
        <SettingRow
          title="Candidate fee"
          subtitle="Charged to the candidate or their sponsor"
        >
          <FeeAmount result={candidateFeeResult} />
        </SettingRow>
        <SettingRow
          title="Team fee"
          subtitle="Charged to each team member serving a weekend"
        >
          <FeeAmount result={teamFeeResult} />
        </SettingRow>
        <p className="pt-3 text-[13px] text-muted-foreground">
          Fee amounts are managed in Stripe for now — change them there and
          they&apos;ll show up here.
        </p>
      </CardContent>
    </Card>
  )
}

function FeeAmount({
  result,
}: {
  result: Awaited<ReturnType<typeof getCandidateFee>>
}) {
  const price = Results.toNullable(result)

  if (price === null || price.unitAmount === null) {
    return (
      <span className="text-[13px] text-muted-foreground">
        Unavailable right now
      </span>
    )
  }

  return (
    <span className="text-[15px] font-semibold tabular-nums">
      {formatPrice(price)}
    </span>
  )
}

function formatPrice(price: PriceInfo): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: (price.unitAmount ?? 0) % 100 === 0 ? 0 : 2,
  }).format((price.unitAmount ?? 0) / 100)
}

/** Placeholder shown while Stripe is being asked for the current amounts. */
export function FeesCardSkeleton() {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="px-5 py-4">
        <h2 className="pb-1 font-serif text-lg font-semibold tracking-tight">
          Fees
        </h2>
        <SettingRow
          title="Candidate fee"
          subtitle="Charged to the candidate or their sponsor"
        >
          <span className="text-[13px] text-muted-foreground">Loading…</span>
        </SettingRow>
        <SettingRow
          title="Team fee"
          subtitle="Charged to each team member serving a weekend"
        >
          <span className="text-[13px] text-muted-foreground">Loading…</span>
        </SettingRow>
      </CardContent>
    </Card>
  )
}
