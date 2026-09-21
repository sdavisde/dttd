import Link from 'next/link'
import { isNil } from 'lodash'
import { AlertTriangle, CircleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { SystemAlert } from '@/lib/admin/system-alerts'

type SystemAlertsBannerProps = {
  alerts: SystemAlert[]
}

/**
 * Top-of-dashboard banner for things that are actually broken. Renders nothing
 * when the list is empty — silence is the healthy state. Copy comes from
 * `deriveSystemAlerts`, which never carries raw error text or secrets.
 */
export function SystemAlertsBanner({ alerts }: SystemAlertsBannerProps) {
  if (alerts.length === 0) return null

  return (
    <section className="mb-6 space-y-3" aria-label="System alerts">
      {alerts.map((alert) => {
        const isError = alert.severity === 'error'
        const Icon = isError ? CircleAlert : AlertTriangle
        return (
          <Alert
            key={alert.key}
            variant={isError ? 'destructive' : 'default'}
            className={
              isError
                ? 'border-destructive/40 bg-destructive/5'
                : 'border-warning/50 bg-warning/10'
            }
          >
            <Icon />
            <AlertTitle className="line-clamp-none">{alert.title}</AlertTitle>
            <AlertDescription className="gap-2">
              <p>{alert.impact}</p>
              <p>{alert.action}</p>
              {!isNil(alert.href) && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="mt-1 w-full sm:w-auto"
                >
                  <Link href={alert.href}>
                    {alert.linkLabel ?? 'Open'} &rarr;
                  </Link>
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )
      })}
    </section>
  )
}
