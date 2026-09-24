import { ExternalLink } from 'lucide-react'

type PrayerWheelCardProps = {
  url: string
  /** "Men's" / "Women's" */
  weekendGender: string
}

/**
 * A small card linking to the weekend's prayer-wheel signup, which used to
 * live on the retired current-weekend page.
 */
export function PrayerWheelCard({ url, weekendGender }: PrayerWheelCardProps) {
  return (
    <section className="flex flex-col rounded-lg border bg-card px-5 py-4.5">
      <h2 className="pb-1 font-serif text-lg font-semibold tracking-tight">
        Prayer wheel
      </h2>
      <p className="pb-3 text-sm text-muted-foreground">
        Commit to an hour of prayer while the {weekendGender} weekend is
        underway.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md border bg-card px-4 text-[13.5px] font-semibold text-primary transition-colors hover:bg-muted md:min-h-9"
      >
        Sign up for an hour
        <ExternalLink className="size-4" aria-hidden />
      </a>
    </section>
  )
}
