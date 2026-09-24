import { isNil } from 'lodash'

// Pure derivation for the admin dashboard's alert banner. No server imports so
// the whole module stays unit-testable in Jest.
//
// Rule of the banner: it only speaks up about something an admin can act on or
// that is already hurting people using the site. Every string here is written
// for a non-technical board member — raw errors and secrets are logged by the
// caller, never rendered.

export type SystemAlertSeverity = 'error' | 'warning'

export type SystemAlertKey =
  | 'stripe-fees'
  | 'stripe-checkout'
  | 'stripe-webhook'
  | 'email'
  | 'site-url'
  | 'no-active-weekend'
  | 'degraded-data'

export type SystemAlert = {
  key: SystemAlertKey
  severity: SystemAlertSeverity
  /** Headline, safe to render. */
  title: string
  /** What is actually broken for people using the site, in plain English. */
  impact: string
  /** The next step whoever is reading this should take. */
  action: string
  href?: string
  linkLabel?: string
}

export type SystemAlertChecks = {
  /**
   * False when the Stripe fee prices could not be read (missing price ID or a
   * Stripe failure). Null when the check never ran — e.g. the payments source
   * failed first — in which case `degradedSources` carries the story instead.
   */
  stripeFeesConfigured: boolean | null
  /**
   * False when no weekend group is ACTIVE. Null when the weekends source
   * itself failed, which is a degraded source rather than a missing group.
   */
  activeWeekendGroup: boolean | null
  /** False when the public Stripe key the checkout form needs is missing. */
  stripeCheckoutConfigured: boolean
  /** False when the Stripe webhook secret is missing from the environment. */
  stripeWebhookConfigured: boolean
  /** False when the email service credentials are missing from the environment. */
  emailConfigured: boolean
  /** False when the site's public address is missing, which breaks emailed links. */
  siteUrlConfigured: boolean
  /**
   * Friendly names of dashboard panels whose data failed to load, e.g.
   * `['Payments', 'Community roster']`. Never raw error text.
   */
  degradedSources: string[]
}

/** Joins source names into "A", "A and B", or "A, B, and C". */
function listSources(sources: string[]): string {
  if (sources.length === 1) return sources[0]
  if (sources.length === 2) return `${sources[0]} and ${sources[1]}`
  return `${sources.slice(0, -1).join(', ')}, and ${sources[sources.length - 1]}`
}

/**
 * Turns independent check results into the banner's alert list, most severe
 * first. An empty list means the banner renders nothing.
 */
export function deriveSystemAlerts({
  stripeFeesConfigured,
  activeWeekendGroup,
  stripeCheckoutConfigured,
  stripeWebhookConfigured,
  emailConfigured,
  siteUrlConfigured,
  degradedSources,
}: SystemAlertChecks): SystemAlert[] {
  const alerts: SystemAlert[] = []

  if (stripeFeesConfigured === false) {
    alerts.push({
      key: 'stripe-fees',
      severity: 'error',
      title: "Weekend fees can't be read from Stripe",
      impact:
        "Nobody knows what a team or candidate fee costs right now, so outstanding balances can't be calculated and people may not be able to pay online.",
      action: 'Ask a developer to check the Stripe fee price setup.',
    })
  }

  if (!stripeCheckoutConfigured) {
    alerts.push({
      key: 'stripe-checkout',
      severity: 'error',
      title: "The card payment form can't load",
      impact:
        'Anyone who opens a team or candidate fee payment page gets an error instead of a way to pay.',
      action: 'Ask a developer to restore the public Stripe key.',
    })
  }

  if (!stripeWebhookConfigured) {
    alerts.push({
      key: 'stripe-webhook',
      severity: 'error',
      title: 'Online payments are not being recorded',
      impact:
        "Someone can pay by card and the site will never mark them paid, so they'll keep being chased for a fee they already covered.",
      action: 'Ask a developer to restore the Stripe webhook setup.',
    })
  }

  if (!emailConfigured) {
    alerts.push({
      key: 'email',
      severity: 'error',
      title: "The site can't send email",
      impact:
        'Sponsorship confirmations, password resets, and notifications are not reaching anyone.',
      action: 'Ask a developer to restore the email service credentials.',
    })
  }

  if (!siteUrlConfigured) {
    alerts.push({
      key: 'site-url',
      severity: 'error',
      title: 'Links the site sends out are broken',
      impact:
        "The site doesn't know its own web address, so password-reset and sponsorship links in email — and the page people land on after paying — point nowhere.",
      action: "Ask a developer to set the site's address.",
    })
  }

  if (activeWeekendGroup === false) {
    alerts.push({
      key: 'no-active-weekend',
      severity: 'warning',
      title: 'No weekend group is active',
      impact:
        "Money tiles, rosters, and the community's weekend hub have nothing to show until a group is marked active.",
      action: 'Open weekend management to activate the next group.',
      href: '/admin/weekends',
      linkLabel: 'Go to weekends',
    })
  }

  if (!isNil(degradedSources) && degradedSources.length > 0) {
    alerts.push({
      key: 'degraded-data',
      severity: 'warning',
      title: "Some information couldn't be loaded",
      impact: `${listSources(degradedSources)} couldn't be read just now, so parts of this page may be incomplete or missing.`,
      action: 'Reload in a moment. If it keeps happening, tell a developer.',
    })
  }

  return alerts
}
